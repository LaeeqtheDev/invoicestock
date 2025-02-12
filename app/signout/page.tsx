"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Logo from "@/public/ghost.svg";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect if logged in
  useEffect(() => {
    if (session?.user) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center px-4 bg-gradient-to-r from-white via-green-100 to-white">
      {/* Logo and Title Link */}
      <div className="absolute top-5 left-5">
        <Link href={"/"} className="flex items-center gap-1">
          <Image
            className="h-[80px] w-[80px]"
            src={Logo}
            width={100}
            height={100}
            alt="logo"
          />
          <h3 className="text-3xl font-semibold">
            Invoice <span className="text-green-600">Stock</span>
          </h3>
        </Link>
      </div>

      {/* Login Card */}
      <Card className="relative max-w-sm z-10">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Sign in using Google</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-y-4">
          {/* Google Sign-In Button */}
          <Button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full bg-blue-500 text-white hover:bg-blue-600"
          >
            Sign in with Google
          </Button>

          {/* Redirect to Signup */}
          <p className="text-sm text-gray-500 text-center">
            Don't have an account?{" "}
            <Link href="/signup" className="text-green-600 font-semibold">
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
