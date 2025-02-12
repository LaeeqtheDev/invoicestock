// app/createBusinessAction.server.ts
"use server";

import prisma from "@/app/utils/db";
import { CreateBusinessInput } from "@/app/utils/zodSchema";
import { requireUser } from "./utils/hooks";

export async function createBusinessAction(
  input: CreateBusinessInput & { businessLogo: string },
) {
  const session = await requireUser();
  // (Your server-side logic, possibly using Node.js modules like child_process, etc.)
  const business = await prisma.business.create({
    data: {
      businessName: input.businessName,
      businessType: input.businessType,
      businessAddress: input.businessAddress,
      businessPhone: input.businessPhone,
      businessEmail: input.businessEmail,
      businessEIN: input.businessEIN,
      businessVAT: input.businessVAT,
      returnPolicy: input.returnPolicy,
      businessLogo: input.businessLogo,
      owner: { connect: { id: session.user.id } },
    },
  });

  return { success: true };
}
