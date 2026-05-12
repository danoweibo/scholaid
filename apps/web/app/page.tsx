// apps/web/app/page.tsx
import { Navbar } from "@/blocks/navbar";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="sticky top-0 z-50 px-6 pt-6">
        <Navbar />
      </header>
    </main>
  );
}
