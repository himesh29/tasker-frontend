import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Member } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function MemberAvatar({ member }: { member?: Member | null }) {
  if (!member) {
    return (
      <Avatar className="h-6 w-6">
        <AvatarFallback className="text-xs">?</AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar className="h-6 w-6">
      <AvatarImage src={member.avatarUrl} alt={member.name} />
      <AvatarFallback className="text-xs">{initials(member.name)}</AvatarFallback>
    </Avatar>
  );
}
