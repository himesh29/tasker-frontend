'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { useUsers } from '@/hooks/use-users';
import { api } from '@/lib/api-client';
import type { Member } from '@/lib/types';

interface AssignMemberDialogProps {
  projectId: string;
}

export function AssignMemberDialog({ projectId }: AssignMemberDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const { users } = useUsers();

  const handleAssign = async () => {
    if (!selectedUserId) return;
    setIsAssigning(true);
    
    try {
      await api.post(`/projects/${projectId}/members/${selectedUserId}`);
      setSelectedUserId('');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign to Project</DialogTitle>
          <DialogDescription>
            Add a user to this project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium leading-none">Select User</p>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Search users..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user: Member) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAssign} disabled={!selectedUserId || isAssigning}>
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
