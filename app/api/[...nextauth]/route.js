import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Demo ke liye: koi bhi email/password chal jayega
        if (credentials?.email && credentials?.password) {
          return { 
            id: '1', 
            email: credentials.email,
            name: credentials.email.split('@')[0]
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/login'
  }
})

export { handler as GET, handler as POST }
