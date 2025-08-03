
"use client";

import Link from "next/link";
import { Handshake, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";


const baseNavLinks = [
    { href: "/discover", label: "Discover" },
    { href: "#", label: "Help" },
];

const authNavLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/discover", label: "Discover" },
    { href: "/sessions", label: "Manage Sessions" },
    { href: "#", label: "Help" },
];


export default function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };
  
  const navLinks = user ? authNavLinks : baseNavLinks;
  const logoHref = user ? "/dashboard" : "/";
  
  if (!isMounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href={logoHref} className="mr-6 flex items-center space-x-2">
            <Handshake className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline">
              SkillSwap
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SheetClose asChild>
              <Link
                href={logoHref}
                className="flex items-center"
              >
                <Handshake className="mr-2 h-6 w-6 text-primary" />
                <span className="font-bold font-headline">SkillSwap</span>
              </Link>
            </SheetClose>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.label}>
                    <Link
                      href={link.href}
                      className="text-foreground/70 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link
          href={logoHref}
          className="flex items-center space-x-2 md:hidden mr-auto"
        >
          <Handshake className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline">SkillSwap</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-4">
            {!loading && (
                user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? 'User'} />
                                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.displayName ?? 'Welcome'}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                                Dashboard
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => router.push('/profile')}>
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut}>
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" asChild>
                            <Link href="/login">Log In</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/signup">Sign Up</Link>
                        </Button>
                    </div>
                )
            )}
        </div>
      </div>
    </header>
  );
}
