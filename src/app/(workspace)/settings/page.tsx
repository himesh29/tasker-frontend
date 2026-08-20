"use client";

import { useState, useRef } from "react";
import { Pencil, Check, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api-client";

export default function ProfileSettingsPage() {
  const { user, refetchUser } = useAuth();

  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);

  if (!user) return null;

  async function refreshProfile() {
    await refetchUser();
  }

  function handleStartEditName() {
    setNameDraft(user!.name);
    setEditingName(true);
  }

  async function handleSaveName() {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === user!.name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      await api.patch(`/users/${user!.id}`, { name: trimmed });
      await refreshProfile();
      setEditingName(false);
    } finally {
      setSavingName(false);
    }
  }

  async function handleAvatarFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post(`/users/${user!.id}/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshProfile();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="w-full max-w-3xl">
      <h1 className="mb-6 text-3xl font-semibold">Profile</h1>

      <div className="rounded-lg border border-border bg-background">
        <div className="flex items-center justify-between p-4">
          <span className="text-sm">Profile picture</span>
          <button
            onClick={() => setAvatarModalOpen(true)}
            className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            title="View or change profile picture"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
          </button>
        </div>
        <Separator />

        <div className="flex items-center justify-between p-4">
          <span className="text-sm">Email</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <Pencil className="h-3.5 w-3.5 text-foreground" />
          </div>
        </div>
        <Separator />

        <div className="flex items-center justify-between p-4">
          <span className="text-sm">Full name</span>
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                className="w-48"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                disabled={savingName}
                title="Save"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-foreground hover:bg-accent outline-none disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-48 text-right truncate">
                {user.name}
              </span>
              <button
                onClick={handleStartEditName}
                title="Edit name"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent outline-none"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        <Separator />

        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm">Title</p>
            <p className="text-xs text-muted-foreground">
              Your job title or role
            </p>
          </div>
          <Input placeholder="Designer" className="w-48 bg-muted/50" />
        </div>
        <Separator />

        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm">Username</p>
            <p className="text-xs text-muted-foreground">
              One word, like a nickname or first name
            </p>
          </div>
          <Input placeholder="Dexuser" className="w-48 bg-muted/50" />
        </div>
      </div>

      <h2 className="mb-2 mt-16 text-sm font-medium">Workspace access</h2>
      <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
        <span className="text-sm text-muted-foreground">
          Remove yourself from the workspace
        </span>
        <Button
          variant="destructive"
          className="bg-red-50 text-red-600 hover:bg-red-100"
        >
          Leave Workspace
        </Button>
      </div>

      <Dialog open={avatarModalOpen} onOpenChange={setAvatarModalOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Profile picture</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <Avatar className="h-32 w-32">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-2xl">
                {user.name?.slice(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="hidden"
              onChange={handleAvatarFileSelected}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              <Camera className="h-4 w-4" />
              {uploading ? "Uploading..." : "Change photo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
