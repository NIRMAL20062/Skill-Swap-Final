
"use client";

import Link from "next/link";
import { UserProfile } from "@/lib/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserCardProps {
  user: UserProfile;
}

function ReviewStars({ rating, className }: { rating: number, className?: string }) {
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const partialStar = rating - fullStars;
  const emptyStars = totalStars - Math.ceil(rating);

  return (
    <div className={cn("flex items-center", className)}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
      ))}
      {partialStar > 0 && (
         <div className="relative">
            <Star key="partial" className="h-4 w-4 text-yellow-400" />
            <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${partialStar * 100}%` }}>
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      ))}
    </div>
  );
}


export function UserCard({ user }: UserCardProps) {
  const initial = user.displayName ? user.displayName.charAt(0).toUpperCase() : "S";
  const rating = user.rating ?? 0;
  const reviewCount = user.reviewCount ?? 0;

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex-row items-center gap-4 pb-4">
        <Avatar className="h-16 w-16 border-2 border-primary">
          <AvatarImage src={user.photoURL} alt={user.displayName} />
          <AvatarFallback className="text-2xl">{initial}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-headline text-xl font-semibold leading-tight">{user.displayName}</h3>
           <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            {reviewCount > 0 ? (
                <>
                    <ReviewStars rating={rating} />
                    <span className="font-semibold">{rating.toFixed(1)}</span>
                    <span>({reviewCount})</span>
                </>
            ) : (
                <span>No reviews yet</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-0">
        <div className="space-y-3">
            <div>
                 <h4 className="text-sm font-semibold text-muted-foreground mb-2">Teaches:</h4>
                 <div className="flex flex-wrap gap-1">
                    {user.skillsToTeach?.slice(0, 3).map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                    {user.skillsToTeach && user.skillsToTeach.length > 3 && (
                        <Badge variant="outline">+{user.skillsToTeach.length - 3} more</Badge>
                    )}
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/users/${user.uid}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
