import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { UserRole } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email / Username / Discord ID', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('🔐 [NextAuth] Authorize called with:', { email: credentials?.email })

          if (!credentials?.email || !credentials?.password) {
            console.log('❌ [NextAuth] Missing credentials')
            throw new Error('กรุณากรอกข้อมูลและรหัสผ่าน')
          }

          // ค้นหา user ปกติก่อน
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.email },
                { username: credentials.email },
                { discordId: credentials.email },
              ],
            },
          })

          // หากไม่พบ user ปกติ ให้ค้นหา admin
          if (!user) {
            const adminUser = await prisma.adminUser.findFirst({
              where: {
                OR: [
                  { email: credentials.email },
                  { username: credentials.email },
                ],
              },
            })

            if (!adminUser) {
              console.log('❌ [NextAuth] User not found:', credentials.email)
              throw new Error('ไม่พบผู้ใช้นี้ในระบบ')
            }

            console.log('✅ [NextAuth] Admin found:', { email: adminUser.email })

            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              adminUser.password
            )

            if (!isPasswordValid) {
              console.log('❌ [NextAuth] Password invalid for admin:', adminUser.email)
              throw new Error('รหัสผ่านไม่ถูกต้อง')
            }

            console.log('✅ [NextAuth] Admin login successful for:', adminUser.email)

            return {
              id: adminUser.id,
              email: adminUser.email,
              name: adminUser.username,
              role: 'ADMIN' as UserRole,
            }
          }

          console.log('✅ [NextAuth] User found:', { email: user.email, role: user.role })

          // ตรวจสอบว่า user ถูก block หรือไม่
          if (user.isBlocked) {
            // ตรวจสอบว่าหมดเวลา block แล้วหรือยัง
            if (user.blockedUntil && new Date() >= new Date(user.blockedUntil)) {
              // หมดเวลา block แล้ว ปลดบล็อกอัตโนมัติ
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  isBlocked: false,
                  blockedReason: null,
                  blockedAt: null,
                  blockedUntil: null,
                  blockedBy: null,
                },
              })
              console.log('✅ [NextAuth] User auto-unblocked (block period expired):', user.email)
            } else {
              // ยังอยู่ในช่วงเวลา block
              const blockedUntilDate = user.blockedUntil ? new Date(user.blockedUntil).toLocaleDateString('th-TH') : 'ไม่ระบุ'
              console.log('❌ [NextAuth] User is blocked:', user.email)
              throw new Error(`บัญชีของคุณถูกระงับการใช้งานจนถึง ${blockedUntilDate}\nเหตุผล: ${user.blockedReason || 'ไม่ระบุ'}`)
            }
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log('❌ [NextAuth] Password invalid for:', user.email)
            throw new Error('รหัสผ่านไม่ถูกต้อง')
          }

          console.log('✅ [NextAuth] Login successful for:', user.email)

          return {
            id: user.id,
            email: user.email,
            name: user.username,
            role: user.role,
          }
        } catch (error) {
          console.error('❌ [NextAuth] Authorization ', error)
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

