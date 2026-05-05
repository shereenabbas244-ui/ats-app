import Link from "next/link";

export const metadata = {
  title: "Careers | Lobah Games",
  description: "Join Lobah Games — Building games from Saudi Arabia to the world.",
};

function LobahLogo({ height = 40 }: { height?: number }) {
  const w = height * 3.2;
  return (
    <svg height={height} viewBox="0 0 192 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Icon: D-shape with swoosh and 3 dots */}
      <g>
        {/* Outer D shape */}
        <path d="M8 4 C8 4 2 4 2 12 L2 48 C2 56 8 56 8 56 L28 56 C44 56 52 44 52 30 C52 16 44 4 28 4 Z" fill="white" />
        {/* Inner cutout */}
        <path d="M12 12 C12 12 8 12 8 18 L8 42 C8 48 12 48 12 48 L26 48 C36 48 42 40 42 30 C42 20 36 12 26 12 Z" fill="#0d0d0d" />
        {/* Swoosh tail */}
        <path d="M6 50 C10 58 20 62 32 56 L28 56 C18 58 10 54 6 50 Z" fill="white" />
        {/* 3 dots (diagonal) */}
        <circle cx="32" cy="20" r="4" fill="white" />
        <circle cx="25" cy="30" r="4" fill="white" />
        <circle cx="18" cy="40" r="4" fill="white" />
      </g>
      {/* Lobah text */}
      <text x="62" y="28" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontStyle="italic" fontSize="26" fill="white" letterSpacing="-0.5">Lobah</text>
      {/* Arabic لعبة */}
      <text x="64" y="52" fontFamily="Arial, sans-serif" fontWeight="700" fontStyle="italic" fontSize="20" fill="white">لعبة</text>
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
