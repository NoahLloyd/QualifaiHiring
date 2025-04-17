import { useMemo } from "react";

interface AvatarFallbackInitialsProps {
  name: string;
}

export function AvatarFallbackInitials({ name }: AvatarFallbackInitialsProps) {
  const initials = useMemo(() => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, [name]);

  return <span className="text-xs font-medium">{initials}</span>;
}
