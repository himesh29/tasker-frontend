"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useEffect } from "react";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      router.replace(isAuthenticated ? "/tasks" : "/login");
    }
  }, [isLoading, isAuthenticated, router]);

  return null;
}
