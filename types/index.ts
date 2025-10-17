import {
  UserRole,
  TransactionType,
  DepositStatus,
  ItemRarity,
  TransferStatus,
  TransactionStatus,
  WithdrawalStatus
} from '@prisma/client'

export interface User {
  id: string
  discordId?: string
  email: string
  username: string
  accountNumber: string
  avatar: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface Wallet {
  id: string
  balance: number
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  status: TransactionStatus
  slipImage?: string
  userId: string
  walletId: string
  depositId?: string
  withdrawalId?: string
  purchaseId?: string
  giftId?: string
  transferId?: string
  createdAt: Date
  updatedAt: Date
  user?: User
}

export interface Deposit {
  id: string
  amount: number
  slipImage: string
  status: DepositStatus
  rate: number
  comment?: string
  userId: string
  createdAt: Date
  updatedAt: Date
  user?: User
}

export interface Withdrawal {
  id: string
  amount: number
  status: WithdrawalStatus
  comment?: string
  userId: string
  createdAt: Date
  updatedAt: Date
  user?: User
}

export interface Item {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  category: string
  rarity: ItemRarity
  createdAt: Date
  updatedAt: Date
}

export interface OwnedItem {
  id: string
  userId: string
  itemId: string
  isGifted: boolean
  createdAt: Date
  updatedAt: Date
  item?: Item
}

export interface Purchase {
  id: string
  userId: string
  ownedItemId: string
  createdAt: Date
  updatedAt: Date
  ownedItem?: OwnedItem
}

export interface Gift {
  id: string
  senderId: string
  recipientId: string
  ownedItemId: string
  createdAt: Date
  updatedAt: Date
  sender?: User
  recipient?: User
  ownedItem?: OwnedItem
}

export interface DepositRate {
  id: string
  name: string
  rate: number
  startDate: Date
  endDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Transfer {
  id: string
  amount: number
  status: TransferStatus
  comment?: string
  senderId: string
  receiverId: string
  createdAt: Date
  updatedAt: Date
  sender?: User
  receiver?: User
}

export interface SessionUser {
  id: string
  email: string
  username: string
  role: UserRole
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationResponse {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export interface TransactionResponse {
  transactions: Transaction[]
  pagination: PaginationResponse
}

export interface DepositResponse {
  deposits: Deposit[]
  pagination: PaginationResponse
}

export interface WithdrawalResponse {
  withdrawals: Withdrawal[]
  pagination: PaginationResponse
}

export interface ItemResponse {
  items: Item[]
  pagination: PaginationResponse
}

export interface TransferResponse {
  transfers: Transfer[]
  pagination: PaginationResponse
}

export interface ActivityLog {
  id: string
  userId: string
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'APPROVE' | 'REJECT'
  model: string
  modelId?: string
  oldData?: string
  newData?: string
  description?: string
  ipAddress?: string
  userAgent?: string
  createdAt: Date
  user?: User
}

export interface LoginHistory {
  id: string
  userId: string
  ipAddress: string
  userAgent: string
  success: boolean
  failReason?: string
  createdAt: Date
  user?: User
}

export interface ActivityLogResponse {
  logs: ActivityLog[]
  pagination: PaginationResponse
}

export interface LoginHistoryResponse {
  history: LoginHistory[]
  pagination: PaginationResponse
}
