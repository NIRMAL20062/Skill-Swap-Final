
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
} from "lucide-react";
import AiSkillSuggestion from "@/components/features/ai-skill-suggestion";
import { useEffect, useState } from "react";
import { getUserProfile, UserProfile } from "@/lib/firestore";
import LoadingSpinner from "@/components/layout/loading-spinner";

const featureCards = [
  {
    title: "Discover Peers",
    description: "Find users to trade skills with.",
    icon: <Search className="w-8 h-8" />,
    href: "/discover",
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const checkProfile = async () => {
      setLoading(true);
      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile && userProfile.profileComplete) {
          setProfile(userProfile);
        } else {
          router.push("/complete-profile");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    
    checkProfile();

  }, [authLoading, user, router]);
  

  if (loading || authLoading || !profile) {
     return <LoadingSpinner text="Loading Dashboard..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-2">
          Welcome to Your Dashboard, {profile.displayName}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Here's your command center for swapping skills and tracking progress.
        </p>
      </header>

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
