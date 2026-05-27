import { UserRole, ProductType, OrderStatus } from '@prisma/client'

export interface UserSession {
  id: string
  phone: string
  name?: string | null
  role: UserRole
  walletBalance: number
}

export interface ProductWithSeller {
  id: string
  sellerId: string
  seller: {
    name: string | null
    phone: string | null
  }
  type: ProductType
  name: string
  weight: number
  karat: number
  wage: number
  profitPercent: number
  finalPrice: number
  stock: number
  barcode: string | null
  isVerified: boolean
  images: string[]
  description: string | null
  createdAt: Date
}

export interface OrderWithDetails {
  id: string
  buyerId: string
  productId: string
  product: ProductWithSeller
  quantity: number
  totalPrice: number
  status: OrderStatus
  createdAt: Date
}

export interface PriceHistoryItem {
  id: string
  price: number
  createdAt: Date
}

export interface AnalysisSignal {
  type: 'BUY' | 'SELL' | 'HOLD'
  strength: number // ۰ تا ۱۰۰
  reason: string
  technicalScore: number
  fundamentalScore: number
}