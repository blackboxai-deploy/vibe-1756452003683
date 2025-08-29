"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "sonner";

const navItems = [
  { href: '/feed', label: 'Feed', roles: ['creator', 'supporter'] },
  { href: '/discover', label: 'Discover', roles: ['creator', 'supporter'] },
  { href: '/dashboard', label: 'Dashboard', roles: ['creator'] },
  { href: '/create', label: 'Create', roles: ['creator'] },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const filteredNavItems = navItems.filter(item => 
    !user || item.roles.includes(user.role)
  );

  return (
    <nav className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={user ? '/feed' : '/'} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg"></div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              CreatorHub
            </span>
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center space-x-6">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-purple-600 ${
                    pathname === item.href
                      ? 'text-purple-600 border-b-2 border-purple-600 pb-4 -mb-4'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Search Bar */}
          {user && (
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch}>
                <Input
                  type="search"
                  placeholder="Search creators, posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </form>
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <span className="text-lg">🔔</span>
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white">
                    3
                  </Badge>
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.name}</p>
                          {user.isVerified && (
                            <Badge variant="secondary" className="text-xs px-1">✓</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">@{user.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.username}`}>
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings">
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'creator' && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/analytics">
                          Analytics
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && (
          <div className="md:hidden border-t pt-2 pb-3">
            <div className="flex space-x-6 overflow-x-auto">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium whitespace-nowrap transition-colors hover:text-purple-600 ${
                    pathname === item.href
                      ? 'text-purple-600'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            {/* Mobile Search */}
            <div className="mt-3">
              <form onSubmit={handleSearch}>
                <Input
                  type="search"
                  placeholder="Search creators, posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}