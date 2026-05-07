import HeroSection from "@/blocks/lander/hero-section";
import { ModeToggle } from "@/components/buttons/theme";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-apfel-mittel mt-10 text-center text-4xl font-bold">
        Welcome to Scholaid!
        <ModeToggle />
      </h1>
      <HeroSection />
    </main>
  );
}
