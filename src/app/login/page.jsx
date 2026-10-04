"use client";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { loginSchema } from "@/schemas/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { push } = useToast();
  const queryClient = useQueryClient();
  const [welcome, setWelcome] = useState(null); // { name } once login succeeds
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();
    if (!json.success) {
      push({ type: "error", message: json.error.message });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["current-user"] });

    const user = json.data?.user ?? json.user;
    const isStaff = user?.role === "ADMIN" || user?.role === "STAFF";

    const next = params.get("next");
    const safeNext =
      next && next.startsWith("/") && !next.startsWith("//") ? next : null;

    // Staff always land on the admin area; customers honor ?next= (but never /admin)
    const target = isStaff
      ? safeNext?.startsWith("/admin")
        ? safeNext
        : "/admin/dashboard"
      : safeNext && !safeNext.startsWith("/admin") && !safeNext.startsWith("/account")
        ? safeNext
        : "/";

    // Replace the form with a centered welcome message, then redirect
    setWelcome({ name: user?.firstName });
    setTimeout(() => {
      router.push(target);
      router.refresh();
    }, 1400);
  }

  if (welcome) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-sm items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h1 className="text-3xl">
            Welcome back{welcome.name ? `, ${welcome.name}` : ""}.
          </h1>
          <p className="mt-2 text-sm text-kiyomi-muted">Taking you in…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-24">
      <div>
        <h1 className="text-2xl">Sign in</h1>
        <p className="mt-1 text-sm text-kiyomi-muted">Welcome back to Kiyomi.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <Input label="Password" type="password" error={errors.password?.message} {...register("password")} />
        <div className="text-right text-sm">
          <Link href="/forgot-password" className="underline">Forgot password?</Link>
        </div>
        <Button type="submit" loading={isSubmitting} className="w-full">Sign in</Button>
      </form>
      <p className="text-sm text-kiyomi-muted">
        New here? <Link href="/register" className="underline text-kiyomi-ink">Create an account</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}