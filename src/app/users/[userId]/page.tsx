
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserProfile, UserProfile } from "@/lib/firestore";
import LoadingSpinner from "@/components/layout/loading-spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, BrainCircuit, Github, Linkedin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { userId } = params;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof userId === 'string') {
      setLoading(true);
      getUserProfile(userId)
        .then(userProfile => {
          if (userProfile) {
            setProfile(userProfile);
          } else {
            // Handle user not found, maybe redirect
            router.push('/discover');
          }
          setLoading(false);
        })
        .catch(error => {
          console.error("Failed to fetch user profile:", error);
          setLoading(false);
          router.push('/discover');
        });
    }
  }, [userId, router]);

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 text-center">
        <h1 className="text-2xl font-bold">Profile not found</h1>
        <p className="text-muted-foreground">The user you are looking for does not exist.</p>
        <Button onClick={() => router.push('/discover')} className="mt-4">Back to Discover</Button>
      </div>
    );
  }

  const initial = profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'S';

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Button variant="outline" onClick={() => router.back()} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-primary">
            <AvatarImage src={profile.photoURL} alt={profile.displayName} />
            <AvatarFallback className="text-4xl">{initial}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="font-headline text-4xl mb-2">{profile.displayName}</CardTitle>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">N/A</span>
                <span>(0 reviews)</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {profile.linkedinProfile && (
                <Button asChild variant="outline" size="icon">
                  <Link href={profile.linkedinProfile} target="_blank">
                    <Linkedin className="h-5 w-5" />
                  </Link>
                </Button>
              )}
              {profile.githubProfile && (
                <Button asChild variant="outline" size="icon">
                  <Link href={profile.githubProfile} target="_blank">
                    <Github className="h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <Button size="lg">Book a Session</Button>
        </CardHeader>
        <CardContent className="mt-4">
          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-headline mb-4 flex items-center gap-2">
                <BrainCircuit className="text-primary" />
                Skills to Teach
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skillsToTeach?.map(skill => (
                  <Badge key={skill} variant="secondary" className="text-md py-1 px-3">{skill}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-headline mb-4 flex items-center gap-2">
                <BookOpen className="text-primary" />
                Skills to Learn
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skillsToLearn?.map(skill => (
                  <Badge key={skill} variant="outline" className="text-md py-1 px-3">{skill}</Badge>
                ))}
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />

          <div>
             <h3 className="text-xl font-headline mb-4">Reviews</h3>
             <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No reviews yet.</p>
                <p className="text-sm">Be the first one to book a session and leave a review!</p>
             </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
