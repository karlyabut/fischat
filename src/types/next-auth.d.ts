import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      signInCount?: number;
      createdAt?: Date;
      lastSignIn?: Date;
    };
  }

  interface User {
    id?: string;
    signInCount?: number;
    createdAt?: Date;
    lastSignIn?: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    signInCount?: number;
    createdAt?: Date;
    lastSignIn?: Date;
  }
} 