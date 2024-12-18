import NextAuth, { NextAuthOptions, Session } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from '@/libs/mongodb'
import { JWT } from 'next-auth/jwt'
import { User as NextAuthUser } from 'next-auth'
import { Awaitable } from 'next-auth'

interface CustomUser extends NextAuthUser {
  id: string
  email: string
  name?: string | null
  type?: string
}

interface ExtendedJWT extends JWT {
  id?: string
  type?: string
}

interface AuthError extends Error {
  message: string
}

declare module 'next-auth' {
  interface Session {
    user: CustomUser
  }
}

export const config: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.')
        }

        try {
          const db = await connectToDatabase()
          const user = await db.collection('users').findOne({
            email: credentials.email,
          })

          if (!user) {
            throw new Error('등록되지 않은 사용자입니다.')
          }

          if (user.password !== credentials.password) {
            throw new Error('비밀번호가 일치하지 않습니다.')
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || null,
            type: user.type || 'credentials',
          }
        } catch (error) {
          const authError = error as AuthError
          console.error('로그인 에러:', authError)
          throw authError
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID || '',
      clientSecret: process.env.AUTH_GITHUB_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }): Promise<boolean> {
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          const db = await connectToDatabase()
          const existingUser = await db.collection('users').findOne({
            email: user.email,
          })

          if (!existingUser) {
            await db.collection('users').insertOne({
              email: user.email,
              name: user.name,
              type: account.provider,
              createdAt: new Date(),
            })
          }
        } catch (error) {
          console.error('소셜 로그인 에러:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }): Promise<ExtendedJWT> {
      if (user) {
        token.id = (user as CustomUser).id
        token.type = (user as CustomUser).type
      }
      return token as ExtendedJWT
    },
    async session({ session, token }): Promise<Session> {
      if (session.user) {
        session.user.id = token.id as string
        session.user.type = token.type as string
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
}

export const { auth } = NextAuth(config)
