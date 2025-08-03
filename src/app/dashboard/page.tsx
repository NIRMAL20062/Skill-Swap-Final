
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarCheck,
  Search,
  Shield,
  Trophy,
  User,
  Wallet,
  AlertCircle
} from "lucide-react";
import AiSkillSuggestion from "@/components/features/ai-skill-suggestion";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { getUserProfile, UserProfile } from "@/lib/firestore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const featureCards = [
  {
    title: "Discover Peers",
    description: "Find users to trade skills with.",
    icon: <Search className="w-8 h-8" />,
    href: "#",
  },
  {
    title: "My Profile",
    description: "View and edit your public profile.",
    icon: <User className="w-8 h-8" />,
    href: "/profile",
  },
  {
    title: "Manage Sessions",
    description: "Track and organize your sessions.",
    icon: <CalendarCheck className="w-8 h-8" />,
    href: "#",
  },
  {
    title: "My Wallet",
    description: "Check your SkillCoin balance.",
    icon: <Wallet className="w-8 h-8" />,
    href: "#",
  },
  {
    title: "Leaderboard",
    description: "See the top-rated users.",
    icon: <Trophy className="w-8 h-8" />,
    href: "#",
  },
  {
    title: "Admin Dashboard",
    description: "Manage users and settings.",
    icon: <Shield className="w-8 h-8" />,
    href: "/admin",
  },
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        setProfileLoading(true);
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, [user]);
  
  const loading = authLoading || profileLoading;

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Skeleton className="h-10 w-1/2 mx-auto mb-4" />
        <Skeleton className="h-6 w-3/4 mx-auto mb-12" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-2">
          Welcome to Your Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Here's your command center for swapping skills and tracking progress.
        </p>
      </header>

      {profile && !profile.profileComplete && (
        <Alert variant="destructive" className="mb-8 max-w-4xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Complete Your Profile!</AlertTitle>
          <AlertDescription>
            Your profile is missing required information. Please update your skills and LinkedIn profile to get the most out of SkillSwap.
            <Button asChild variant="link" className="p-0 h-auto ml-2">
              <Link href="/profile">Go to Profile</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <main className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featureCards.map((card) => (
          <Link href={card.href} key={card.title} className="group">
            <Card className="h-full hover:border-primary transition-colors duration-300 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-secondary rounded-lg text-secondary-foreground">
                  {card.icon}
                </div>
                <div>
                  <CardTitle className="font-headline group-hover:text-primary transition-colors duration-300">
                    {card.title}
                  </CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </main>

      <section className="mt-16">
        <AiSkillSuggestion />
      </section>
    </div>
  );
}
