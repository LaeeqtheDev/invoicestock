import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, signIn } from "../utils/auth";
import { SubmitButton } from "../components/SubmitButtons";
import { redirect } from "next/navigation";
import Image from "next/image";
import Logo from "@/public/ghost.svg";

export default async function Login() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-green-100 to-white"></div>
      </div>
      <Card className="max-w-sm mx-auto">
        <CardHeader className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Image src={Logo} alt="Logo" width={64} height={64} className="rounded-full" />
          </div>
          <CardTitle className="text-xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to log in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              "use server";
              await signIn("nodemailer", formData);
            }}
            className="grid gap-4"
          >
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                required
                placeholder="hello@hello.com"
              />
            </div>
            <SubmitButton text="Login" />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
