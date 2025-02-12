import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/ghost.svg";
import { RainbowButton } from "@/components/ui/rainbow-button";
import DockComponent from "./Dock";
// Adjust the path if needed

export function Navbar() {
  return (
    <div className="flex items-center justify-between py-5">
      {/* Logo */}
      <Link href={"/"} className="flex items-center gap-1">
        <Image
          className="h-[80px] w-[80px] text-green-500"
          src={Logo}
          width={100}
          height={100}
          alt="logo"
        />
        <h3 className="text-3xl font-semibold">
          Invoice<span className="text-green-600">Stock</span>
        </h3>
      </Link>

      {/* Dock Component (responsive) */}
      <div className="flex-1 hidden lg:flex justify-center mr-20">
        <DockComponent />
      </div>

      {/* Get Started Button */}
      <Link href={"/login"}>
        <RainbowButton>Get Started</RainbowButton>
      </Link>
    </div>
  );
}
