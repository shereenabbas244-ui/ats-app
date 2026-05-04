import Link from "next/link";

export const metadata = {
  title: "Careers | Lobah Games",
  description: "Join Lobah Games — Building games from Saudi Arabia to the world.",
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <header className="border-b border-white/10 bg-[#0d0d0d]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/careers" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E55B1F] flex items-center justify-center font-bold text-white text-sm">
              L
            </div>
            <span className="font-bold text-white text-lg tracking-wide">Lobah Games</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="/" className="hover:text-white transition-colors">About</a>
            <a href="/" className="hover:text-white transition-colors">Games</a>
            <Link href="/careers" className="text-[#E55B1F] font-medium">Careers</Link>
          </nav>
          <a
            href="mailto:careers@lobah.com"
            className="bg-[#E55B1F] hover:bg-[#d04e15] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Contact Us
          </a>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-white/10 mt-24 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white/40 text-sm">
          <span>© {new Date().getFullYear()} Lobah Games. All rights reserved.</span>
          <span>From Saudi Arabia to the world 🌍</span>
        </div>
      </footer>
    </div>
  );
}
