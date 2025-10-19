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

          // ค้นหา user จาก email, username, หรือ discordId
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.email },
                { username: credentials.email },
                { discordId: credentials.email },
              ],
            },
          })

          if (!user) {
            console.log('❌ [NextAuth] User not found:', credentials.email)
            throw new Error('ไม่พบผู้ใช้นี้ในระบบ')
          }

          console.log('✅ [NextAuth] User found:', { email: user.email, role: user.role })

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
          console.error('❌ [NextAuth] Authorization error:', error)
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

