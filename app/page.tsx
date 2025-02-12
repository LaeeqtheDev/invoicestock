import All from "./components/All";
import { Benefits } from "./components/Benefits";
import { BusinessFeatures } from "./components/businessFeatures";
import { BusinessTestimonial } from "./components/CTO";
import DockComponent from "./components/Dock";
import { FAQ } from "./components/FAQ";

import Footer from "./components/Footer";
import { Hero } from "./components/Hero";
import { Navbar } from "./components/Navbar";
import Pricing from "./components/Pricing";
import StatsSection from "./components/Stats";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-white via-green-100  to-white h-full">
      <Navbar />
      <Hero />
      <Benefits />
      <BusinessFeatures />
      <StatsSection />
      <BusinessTestimonial />
      <Pricing />
      <FAQ />
      <All />

      <Footer />
    </main>
  );
}
