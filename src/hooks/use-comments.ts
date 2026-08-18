"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { adaptComment } from "@/lib/adapters";
import type { Comment } from "@/lib/types";

export function useComments(taskId: string) {
  const qc = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", taskId],
    queryFn: async () => {
      const res = await api.get(`/tasks/${taskId}/comments`);
      return res.data.map(adaptComment);
    },
    enabled: !!taskId,
  });

  const addComment = useMutation({
    mutationFn: async (text: string) => {
      const res = await api.post(`/tasks/${taskId}/comments`, { text });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", taskId] }),
  });

  const updateComment = useMutation({
    mutationFn: async ({ commentId, text }: { commentId: string; text: string }) => {
      await api.patch(`/tasks/${taskId}/comments/${commentId}`, { text });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", taskId] }),
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      await api.delete(`/tasks/${taskId}/comments/${commentId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", taskId] }),
  });

  const react = useMutation({
    mutationFn: async ({ commentId, emoji }: { commentId: string; emoji: string }) => {
      await api.post(`/tasks/${taskId}/comments/${commentId}/reactions`, { emoji });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", taskId] }),
  });

  const unreact = useMutation({
    mutationFn: async ({ commentId, emoji }: { commentId: string; emoji: string }) => {
      await api.delete(`/tasks/${taskId}/comments/${commentId}/reactions/${encodeURIComponent(emoji)}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", taskId] }),
  });

  const pin = useMutation({
    mutationFn: async (commentId: string) => {
      await api.post(`/tasks/${taskId}/comments/${commentId}/pin`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", taskId] }),
  });

  const unpin = useMutation({
    mutationFn: async (commentId: string) => {
      await api.delete(`/tasks/${taskId}/comments/${commentId}/pin`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", taskId] }),
  });

  return {
    comments,
    isLoading,
    addComment,
    updateComment,
    deleteComment,
    react,
    unreact,
    pin,
    unpin,
  };
}
