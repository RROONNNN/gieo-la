import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-cream">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-[70px]">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
