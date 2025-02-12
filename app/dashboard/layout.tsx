// /app/dashboard/layout.tsx (or similar)
import { ReactNode } from "react";
import { requireUser } from "../utils/hooks";
import Link from "next/link";
import Logo from "@/public/ghost.svg";
import Image from "next/image";
import DashboardLinks from "../components/DashboardLinks";
import MobileSidebar from "../components/MobileSidebar";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User2 } from "lucide-react";
import { signOut } from "../utils/auth";
import prisma from "../utils/db";
import { redirect } from "next/navigation";
import ThemeToggle from "../components/theme-toggle";
import { ThemeProvider } from "next-themes";

async function getUser(userId: string) {
  const data = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, secondName: true, address: true },
  });
  if (!data?.firstName || !data?.secondName || !data?.address) {
    redirect("/onboarding");
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireUser();
  await getUser(session.user?.id as string);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr] bg-white dark:bg-black">
        {/* Sidebar for md and larger */}
        <div className="hidden md:block border-r bg-muted/40 dark:bg-black">
          <div className="flex flex-col max-h-screen h-full gap-2">
            {/* Logo Section */}
            <div className="h-14 flex items-center border-b px-4 lg:h-[60px] lg:px-6 dark:border-black">
              <Link
                href="/"
                aria-label="Go to home page"
                className="flex items-center"
              >
                <Image
                  src={Logo}
                  alt="logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 dark:invert"
                />
                <p className="ml-2 text-2xl font-semibold text-black dark:text-white">
                  Invoice<span className="text-green-600">Stock</span>
                </p>
              </Link>
            </div>
            {/* Navigation Links */}
            <div className="flex-1 overflow-auto">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <DashboardLinks />
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col bg-gray-50 dark:bg-black">
          <header className="h-14 flex items-center border-b px-4 lg:h-[60px] lg:px-6 dark:border-black bg-white dark:bg-black">
            {/* Mobile Sidebar Toggle – only visible on small screens */}
            <MobileSidebar />

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* User Dropdown Menu */}
            <div className="flex items-center ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-full" variant="outline" size="icon">
                    <User2 />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white dark:bg-black"
                >
                  <DropdownMenuLabel className="text-black dark:text-white">
                    Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="text-black dark:text-white"
                    >
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/invoices"
                      className="text-black dark:text-white"
                    >
                      Invoices
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form
                      className="w-full"
                      action={async () => {
                        "use server";
                        await signOut();
                      }}
                    >
                      <button className="w-full text-left text-black dark:text-white">
                        Logout
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
