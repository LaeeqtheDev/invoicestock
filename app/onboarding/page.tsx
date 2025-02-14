"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "../components/SubmitButtons";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { onboardingSchema } from "../utils/zodSchema";
import { onboardUser } from "../onboardActions";
import Logo from "@/public/ghost.svg";
import Image from "next/image";
// Import the server action from the separate module.

export default function Onboarding() {
  // Use the useForm hook from conform-to without useActionState.
  const [form, fields] = useForm({
    // The onValidate function uses zod to validate the formData.
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: onboardingSchema,
      });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-r from-white via-green-100 to-white">
      <div className="flex max-w-4xl w-full bg-white shadow-lg rounded-lg overflow-hidden">
        
        {/* Logo & Image Section */}
        <div className="w-1/2 flex flex-col items-center justify-center p-6">
        <Image src={Logo} alt="Logo" width={64} height={64} className="rounded-full" />
          <img src="/onboard.png" alt="Onboarding" className="w-80" />
        </div>
        {/* Form Section */}
        <div className="w-1/2 flex items-center justify-center p-8">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-xl">You are almost finished!</CardTitle>
              <CardDescription>
                Enter your information to create an account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4"
                action={onboardUser} // Pass the server action directly.
                id={form.id}
                onSubmit={form.onSubmit}
                noValidate
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>First Name</Label>
                    <Input
                      name={fields.firstName.name}
                      key={fields.firstName.key}
                      defaultValue={fields.firstName.initialValue}
                      placeholder="John"
                    />
                    <p className="text-red-500 text-sm">
                      {fields.firstName.errors}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label>Last Name</Label>
                    <Input
                      name={fields.secondName.name}
                      key={fields.secondName.key}
                      defaultValue={fields.secondName.initialValue}
                      placeholder="Doe"
                    />
                    <p className="text-red-500 text-sm">
                      {fields.secondName.errors}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Address</Label>
                  <Input
                    name={fields.address.name}
                    key={fields.address.key}
                    defaultValue={fields.address.initialValue}
                    placeholder="Chad street 123"
                  />
                  <p className="text-red-500 text-sm">{fields.address.errors}</p>
                </div>

                <SubmitButton text="Finish onboarding" />
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
