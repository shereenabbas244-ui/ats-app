"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  BriefcaseIcon,
  UsersIcon,
  LayoutDashboardIcon,
  KanbanIcon,
  LinkedinIcon,
  SettingsIcon,
  LogOutIcon,
  BotIcon,
  GlobeIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { label: "Jobs", href: "/jobs", icon: BriefcaseIcon },
  { label: "Candidates", href: "/candidates", icon: UsersIcon },
  { label: "Pipeline", href: "/pipeline", icon: KanbanIcon },
  { label: "LinkedIn", href: "/linkedin", icon: LinkedinIcon },
  { label: "AI Tools", href: "/ai", icon: BotIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-theme-border bg-theme-bg">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-theme-border">
        <Image
          src="/lobah-logo.png"
          alt="Lobah ATS"
          width={100}
          height={32}
          className="h-7 w-auto object-contain brightness-0 dark:brightness-100"
          priority
        />
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-lg p-1.5 text-theme-text50 hover:bg-theme-hover hover:text-theme-text transition-colors"
          title="Toggle theme"
        >
          {theme === "dark" ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 p-3 pt-4">
        {nav.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-indigo-500/15 text-indigo-400"
                : "text-theme-text50 hover:bg-theme-hover hover:text-theme-text"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-theme-border p-3 space-y-0.5">
        <Link
          href="/careers"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-theme-text50 hover:bg-theme-hover hover:text-theme-text transition-colors"
        >
          <GlobeIcon className="h-4 w-4" />
          Career Page
        </Link>
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname.startsWith("/settings")
              ? "bg-indigo-500/15 text-indigo-400"
              : "text-theme-text50 hover:bg-theme-hover hover:text-theme-text"
          )}
        >
          <SettingsIcon className="h-4 w-4" />
          Settings
        </Link>
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-theme-text50 hover:bg-theme-hover hover:text-theme-text transition-colors"
        >
          <LogOutIcon className="h-4 w-4" />
          Sign out
        </Link>
      </div>
    </aside>
  );
}
