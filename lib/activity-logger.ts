import { prisma } from './prisma'
import { ActivityAction } from '@prisma/client'

interface LogActivityParams {
  userId: string
  action: ActivityAction
  model: string
  modelId?: string
  oldData?: any
  newData?: any
  description?: string
  ipAddress?: string
  userAgent?: string
}

export async function logActivity({
  userId,
  action,
  model,
  modelId,
  oldData,
  newData,
  description,
  ipAddress,
  userAgent,
}: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        model,
        modelId,
        oldData: oldData ? JSON.stringify(oldData) : null,
        newData: newData ? JSON.stringify(newData) : null,
        description,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    console.error('Error logging activity:', error)
    // ไม่ throw error เพื่อไม่ให้กระทบการทำงานหลัก
  }
}

export async function logLogin(
  userId: string,
  success: boolean,
  ipAddress: string,
  userAgent: string,
  failReason?: string
) {
  try {
    await prisma.loginHistory.create({
      data: {
        userId,
        success,
        ipAddress,
        userAgent,
        failReason,
      },
    })
  } catch (error) {
    console.error('Error logging login:', error)
  }
}

// Helper functions สำหรับการใช้งาน
export const ActivityLogger = {
  // User activities
  userCreated: (userId: string, data: any, ip?: string, ua?: string) =>
    logActivity({
      userId,
      action: 'CREATE',
      model: 'User',
      modelId: data.id,
      newData: data,
      description: `สร้างผู้ใช้ใหม่: ${data.username}`,
      ipAddress: ip,
      userAgent: ua,
    }),

  userUpdated: (userId: string, modelId: string, oldData: any, newData: any, ip?: string, ua?: string) =>
    logActivity({
      userId,
      action: 'UPDATE',
      model: 'User',
      modelId,
      oldData,
      newData,
      description: `แก้ไขข้อมูลผู้ใช้`,
      ipAddress: ip,
      userAgent: ua,
    }),

  userDeleted: (userId: string, modelId: string, data: any, ip?: string, ua?: string) =>
    logActivity({
      userId,
      action: 'DELETE',
      model: 'User',
      modelId,
      oldData: data,
      description: `ลบผู้ใช้: ${data.username}`,
      ipAddress: ip,
      userAgent: ua,
    }),

  // Deposit activities
  depositCreated: (userId: string, data: any, ip?: string, ua?: string) =>
    logActivity({
      userId,
      action: 'CREATE',
      model: 'Deposit',
      modelId: data.id,
      newData: data,
      description: `สร้างคำขอฝากเงิน ${data.amount} บาท`,
      ipAddress: ip,
      userAgent: ua,
    }),

  depositApproved: (userId: string, modelId: string, data: any, ip?: string, ua?: string) =>
    logActivity({
      userId,
      action: 'APPROVE',
      model: 'Deposit',
      modelId,
      newData: data,
      description: `อนุมัติคำขอฝากเงิน ${data.amount} บาท`,
      ipAddress: ip,
      userAgent: ua,
    }),

  depositRejected: (userId: string, modelId: string, data: any, ip?: string, ua?: string) =>
    logActivity({
      userId,
      action: 'REJECT',
      model: 'Deposit',
      modelId,
      newData: data,
      description: `ปฏิเสธคำขอฝากเงิน ${data.amount} บาท`,
      ipAddress: ip,
      userAgent: ua,
    }),

  // Withdrawal activities
  withdrawalCreated: (userId: string, data: any, ip?: string, ua?: string) =>
    logActivity({
      userId,
      action: 'CREATE',
      model: 'Withdrawal',
      modelId: data.id,
      newData: data,
      description: `สร้างคำขอถอนเงิน ${data.amount} บาท`,
      ipAddress: ip,
      userAgent: ua,
    }),

  withdrawalApproved: (userId: string, modelId: string, data: any, ip?: string, ua?: string) =>
    logActivity({
      userId,
      action: 'APPROVE',
      model: 'Withdrawal',
      modelId,
      newData: data,
      description: `อนุมัติคำขอถอนเงิน ${data.amount} บาท`,
      ipAddress: ip,
      userAgent: ua,
    }),

  withdrawalRejected: (userId: string, modelId: string, data: any, ip?: string, ua?: string) =>
    logActivity({
      userId,
      action: 'REJECT',
      model: 'Withdrawal',
      modelId,
      newData: data,
      description: `ปฏิเสธคำขอถอนเงิน ${data.amount} บาท`,
      ipAddress: ip,
      userAgent: ua,
    }),

  // Item activities
  itemCreated: (userId: string, data: any, ip?: string, ua?: string) =>
    logActivity({
      userId,
      action: 'CREATE',
      model: 'Item',
      modelId: data.id,
      newData: data,
      description: `สร้างไอเทม: ${data.name}`,
      ipAddress: ip,
      userAgent: ua,
    }),

  itemUpdated: (userId: string, modelId: string, oldData: any, newData: any, ip?: string, ua?: string) =>
    logActivity({
      userId,
      action: 'UPDATE',
      model: 'Item',
      modelId,
      oldData,
      newData,
      description: `แก้ไขไอเทม: ${newData.name}`,
      ipAddress: ip,
      userAgent: ua,
    }),

  itemDeleted: (userId: string, modelId: string, data: any, ip?: string, ua?: string) =>
    logActivity({
      userId,
      action: 'DELETE',
      model: 'Item',
      modelId,
      oldData: data,
      description: `ลบไอเทม: ${data.name}`,
      ipAddress: ip,
      userAgent: ua,
    }),

  // Purchase activities
  itemPurchased: (userId: string, data: any, ip?: string, ua?: string) =>
    logActivity({
      userId,
      action: 'CREATE',
      model: 'Purchase',
      modelId: data.id,
      newData: data,
      description: `ซื้อไอเทม`,
      ipAddress: ip,
      userAgent: ua,
    }),

  // Gift activities
  giftSent: (userId: string, data: any, ip?: string, ua?: string) =>
    logActivity({
      userId,
      action: 'CREATE',
      model: 'Gift',
      modelId: data.id,
      newData: data,
      description: `ส่งของขวัญ`,
      ipAddress: ip,
      userAgent: ua,
    }),

  // Transfer activities
  transferCreated: (userId: string, data: any, ip?: string, ua?: string) =>
    logActivity({
      userId,
      action: 'CREATE',
      model: 'Transfer',
      modelId: data.id,
      newData: data,
      description: `โอนเงิน ${data.amount} บาท`,
      ipAddress: ip,
      userAgent: ua,
    }),

  // Login activities
  loginSuccess: (userId: string, ip: string, ua: string) =>
    logLogin(userId, true, ip, ua),

  loginFailed: (userId: string, ip: string, ua: string, reason: string) =>
    logLogin(userId, false, ip, ua, reason),
}

