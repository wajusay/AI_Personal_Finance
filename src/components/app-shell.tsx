import Link from "next/link";

import { NavLink } from "@/components/nav-link";
import { buttonVariants } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold tracking-tight">
              AI Personal Finance
            </Link>
            <nav className="hidden items-center gap-4 sm:flex">
              <NavLink href="/">Dashboard</NavLink>
              <NavLink href="/transactions">Transactions</NavLink>
              <NavLink href="/import">Import</NavLink>
              <NavLink href="/rules">Rules</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/transactions/new"
              className={buttonVariants({ size: "sm" })}
            >
              Add
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

