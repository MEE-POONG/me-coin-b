# 📚 API Documentation - MeCoins

## 🔐 Authentication

All API endpoints (except login) require authentication via NextAuth session.

### Headers
```
Cookie: next-auth.session-token=<token>
```

---

## 👤 Users

### GET /api/users/me
Get current user information

**Response:**
```json
{
  "id": "string",
  "discordId": "string?",
  "email": "string",
  "username": "string",
  "accountNumber": "string",
  "avatar": "string",
  "role": "ADMIN | NORMAL | PREMIUM",
  "wallet": {
    "id": "string",
    "balance": number
  }
}
```

---

## 💰 Wallet

### GET /api/wallet
Get user's wallet information

**Response:**
```json
{
  "id": "string",
  "balance": number,
  "userId": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### POST /api/wallet
Create a new wallet for current user

**Response:** Same as GET /api/wallet

---

## 📊 Transactions

### GET /api/transactions
Get transactions list with pagination

**Query Parameters:**
- `page` (optional, default: 1)
- `pageSize` (optional, default: 10)
- `type` (optional): DEPOSIT, WITHDRAWAL, PURCHASE, GIFT, TRANSFER
- `status` (optional): PENDING, COMPLETED, FAILED, CANCELLED

**Response:**
```json
{
  "transactions": [
    {
      "id": "string",
      "amount": number,
      "type": "string",
      "status": "string",
      "slipImage": "string?",
      "userId": "string",
      "walletId": "string",
      "createdAt": "datetime",
      "user": { ... },
      "wallet": { ... }
    }
  ],
  "pagination": {
    "totalItems": number,
    "totalPages": number,
    "currentPage": number,
    "pageSize": number
  }
}
```

---

## 💵 Deposits

### GET /api/deposits
Get deposits list with pagination

**Query Parameters:**
- `page` (optional, default: 1)
- `pageSize` (optional, default: 10)

**Response:**
```json
{
  "deposits": [
    {
      "id": "string",
      "amount": number,
      "slipImage": "string",
      "status": "PENDING | APPROVED | REJECTED",
      "rate": number,
      "comment": "string?",
      "userId": "string",
      "createdAt": "datetime",
      "user": { ... }
    }
  ],
  "pagination": { ... }
}
```

### POST /api/deposits
Create a new deposit request

**Request Body:**
```json
{
  "amount": number,
  "slipImage": "string",
  "rate": number (optional, default: 1.0)
}
```

### PATCH /api/deposits/:id
Approve or reject deposit (Admin only)

**Request Body:**
```json
{
  "status": "APPROVED | REJECTED",
  "comment": "string (optional)"
}
```

---

## 💸 Withdrawals

### GET /api/withdrawals
Get withdrawals list with pagination

**Query Parameters:**
- `page` (optional, default: 1)
- `pageSize` (optional, default: 10)

**Response:**
```json
{
  "withdrawals": [
    {
      "id": "string",
      "amount": number,
      "status": "PENDING | APPROVED | REJECTED",
      "comment": "string?",
      "userId": "string",
      "createdAt": "datetime",
      "user": { ... }
    }
  ],
  "pagination": { ... }
}
```

### POST /api/withdrawals
Create a new withdrawal request

**Request Body:**
```json
{
  "amount": number
}
```

### PATCH /api/withdrawals/:id
Approve or reject withdrawal (Admin only)

**Request Body:**
```json
{
  "status": "APPROVED | REJECTED",
  "comment": "string (optional)"
}
```

---

## 🛍️ Items

### GET /api/items
Get items list with pagination

**Query Parameters:**
- `page` (optional, default: 1)
- `pageSize` (optional, default: 10)
- `category` (optional)
- `rarity` (optional): COMMON, RARE, EPIC, LEGENDARY

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": number,
      "imageUrl": "string?",
      "category": "string",
      "rarity": "string",
      "createdAt": "datetime"
    }
  ],
  "pagination": { ... }
}
```

