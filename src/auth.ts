import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from '@/libs/mongodb'
import { JWT } from 'next-auth/jwt'
import { User as NextAuthUser } from 'next-auth'

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

export const authOptions = {
  secret: process.env.AUTH_SECRET,
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
}

async function collection(collection: string) {
  const db = await connectToDatabase()
  return db.collection(collection)
}

const handler = NextAuth({
  ...authOptions,
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const usersCollection = await collection('users')
        const existingUser = await usersCollection.findOne({
          email: user.email,
        })

        if (!existingUser) {
          await usersCollection.insertOne({
            email: user.email,
            name: user.name,
            image: user.image,
            createdAt: new Date(),
          })
        }

        return true
      } catch (error) {
        console.error('소셜 로그인 에러:', error)
        return false
      }
    },
    async jwt({ token, user }): Promise<ExtendedJWT> {
      if (user) {
        token.id = user.id
        token.type = (user as CustomUser).type
      }
      return token
    },
    async session({ session, token }) {
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
})

export const {
  auth,
  handlers: { GET, POST },
} = handler
