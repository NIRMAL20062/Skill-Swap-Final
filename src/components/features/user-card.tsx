
"use client";

import Link from "next/link";
import { UserProfile } from "@/lib/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";

interface UserCardProps {
  user: UserProfile;
}

export function UserCard({ user }: UserCardProps) {
  const initial = user.displayName ? user.displayName.charAt(0).toUpperCase() : "S";

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex-row items-center gap-4 pb-2">
        <Avatar className="h-16 w-16 border-2 border-primary">
          <AvatarImage src={user.photoURL} alt={user.displayName} />
          <AvatarFallback className="text-2xl">{initial}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-headline text-xl font-semibold leading-tight">{user.displayName}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>N/A (0 reviews)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
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
