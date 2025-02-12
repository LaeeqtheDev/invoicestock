// app/actions/onboardUser.server.ts
"use server";

import { redirect } from "next/navigation";
import { onboardingSchema } from "./utils/zodSchema";
import { parseWithZod } from "@conform-to/zod";
import prisma from "./utils/db";
import { requireUser } from "./utils/hooks";

/**
 * This server action processes the onboarding form and then routes to /dashboard.
 * The function returns Promise<void> (by not returning any value) because redirect
 * immediately sends a redirect response.
 */
export async function onboardUser(formData: FormData): Promise<void> {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: onboardingSchema,
  });

  if (submission.status !== "success") {
    // Use submission.error instead of submission.errors
    throw new Error("Invalid form data: " + JSON.stringify(submission.error));
  }

  await prisma.user.update({
    where: {
      id: session.user?.id,
    },
    data: {
      firstName: submission.value.firstName,
      secondName: submission.value.secondName,
      address: submission.value.address,
    },
  });

  redirect("/dashboard");
}
