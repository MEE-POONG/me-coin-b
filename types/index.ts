import { Transfer, Gift, Purchase, OwnedItem, Deposit, Transaction, User, Wallet, Withdrawal, ActivityLog, LoginHistory, Item, Prisma, AdminUser, GalleryDB } from "@prisma/client";
export interface PaginationResponse {
  page: number;
  pageSize: number;
  currentPage: number;
  keyword: string;
  typeKeyword?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
  typeSearch?: string;
  totalItems?: number;
  totalPages: number;
  isActive?: boolean;
  isDeleted?: boolean;
}
/** ---- กลุ่ม WithRelations (ประกอบจากชนิดของ Prisma ล้วน ๆ) ---- */

/** OwnedItem พร้อมข้อมูล Item แบบเต็ม (หรือจะ Pick บางฟิลด์ก็ได้) */
export interface OwnedItemWithItem extends OwnedItem {
  item: Item
}

/** Purchase -> เชื่อมไป OwnedItem และ Item */
export interface PurchaseWithItem extends Purchase {
  ownedItem: OwnedItem & { item: Item }
}

/** Gift (ผู้ส่ง/ผู้รับ และ item ของของที่ให้) */
export interface GiftOutgoing extends Gift {
  recipient: Pick<User, 'id' | 'username' | 'email'>
  ownedItem: OwnedItem & { item: Item }
}
export interface GiftIncoming extends Gift {
  sender: Pick<User, 'id' | 'username' | 'email'>
  ownedItem: OwnedItem & { item: Item }
}

/** Transfer (ฝั่งส่ง/รับ) */
export interface TransferOutgoing extends Transfer {
  receiver: Pick<User, 'id' | 'username' | 'email'>
}
export interface TransferIncoming extends Transfer {
  sender: Pick<User, 'id' | 'username' | 'email'>
}

/** ---- ตัวหลัก: User ที่ join ความสัมพันธ์ยอดนิยม ---- */
export interface UserJoined extends User {
  wallet?: Wallet | null
  deposits: Deposit[]
  withdrawals: Withdrawal[]
  transactions: Transaction[]

  ownedItems: OwnedItemWithItem[]
  purchases: PurchaseWithItem[]

  sentGifts: GiftOutgoing[]
  receivedGifts: GiftIncoming[]

  sentTransfers: TransferOutgoing[]
  receivedTransfers: TransferIncoming[]

  activityLogs: ActivityLog[]
  loginHistory: LoginHistory[]
}

/* -------------------------------------------
   (ตัวเลือกเสริม) ชนิดที่ sync กับ Prisma อัตโนมัติ
   ถ้าคุณมี include shape ตายตัว แนะนำประกาศแบบนี้เพิ่ม:
------------------------------------------- */

export const userJoinedInclude = {
  wallet: true,
  deposits: true,
  withdrawals: true,
  ownedItems: { include: { item: true } },
  purchases: { include: { ownedItem: { include: { item: true } } } },
  sentGifts: {
    include: {
      recipient: { select: { id: true, username: true, email: true } },
      ownedItem: { include: { item: true } },
    },
  },
  receivedGifts: {
    include: {
      sender: { select: { id: true, username: true, email: true } },
      ownedItem: { include: { item: true } },
    },
  },
  sentTransfers: {
    include: { receiver: { select: { id: true, username: true, email: true } } },
  },
  receivedTransfers: {
    include: { sender: { select: { id: true, username: true, email: true } } },
  },
  activityLogs: true,
  loginHistory: true,
} satisfies Prisma.UserInclude

export interface TransactionJoinedList extends Transaction {
  user: UserJoined | null
  adminUser: AdminUser | null
  wallet: Wallet | null
  deposit: Deposit | null
}

export interface TransactionJoinedDetail extends Transaction {
  user: UserJoined | null
  adminUser: AdminUser | null
  wallet: Wallet | null
  deposit: Deposit | null
  withdrawal: Withdrawal | null
  purchase: PurchaseWithItem | null
  gift: GiftOutgoing | null
  transfer: TransferIncoming | null
}
export interface DepositList extends Deposit {
  user: UserJoined | null
  slipImage: GalleryDB | null
}