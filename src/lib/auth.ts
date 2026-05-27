import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: "OTP",
      credentials: {
        phone: { label: "شماره موبایل", type: "text" },
        code: { label: "کد تأیید", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) {
          throw new Error("شماره موبایل و کد تأیید الزامی است")
        }

        const verificationToken = await prisma.verificationToken.findFirst({
          where: {
            identifier: credentials.phone as string,
            token: credentials.code as string,
            expires: { gt: new Date() },
          },
        })

        if (!verificationToken) {
          throw new Error("کد تأیید نامعتبر یا منقضی شده است")
        }

        await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: credentials.phone as string,
              token: credentials.code as string,
            },
          },
        })

        const user = await prisma.user.upsert({
          where: { phone: credentials.phone as string },
          update: { phoneVerified: new Date() },
          create: {
            phone: credentials.phone as string,
            phoneVerified: new Date(),
            role: "BUYER",
          },
        })

        return {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.phone = (user as any).phone
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        (session.user as any).phone = token.phone
        (session.user as any).role = token.role
      }
      return session
    },
  },
})