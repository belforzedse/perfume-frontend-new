"use client";

import Link from "next/link";

const quickLinks = [
  {
    href: "/admin/products",
    title: "مدیریت محصولات",
    description: "افزودن عطر جدید، به‌روزرسانی اطلاعات و مدیریت نت‌ها.",
  },
  {
    href: "/admin/brands",
    title: "مدیریت برندها",
    description: "ساخت برند جدید یا ویرایش برندهای موجود.",
  },
  {
    href: "/admin/collections",
    title: "مدیریت کالکشن‌ها",
    description: "تعریف کالکشن‌های تازه و دسته‌بندی محصولات.",
  },
];

export default function AdminDashboardPage() {
  return (
    <section className="flex flex-col gap-6 sm:gap-8 md:gap-10" dir="rtl">
      <div className="space-y-2 sm:space-y-3">
        <h2 className="text-xl sm:text-2xl font-semibold">داشبورد مدیریتی</h2>
        <p className="text-xs sm:text-sm md:text-base text-[var(--color-foreground-muted)]">
          خوش آمدید! از اینجا می‌توانید محتوای وب‌سایت و کیوسک را به‌صورت یکپارچه مدیریت کنید.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2">
        {quickLinks.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative overflow-hidden rounded-xl sm:rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background-soft)]/80 p-4 sm:p-5 md:p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-strong)] min-h-[120px] sm:min-h-[140px]"
          >
            <div className="flex h-full flex-col gap-2 sm:gap-3">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[var(--color-foreground)] transition-colors group-hover:text-[var(--color-accent-strong)]">
                {card.title}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-foreground-muted)]">{card.description}</p>
              <span className="mt-auto inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[var(--color-accent-strong)]">
                ورود به صفحه <span aria-hidden>↗</span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl sm:rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-background-soft)]/60 p-4 sm:p-5 md:p-6 text-xs sm:text-sm text-[var(--color-foreground-muted)]">
        <p className="font-medium text-sm sm:text-base text-[var(--color-foreground)]">راهنمای سریع</p>
        <ul className="mt-2 sm:mt-3 list-disc space-y-1.5 sm:space-y-2 pr-4 sm:pr-5">
          <li>برای ثبت عطر جدید ابتدا مطمئن شوید برند و کالکشن آن در سامانه وجود دارد.</li>
          <li>پس از هر بار ثبت یا ویرایش، چند ثانیه صبر کنید تا لیست‌ها به‌روزرسانی شوند.</li>
          <li>در صورت بروز خطا، اتصال به اینترنت و توکن دسترسی را بررسی کنید.</li>
        </ul>
      </div>
    </section>
  );
}
