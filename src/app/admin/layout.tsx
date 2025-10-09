"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigationLinks = [
  { href: "/admin/products", label: "محصولات" },
  { href: "/admin/brands", label: "برندها" },
  { href: "/admin/collections", label: "کالکشن‌ها" },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]" dir="rtl">
      <header className="border-b border-[var(--color-border)]/70 bg-[var(--color-surface)]/90 backdrop-blur-xl shadow-[var(--shadow-soft)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1.5 sm:gap-2 px-4 py-4 sm:px-5 sm:py-6 md:px-6 md:py-8">
          <p className="text-xs sm:text-sm text-[var(--color-foreground-subtle)]">مدیریت محتوا</p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">پنل مدیریت گندم پرفیوم</h1>
          <p className="text-xs sm:text-sm md:text-base text-[var(--color-foreground-muted)]">
            از این بخش می‌توانید محصولات، برندها و کالکشن‌ها را مدیریت کنید.
          </p>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:gap-6 md:gap-8 px-4 py-6 sm:px-5 sm:py-8 md:px-6 md:py-10 lg:flex-row">
        <nav className="flex flex-row gap-2 sm:gap-3 overflow-x-auto rounded-xl sm:rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]/70 p-2 sm:p-3 shadow-[var(--shadow-soft)] lg:h-fit lg:w-64 lg:flex-col">
          {navigationLinks.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between whitespace-nowrap rounded-lg sm:rounded-[var(--radius-base)] px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] min-h-[44px] ${
                  active
                    ? "bg-[var(--color-accent)] text-white shadow-[var(--shadow-strong)]"
                    : "bg-transparent text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-background-soft)]/80 hover:-translate-y-0.5"
                }`}
              >
                <span>{item.label}</span>
                {active && <span className="text-[10px] sm:text-xs">فعال</span>}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 rounded-xl sm:rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 shadow-[var(--shadow-soft)]">
          {children}
        </main>
      </div>
    </div>
  );
}
