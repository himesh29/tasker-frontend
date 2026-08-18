"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { adaptUserToMember } from "@/lib/adapters";

export function useProjectMembers(projectId?: string) {
  return useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await api.get(`/projects/${projectId}`);
      return res.data.members.map((m: any) => adaptUserToMember(m.user));
    },
    enabled: !!projectId,
  });
}
