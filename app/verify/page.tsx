import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Ensure Image is imported
import Logo from "@/public/ghost.svg"; // Update the path to your logo

export default function Verify() {
  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-r from-white via-green-100 to-white">
      {/* Light background blur */}
      <div className="absolute inset-0 bg-white opacity-20 backdrop-blur-md"></div>

      {/* Logo and Title Link */}
      <div className="flex items-center justify-between py-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 absolute top-5 w-full">
        <Link href={"/"} className="flex items-center gap-1">
          <Image
            className="h-[80px] w-[80px] text-green-500"
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

      {/* Card Content */}
      <Card className="w-[380px] px-5 relative z-10">
        <CardHeader className="text-center">
          <div className="mb-4 mx-auto flex size-20 items-center justify-center rounded-full bg-green-100">
            <Mail className="size-12 text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We have sent a verification link to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4 rounded-md bg-red-100 border-red-300 p-4">
            <div className="flex items-center justify-center">
              <AlertCircle className="size-5 text-red-300" />
              <p className="text-sm font-medium text-red-400 ml-3">
                Be sure to check your spam folder!
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link
            href={"/"}
            className={buttonVariants({
              className: "w-full",
              variant: "outline",
            })}
          >
            <ArrowLeft className="size-4 mr-2" /> Back to Homepage
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
