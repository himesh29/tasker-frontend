"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { adaptTask, adaptTaskDetail, toBackendPriority, toBackendStatus } from "@/lib/adapters";
import type { Task, Status } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";

export function useTasks(projectId?: string) {
  const qc = useQueryClient();
  const { user } = useAuth();

  // Use this as the cache key for all operations
  const queryKey = projectId ? ["tasks", projectId] : ["tasks"];

  const { data: tasks = [] } = useQuery({
    queryKey,
    queryFn: async () => {
      const url = projectId ? `/tasks?projectId=${projectId}` : "/tasks";
      const res = await api.get(url);
      return res.data.items.map(adaptTask);
    },
  });

  const addTask = useMutation({
    mutationFn: async (task: Omit<Task, "id">) => {
      const payload: Record<string, unknown> = {
        title: task.title.trim(),
        summary: task.summary,
        description: task.description,
        projectId: task.projectId,
        parentTaskId: task.parentTaskId,
        priority: toBackendPriority(task.priority),
        tag: task.labels?.map((l) => l.name).join(",") || undefined,
        dueDate: task.dueDate,
        dateRangeStart: task.dateRangeStart,
        dateRangeEnd: task.dateRangeEnd,
        reporterId: task.reporterId ?? undefined,
      };

      const response = await api.post("/tasks", payload);
      const taskId = response.data.id;

      if (user?.id) {
        await api.post(`/tasks/${taskId}/members`, { userIds: [user.id] });
      }

      if (task.status !== "todo") {
        await api.patch(`/tasks/${taskId}`, {
          status: toBackendStatus(task.status),
        });
      }
      return response;
    },
    onSuccess: (_response, task) => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      if (task.projectId) qc.invalidateQueries({ queryKey: ["tasks", task.projectId] });
      if (task.parentTaskId) qc.invalidateQueries({ queryKey: ["task", task.parentTaskId] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const payload: Record<string, unknown> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.summary !== undefined) payload.summary = updates.summary;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.status !== undefined) payload.status = toBackendStatus(updates.status);
      if (updates.priority !== undefined) payload.priority = toBackendPriority(updates.priority);
      if (updates.labels !== undefined) payload.tag = updates.labels.map((l) => l.name).join(",");
      if (updates.dueDate !== undefined) payload.dueDate = updates.dueDate;
      if (updates.dateRangeStart !== undefined) payload.dateRangeStart = updates.dateRangeStart;
      if (updates.dateRangeEnd !== undefined) payload.dateRangeEnd = updates.dateRangeEnd;
      if (updates.isLocked !== undefined) payload.isLocked = updates.isLocked;
      if (updates.reporterId !== undefined) payload.reporterId = updates.reporterId;
      return api.patch(`/tasks/${id}`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      if (projectId) qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      if (projectId) qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  // FIX: Use the dynamic queryKey for optimistic update
  const updateTaskStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      return api.patch(`/tasks/${id}`, { status: toBackendStatus(status) });
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousTasks = qc.getQueryData(queryKey);

      // Optimistically update the correct cache
      qc.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return old.map((task: any) =>
          task.id === id ? { ...task, status } : task
        );
      });

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      qc.setQueryData(queryKey, context?.previousTasks);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey });
      // Also invalidate the global tasks cache for consistency
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const watch = useMutation({
    mutationFn: async ({ taskId }: { taskId: string }) => {
      return api.post(`/tasks/${taskId}/watch`);
    },
    onSuccess: (_, { taskId }) => {
      qc.invalidateQueries({ queryKey: ["task", taskId] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      if (projectId) qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  const unwatch = useMutation({
    mutationFn: async ({ taskId }: { taskId: string }) => {
      return api.delete(`/tasks/${taskId}/watch`);
    },
    onSuccess: (_, { taskId }) => {
      qc.invalidateQueries({ queryKey: ["task", taskId] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      if (projectId) qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  return {
    tasks,
    addTask: (task: Omit<Task, "id">) => addTask.mutateAsync(task),
    updateTask: (id: string, updates: Partial<Task>) => updateTask.mutate({ id, updates }),
    deleteTask: (id: string) => deleteTask.mutate(id),
    updateTaskStatus: (id: string, status: Status) => updateTaskStatus.mutate({ id, status }),
    watch,
    unwatch,
  };
}

export function useTaskDetail(id: string) {
  const qc = useQueryClient();

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: async () => {
      const res = await api.get(`/tasks/${id}`);
      return adaptTaskDetail(res.data);
    },
  });

  const updateTask = useMutation({
    mutationFn: async (updates: Partial<Task>) => {
      const payload: Record<string, unknown> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.summary !== undefined) payload.summary = updates.summary;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.status !== undefined) payload.status = toBackendStatus(updates.status);
      if (updates.priority !== undefined) payload.priority = toBackendPriority(updates.priority);
      if (updates.labels !== undefined) payload.tag = updates.labels.map((l) => l.name).join(",");
      if (updates.dueDate !== undefined) payload.dueDate = updates.dueDate;
      if (updates.dateRangeStart !== undefined) payload.dateRangeStart = updates.dateRangeStart;
      if (updates.dateRangeEnd !== undefined) payload.dateRangeEnd = updates.dateRangeEnd;
      if (updates.isLocked !== undefined) payload.isLocked = updates.isLocked;
      if (updates.reporterId !== undefined) payload.reporterId = updates.reporterId;
      return api.patch(`/tasks/${id}`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task", id] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return { task, isLoading, updateTask };
}
