import Link from "next/link";

export const metadata = {
  title: "Careers | Lobah Games",
  description: "Join Lobah Games — Building games from Saudi Arabia to the world.",
};

function LobahLogo() {
  return (
    <svg width="120" height="36" viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Icon */}
      <rect width="36" height="36" rx="8" fill="#E55B1F" />
      <circle cx="13" cy="15" r="2.5" fill="white" />
      <circle cx="23" cy="15" r="2.5" fill="white" />
      <path d="M11 22 Q18 27 25 22" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Lobah text */}
      <text x="44" y="16" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="14" fill="white" letterSpacing="0.5">Lobah</text>
      {/* Arabic text */}
      <text x="44" y="30" fontFamily="Arial, sans-serif" fontSize="11" fill="white" opacity="0.8">لعبة</text>
    </svg>
  );
}

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <header className="border-b border-white/10 bg-[#0d0d0d]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/careers" className="flex items-center">
            <LobahLogo />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="https://lobah.com/#about" className="hover:text-white transition-colors">About</a>
            <a href="https://lobah.com/#mission" className="hover:text-white transition-colors">Mission</a>
            <a href="https://lobah.com/#vision" className="hover:text-white transition-colors">Vision</a>
            <a href="https://lobah.com/#games" className="hover:text-white transition-colors">Games</a>
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
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <LobahLogo />
          <nav className="flex items-center gap-6 text-sm text-white/50">
            <a href="https://lobah.com/#about" className="hover:text-white transition-colors">About</a>
            <a href="https://lobah.com/#mission" className="hover:text-white transition-colors">Mission</a>
            <a href="https://lobah.com/#vision" className="hover:text-white transition-colors">Vision</a>
            <a href="https://lobah.com/#games" className="hover:text-white transition-colors">Games</a>
          </nav>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-2 text-white/30 text-xs">
          <span>© {new Date().getFullYear()} All rights reserved to Lobah Games.</span>
          <div className="flex items-center gap-4">
            <a href="https://lobah.com/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="https://lobah.com/terms" className="hover:text-white/60 transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
