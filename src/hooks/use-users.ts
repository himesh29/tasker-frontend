"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { adaptUserToMember } from "@/lib/adapters";
import type { Member } from "@/lib/types";

export function useUsers() {
  // FIX: `res.data` from axios is typed `any`, so `.items.map(...)` on it
  // returned `any` regardless of adaptUserToMember's own return type —
  // that's why `users` came out as `any[]`, and why every `.map((x) => ...)`
  // over `users` elsewhere (filter-popover, details-panel, etc.) silently
  // got implicit-any parameters. Annotating queryFn's return type fixes
  // inference at the source instead of re-annotating every call site.
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<Member[]> => {
      const res = await api.get("/users");
      return res.data.items.map(adaptUserToMember);
    },
  });
  return { users, isLoading };
}
