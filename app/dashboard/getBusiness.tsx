// /dashboard/dashboard/getBusiness.ts
import prisma from "@/app/utils/db";

export async function getBusiness(userId: string) {
  const business = await prisma.business.findUnique({
    where: { ownerId: userId },
  });
  return business;
}
