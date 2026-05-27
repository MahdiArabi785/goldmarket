import { UserRole } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface User {
    phone?: string
    role?: UserRole
  }

  interface Session {
    user: {
      id: string
      phone?: string
      name?: string | null
      role?: UserRole
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    phone?: string
    role?: UserRole
  }
}
