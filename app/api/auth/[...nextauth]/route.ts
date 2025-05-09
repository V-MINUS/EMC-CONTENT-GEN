import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Basic authentication setup for EMC AI Content Generator
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'EMC Account',
      credentials: {
        username: { label: "Username", type: "text" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This is a simplified example - in a production app, you would verify against a database
        if (credentials?.username === 'admin' && credentials?.password === 'emcadmin') {
          return { 
            id: '1', 
            name: 'EMC Admin',
            email: 'admin@electronicmusiccouncil.com' 
          };
        }
        
        // If you return null, an error will be displayed advising the user to check their details
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login', 
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };
