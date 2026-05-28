// src/lib/auth.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "شماره یا ایمیل", type: "text" },
        code: { label: "کد تأیید", type: "text" },
        username: { label: "نام کاربری (مدیر)", type: "text" },
        password: { label: "رمز عبور (مدیر)", type: "password" },
      },
      async authorize(credentials) {
        // Admin root login (direct)
        if (credentials?.username === "root" && credentials?.password === "toor") {
          const user = await prisma.user.findFirst({
            where: { phone: "root" },
          })
          if (user && user.role === "ADMIN") {
            return {
              id: user.id,
              phone: user.phone,
              email: user.email,
              name: user.name,
              role: user.role,
            }
          }
          throw new Error("حساب مدیر ریشه پیدا نشد")
        }

        // OTP login
        if (!credentials?.identifier || !credentials?.code) {
          throw new Error("اطلاعات ناقص است")
        }

        const token = await prisma.verificationToken.findFirst({
          where: {
            identifier: credentials.identifier as string,
            token: credentials.code as string,
            expires: { gt: new Date() },
          },
        })

        if (!token) {
          throw new Error("کد تأیید نامعتبر یا منقضی شده است")
        }

        await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: token.identifier,
              token: token.token,
            },
          },
        })

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: token.identifier },
              { email: token.identifier },
            ],
          },
        })

        if (!user) {
          throw new Error("کاربری با این مشخصات یافت نشد")
        }

        return {
          id: user.id,
          phone: user.phone,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.sub = user.id
        token.phone = user.phone
        token.email = user.email
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub
        session.user.phone = token.phone
        session.user.email = token.email
        session.user.role = token.role
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)