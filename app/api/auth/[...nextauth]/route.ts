import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials?.password) return null;

        const user = await User.findOne({ email: credentials.email });

        if (!user) return null;


        const isValid = await import("bcryptjs").then(bcrypt => bcrypt.compare(credentials.password, user.password));
        if (!isValid) return null;


        return { id: user._id.toString(), name: user.name, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt", 
  },
    secret: process.env.NEXTAUTH_SECRET,
    pages:{
    signIn: '/login',
    },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
