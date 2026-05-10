"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-white/[0.06] bg-[#0D1117]">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/[0.06] px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E55B1F]">
          <BriefcaseIcon className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold text-white">Lobah ATS</span>
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
                : "text-white/50 hover:bg-white/[0.05] hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/[0.06] p-3 space-y-0.5">
        <Link
          href="/careers"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-white/[0.05] hover:text-white transition-colors"
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
              : "text-white/50 hover:bg-white/[0.05] hover:text-white"
          )}
        >
          <SettingsIcon className="h-4 w-4" />
          Settings
        </Link>
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-white/[0.05] hover:text-white transition-colors"
        >
          <LogOutIcon className="h-4 w-4" />
          Sign out
        </Link>
      </div>
    </aside>
  );
}
