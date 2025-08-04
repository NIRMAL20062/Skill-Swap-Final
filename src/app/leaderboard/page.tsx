
"use client";

import { useEffect, useState } from "react";
import { getLeaderboard, UserProfile } from "@/lib/firestore";
import LoadingSpinner from "@/components/layout/loading-spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";

function ReviewStars({ rating, className }: { rating: number, className?: string }) {
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const partialStar = rating - fullStars;
  const emptyStars = totalStars - Math.ceil(rating);

  return (
    <div className={cn("flex items-center", className)}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
      ))}
      {partialStar > 0 && (
         <div className="relative">
            <Star key="partial" className="h-5 w-5 text-yellow-400" />
            <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${partialStar * 100}%` }}>
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
      ))}
    </div>
  );
}


export default function LeaderboardPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const topUsers = await getLeaderboard(10); // Get top 10 users
        setUsers(topUsers);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading Leaderboard..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-2 flex items-center gap-3">
          <Trophy className="w-10 h-10 text-primary" /> Leaderboard
        </h1>
        <p className="text-lg text-muted-foreground">See the top-rated mentors in the community.</p>
      </header>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-center">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead className="text-center">Reviews</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.uid}>
                  <TableCell className="font-bold text-2xl text-center">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Link href={`/users/${user.uid}`} className="flex items-center gap-4 group">
                      <Avatar className="h-12 w-12 border-2 border-transparent group-hover:border-primary transition-colors">
                        <AvatarImage src={user.photoURL} alt={user.displayName} />
                        <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium group-hover:text-primary transition-colors">{user.displayName}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <ReviewStars rating={user.rating || 0} />
                      <span className="text-sm text-muted-foreground">({(user.rating || 0).toFixed(1)})</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">{user.reviewCount || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
