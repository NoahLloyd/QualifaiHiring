import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AvatarFallbackInitials } from "../ui/avatar-fallback";

export default function UserNav() {
  const [, setLocation] = useLocation();
  
  // Fetch current user data
  const { data: user } = useQuery({
    queryKey: ['/api/me'],
    onError: () => {
      // Redirect to login if not authenticated
      setLocation('/login');
    }
  });

  // If user is not loaded yet
  if (!user) {
    return (
      <Avatar className="h-8 w-8">
        <AvatarFallback>...</AvatarFallback>
      </Avatar>
    );
  }

  // Logout function
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setLocation('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.fullName} />
            <AvatarFallback>
              <AvatarFallbackInitials name={user.fullName} />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setLocation('/profile')}>
          Your Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocation('/settings')}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
