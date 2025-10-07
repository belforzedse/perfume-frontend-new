"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  createBrand,
  fetchBrandsAdmin,
  type AdminBrand,
  type CreateBrandPayload,
} from "@/lib/admin-api";

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

interface BrandFormValues {
  name: string;
}

const defaultValues: BrandFormValues = {
  name: "",
};

const buildPayload = (values: BrandFormValues): CreateBrandPayload => ({
  name: values.name.trim(),
});

export default function AdminBrandsPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormValues>({ defaultValues });
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [status, setStatus] = useState<FeedbackState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const loadBrands = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBrandsAdmin();
      setBrands(data);
    } catch (error) {
      console.error("خطا در بارگذاری برندها", error);
      setStatus({
        type: "error",
        message: "بارگذاری برندها با خطا مواجه شد. اتصال و توکن را بررسی کنید.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBrands();
  }, [loadBrands]);

  const onSubmit = async (values: BrandFormValues) => {
    setStatus(null);

    try {
      const payload = buildPayload(values);
      await createBrand(payload);
      setStatus({ type: "success", message: "برند جدید با موفقیت ثبت شد." });
      reset(defaultValues);
      await loadBrands();
    } catch (error) {
      console.error("خطا در ثبت برند", error);
      setStatus({ type: "error", message: "ثبت برند انجام نشد. لطفاً دوباره تلاش کنید." });
    }
  };

  return (
    <section className="flex flex-col gap-10" dir="rtl">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold">برندها</h2>
        <p className="text-[var(--color-foreground-muted)]">
          لیست برندهای موجود را مشاهده کنید و برند تازه‌ای به سامانه اضافه نمایید.
        </p>
      </div>

      <form
        className="space-y-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background-soft)]/70 p-6 shadow-[var(--shadow-soft)]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[var(--color-foreground)]" htmlFor="name">
            نام برند <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            className="rounded-[var(--radius-base)] border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="مثلاً شنل"
            {...register("name", { required: "نام برند الزامی است." })}
          />
          {errors.name && (
            <span className="text-xs text-red-500">{errors.name.message}</span>
          )}
        </div>


        {status && (
          <div
            className={`rounded-[var(--radius-base)] px-4 py-3 text-sm ${
              status.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-[var(--radius-base)] bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "در حال ارسال..." : "ثبت برند"}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xl font-semibold">لیست برندهای موجود ({brands.length})</h3>
          {loading && <span className="text-sm text-[var(--color-foreground-muted)]">در حال بارگذاری...</span>}
        </div>

        {brands.length > 0 && (
          <div className="relative">
            <input
              type="text"
              placeholder="جستجوی برند..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-[var(--radius-base)] border border-[var(--color-border)] bg-white px-4 py-3 pr-10 text-sm text-[var(--color-foreground)] focus:border-[var(--color-accent)] focus:outline-none"
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-foreground-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}

        {brands.length === 0 && !loading ? (
          <p className="text-sm text-[var(--color-foreground-muted)]">هنوز برندی ثبت نشده است.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {brands
              .filter((brand) => brand.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((brand) => (
                <li
                  key={brand.id}
                  className="rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-background-soft)]/70 p-4 text-sm shadow-[var(--shadow-soft)] hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[var(--color-foreground)]">{brand.name}</p>
                    <span className="text-xs text-[var(--color-foreground-subtle)] bg-[var(--color-accent-soft)] px-2 py-1 rounded">
                      #{brand.id}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        )}

        {searchTerm && brands.filter((brand) => brand.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
          <p className="text-sm text-[var(--color-foreground-muted)] text-center py-8">
            برندی با این نام یافت نشد.
          </p>
        )}
      </div>
    </section>
  );
}
