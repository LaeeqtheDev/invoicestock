import { RainbowButton } from "@/components/ui/rainbow-button";
import HeroImage from "@/public/scanner.png";
import Link from "next/link";
import IPhone15Pro from "@/components/ui/iphone-15-pro"; // Correct import with PascalCase

export function Benefits() {
  return (
    <section className="relative flex flex-col lg:flex-row items-center lg:items-start justify-between py-12 lg:py-10 px-4 sm:px-6 md:px-8 sm:py-2">
      <div className="relative w-full lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
        <IPhone15Pro
          width={433}
          color="black"
          height={882}
          videoSrc="https://res.cloudinary.com/deqeq93p3/video/upload/v1736178254/VID_hn3vxa.mp4"
          className="w-full h-auto sm:w-[233px] sm:h-[282px] md:w-[433px] md:h-[482px] lg:w-[433px] lg:h-[682px] scale-[0.95]"
        />
      </div>

      <div className="text-center justify-center mx-auto sm:text-left lg:w-1/2">
        <h1 className="mt-6 sm:mt-8 text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
          "Don't Have a Barcode Scanner?"
          <span className="block -mt-1 sm:-mt-2 bg-gradient-to-l from-blue-800 via-teal-500 to-green-500 text-transparent bg-clip-text">
            No Worries,
          </span>
          <span className="block -mt-1 sm:-mt-2 bg-gradient-to-r from-orange-800 via-red-500 to-green-500 text-transparent bg-clip-text">
            Your Phone Will Work!
          </span>
        </h1>

        <p className="max-w-lg mt-3 sm:mt-4 lg:text-lg text-muted-foreground">
          Turn your smartphone into a barcode scanner and streamline your
          inventory management with ease.
        </p>

        <div className="mt-6 sm:mt-7">
          <Link href={"/learn-more"}>
            <RainbowButton>Try Now</RainbowButton>
          </Link>
        </div>
      </div>

      {/* Applying scale to IPhone15Pro component */}
    </section>
  );
}
