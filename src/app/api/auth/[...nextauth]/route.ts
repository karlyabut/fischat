import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Store user data in Firebase
        const userRef = doc(db, "users", user.email!);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          // New user - create document
          await setDoc(userRef, {
            email: user.email,
            name: user.name,
            image: user.image,
            provider: account?.provider,
            providerId: account?.providerAccountId,
            createdAt: new Date(),
            lastSignIn: new Date(),
            signInCount: 1,
          });
        } else {
          // Existing user - update last sign in
          await setDoc(userRef, {
            lastSignIn: new Date(),
            signInCount: (userDoc.data()?.signInCount || 0) + 1,
            name: user.name, // Update name in case it changed
            image: user.image, // Update image in case it changed
          }, { merge: true });
        }
        
        return true;
      } catch (error) {
        console.error("Error storing user data:", error);
        return true; // Still allow sign in even if Firebase fails
      }
    },
    async session({ session, token }) {
      try {
        // Add Firebase user data to session
        if (session.user?.email) {
          const userRef = doc(db, "users", session.user.email);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            session.user = {
              ...session.user,
              id: userDoc.id,
              signInCount: userData.signInCount,
              createdAt: userData.createdAt?.toDate?.() || userData.createdAt,
              lastSignIn: userData.lastSignIn?.toDate?.() || userData.lastSignIn,
            };
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      
      return session;
    },
    async jwt({ token, user }) {
      return token;
    },
  },
});

export { handler as GET, handler as POST }; 