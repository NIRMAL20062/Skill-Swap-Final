
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserProfile, UserProfile, requestSession, getReviewsForUser, Review as ReviewType } from "@/lib/firestore";
import LoadingSpinner from "@/components/layout/loading-spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, BrainCircuit, Github, Linkedin, Star, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

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


export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { userId } = params;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (typeof userId !== 'string') return;
      
      setLoading(true);
      try {
        const [userProfile, userReviews] = await Promise.all([
          getUserProfile(userId),
          getReviewsForUser(userId)
        ]);
        
        if (userProfile) {
          setProfile(userProfile);
          setReviews(userReviews);
        } else {
          router.push('/discover');
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        router.push('/discover');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId, router]);

  const handleBookingRequest = async () => {
    if (!currentUser || !profile || !selectedSkill || !selectedDate || !selectedTime) {
      toast({
        title: "Incomplete Information",
        description: "Please select a skill, date, and time to book a session.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          toast({ title: "Invalid Time", description: "Please enter a valid time in HH:MM format.", variant: "destructive" });
          setIsBooking(false);
          return;
      }
        
      const combinedDateTime = new Date(selectedDate);
      combinedDateTime.setHours(hours, minutes);

      await requestSession({
        menteeId: currentUser.uid,
        menteeName: currentUser.displayName || "A User",
        mentorId: profile.uid,
        mentorName: profile.displayName || "A Mentor",
        skill: selectedSkill,
        dateTime: combinedDateTime.toISOString(),
        status: 'pending'
      });

      toast({
        title: "Request Sent!",
        description: "Your session request has been sent to the mentor.",
      });
      setIsBookingOpen(false);
    } catch (error) {
      console.error("Failed to book session:", error);
      toast({
        title: "Booking Failed",
        description: "Could not send your session request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };


  if (loading || authLoading) {
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
  const isOwnProfile = currentUser?.uid === profile.uid;
  const rating = profile.rating ?? 0;
  const reviewCount = profile.reviewCount ?? 0;

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
            <div className="flex items-center gap-2 text-muted-foreground">
                {reviewCount > 0 ? (
                    <>
                        <ReviewStars rating={rating} />
                        <span className="font-semibold">{rating.toFixed(1)}</span>
                        <span>({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
                    </>
                ) : (
                    <span className="text-muted-foreground">No reviews yet</span>
                )}
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
          {!isOwnProfile && currentUser && (
            <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
              <DialogTrigger asChild>
                <Button size="lg">Book a Session</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Book a Session with {profile.displayName}</DialogTitle>
                  <DialogDescription>
                    Select a skill you want to learn and propose a time for your session.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="skill" className="text-right">
                      Skill
                    </Label>
                    <Select onValueChange={setSelectedSkill}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a skill" />
                      </SelectTrigger>
                      <SelectContent>
                        {profile.skillsToTeach?.map(skill => (
                          <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "col-span-3 justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarPicker
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="time" className="text-right">
                      Time
                    </Label>
                     <Input
                        id="time"
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="col-span-3"
                      />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleBookingRequest} disabled={isBooking}>
                    {isBooking ? "Sending Request..." : "Send Request"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
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
             <h3 className="text-xl font-headline mb-4">Reviews ({reviews.length})</h3>
             {reviews.length > 0 ? (
                <div className="space-y-6">
                    {reviews.map(review => (
                        <Card key={review.id} className="bg-secondary/20 border-l-4 border-primary">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{review.menteeName}</CardTitle>
                                        <CardDescription>{new Date(review.createdAt.toDate()).toLocaleDateString()}</CardDescription>
                                    </div>
                                    <ReviewStars rating={review.rating} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground italic">"{review.reviewText}"</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
             ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4">No reviews yet.</p>
                    {!isOwnProfile && <p className="text-sm">Be the first one to book a session and leave a review!</p>}
                </div>
             )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
