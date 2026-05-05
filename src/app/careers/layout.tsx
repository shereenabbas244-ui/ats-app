import Link from "next/link";

export const metadata = {
  title: "Careers | Lobah Games",
  description: "Join Lobah Games — Building games from Saudi Arabia to the world.",
};

function LobahLogo({ height = 38 }: { height?: number }) {
  const scale = height / 60;
  const w = Math.round(220 * scale);
  return (
    <svg width={w} height={height} viewBox="0 0 220 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ── Icon mark ── */}
      {/* Outer D-shape body */}
      <path
        d="M4 6 C4 2 7 0 11 0 L30 0 C48 0 60 13 60 30 C60 47 48 60 30 60 L11 60 C7 60 4 58 4 54 L4 6 Z"
        fill="white"
      />
      {/* Inner cutout to make it hollow / give depth */}
      <path
        d="M14 10 L28 10 C42 10 50 19 50 30 C50 41 42 50 28 50 L14 50 Z"
        fill="#0d0d0d"
      />
      {/* Swoosh tail at bottom */}
      <path
        d="M4 52 C4 52 8 64 22 60 L11 60 C7 60 4 58 4 54 Z"
        fill="white"
      />
      {/* 3 dots diagonal (top-right → bottom-left) */}
      <circle cx="38" cy="18" r="6" fill="white" />
      <circle cx="28" cy="30" r="5" fill="white" />
      <circle cx="18" cy="42" r="4" fill="white" />

      {/* ── Text ── */}
      <text
        x="72" y="30"
        fontFamily="'Arial Black', 'Impact', sans-serif"
        fontWeight="900"
        fontStyle="italic"
        fontSize="28"
        fill="white"
        letterSpacing="-0.5"
      >Lobah</text>
      <text
        x="74" y="54"
        fontFamily="'Arial', sans-serif"
        fontWeight="700"
        fontStyle="italic"
        fontSize="22"
        fill="white"
      >لعبة</text>
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
