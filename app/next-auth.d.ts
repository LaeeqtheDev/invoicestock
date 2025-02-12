// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName: string;
      secondName: string;
      address: string;
      email: string;
      image?: string | null;
    };
  }
}
