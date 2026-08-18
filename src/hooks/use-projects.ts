"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { adaptProject, toBackendPriority } from "@/lib/adapters";
import type { Project, Member } from "@/lib/types";

export function useProjects() {
  const qc = useQueryClient();

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await api.get("/projects");
      return res.data.items.map(adaptProject);
    },
  });

  const addProject = useMutation({
    mutationFn: async (project: Omit<Project, "id">) => {
      return api.post("/projects", {
        name: project.name,
        priority: toBackendPriority(project.priority),
        dueDate: project.dueDate,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.priority !== undefined) payload.priority = toBackendPriority(updates.priority);
      if (updates.dueDate !== undefined) payload.dueDate = updates.dueDate; // allow null
      return api.patch(`/projects/${id}`, payload);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  const addMemberToProject = useMutation({
    mutationFn: async ({ projectId, member }: { projectId: string; member: Member }) => {
      return api.post(`/projects/${projectId}/members/${member.id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  return {
    projects,
    addProject: (p: Omit<Project, "id">) => addProject.mutateAsync(p),
    updateProject: (id: string, updates: Partial<Project>) => updateProject.mutate({ id, updates }),
    deleteProject: (id: string) => deleteProject.mutate(id),
    addMemberToProject: (projectId: string, member: Member) => addMemberToProject.mutate({ projectId, member }),
  };
}