### POST /api/items
Create a new item (Admin only)

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "price": number,
  "imageUrl": "string (optional)",
  "category": "string",
  "rarity": "COMMON | RARE | EPIC | LEGENDARY"
}
```

### GET /api/items/:id
Get single item by ID

### PUT /api/items/:id
Update item (Admin only)

**Request Body:** Same as POST

### DELETE /api/items/:id
Delete item (Admin only)

---

## 🎒 Owned Items

### GET /api/owned-items
Get user's owned items with pagination

**Query Parameters:**
- `page` (optional, default: 1)
- `pageSize` (optional, default: 10)

**Response:**
```json
{
  "ownedItems": [
    {
      "id": "string",
      "userId": "string",
      "itemId": "string",
      "isGifted": boolean,
      "createdAt": "datetime",
      "item": { ... }
    }
  ],
  "pagination": { ... }
}
```

---

## 🛒 Purchases

### GET /api/purchases
Get purchases list with pagination

**Query Parameters:**
- `page` (optional, default: 1)
- `pageSize` (optional, default: 10)

**Response:**
```json
{
  "purchases": [
    {
      "id": "string",
      "userId": "string",
      "ownedItemId": "string",
      "createdAt": "datetime",
      "user": { ... },
      "ownedItem": {
        "item": { ... }
      }
    }
  ],
  "pagination": { ... }
}
```

### POST /api/purchases
Purchase an item

**Request Body:**
```json
{
  "itemId": "string"
}
```

**Process:**
1. Validates item exists and user has sufficient balance
2. Deducts price from wallet
3. Creates OwnedItem record
4. Creates Purchase record
5. Creates Transaction record

---

## 🎁 Gifts

### GET /api/gifts
Get gifts list with pagination

**Query Parameters:**
- `page` (optional, default: 1)
- `pageSize` (optional, default: 10)
- `type` (optional): 'sent' or 'received'

**Response:**
```json
{
  "gifts": [
    {
      "id": "string",
      "senderId": "string",
      "recipientId": "string",
      "ownedItemId": "string",
      "createdAt": "datetime",
      "sender": { ... },
      "recipient": { ... },
      "ownedItem": {
        "item": { ... }
      }
    }
  ],
  "pagination": { ... }
}
```

### POST /api/gifts
Send a gift

**Request Body:**
```json
{
  "recipientId": "string",
  "ownedItemId": "string"
}
```

**Process:**
1. Validates owned item belongs to sender
2. Validates recipient exists
3. Transfers item ownership
4. Creates Gift record
5. Creates Transaction record

---

## 🔄 Transfers

### GET /api/transfers
Get transfers list with pagination

**Query Parameters:**
- `page` (optional, default: 1)
- `pageSize` (optional, default: 10)
- `type` (optional): 'sent' or 'received'

**Response:**
```json
{
  "transfers": [
    {
      "id": "string",
      "amount": number,
      "status": "PENDING | COMPLETED | FAILED | CANCELLED",
      "comment": "string?",
      "senderId": "string",
      "receiverId": "string",
      "createdAt": "datetime",
      "sender": { ... },
      "receiver": { ... }
    }
  ],
  "pagination": { ... }
}
```

### POST /api/transfers
Transfer money to another user

**Request Body:**
```json
{
  "receiverId": "string",
  "amount": number,
  "comment": "string (optional)"
}
```

**Process:**
1. Validates receiver exists and has wallet
2. Validates sender has sufficient balance
3. Deducts from sender wallet
4. Adds to receiver wallet
5. Creates Transfer record
6. Creates Transaction records for both users

---

## 💎 Deposit Rates

### GET /api/deposit-rates
Get all deposit rates

**Query Parameters:**
- `activeOnly` (optional): true or false

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "rate": number,
    "startDate": "datetime",
    "endDate": "datetime",
    "isActive": boolean,
    "createdAt": "datetime"
  }
]
```

### POST /api/deposit-rates
Create a new deposit rate (Admin only)

**Request Body:**
```json
{
  "name": "string",
  "rate": number,
  "startDate": "datetime",
  "endDate": "datetime",
  "isActive": boolean (optional, default: true)
}
```

### PUT /api/deposit-rates/:id
Update deposit rate (Admin only)

**Request Body:** Same as POST

### DELETE /api/deposit-rates/:id
Delete deposit rate (Admin only)

---

## 📝 Error Responses

All endpoints may return these error responses:

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 400 Bad Request
```json
{
  "error": "Error message"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 🔑 User Roles

- **ADMIN**: Full access to all features including user management and approval
- **PREMIUM**: Enhanced features (to be implemented)
- **NORMAL**: Basic user features

---

## 📊 Transaction Types

- **DEPOSIT**: Money deposit into wallet
- **WITHDRAWAL**: Money withdrawal from wallet
- **PURCHASE**: Item purchase
- **GIFT**: Gift item to another user
- **TRANSFER**: Money transfer between users

---

## 🎯 Status Types

### Transaction Status
- **PENDING**: Waiting for processing
- **COMPLETED**: Successfully completed
- **FAILED**: Failed transaction
- **CANCELLED**: Cancelled transaction

### Deposit/Withdrawal Status
- **PENDING**: Waiting for admin approval
- **APPROVED**: Approved and processed
- **REJECTED**: Rejected by admin

### Transfer Status
- **PENDING**: Waiting for processing
- **COMPLETED**: Successfully completed
- **FAILED**: Failed transfer
- **CANCELLED**: Cancelled transfer

---

## 🛡️ Security Notes

1. All endpoints are protected by NextAuth middleware
2. Admin-only endpoints check for ADMIN role
3. Passwords are hashed using bcrypt
4. Sensitive operations use database transactions for consistency
5. Balance checks are performed before deductions

---

## 📦 Pagination

All list endpoints support pagination with these parameters:
- `page`: Current page number (default: 1)
- `pageSize`: Items per page (default: 10)

Response includes:
```json
{
  "pagination": {
    "totalItems": number,
    "totalPages": number,
    "currentPage": number,
    "pageSize": number
  }
}
```

