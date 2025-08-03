
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getUserSessions, Session, updateSessionStatus, markSessionAsComplete } from "@/lib/firestore";
import LoadingSpinner from "@/components/layout/loading-spinner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CalendarCheck, Clock, Check, X, MessageSquare, Video, History, Link as LinkIcon, Save, Star, ThumbsUp, Send } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SessionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  
  const [linkInputs, setLinkInputs] = useState<Record<string, string>>({});
  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [currentSessionForFeedback, setCurrentSessionForFeedback] = useState<Session | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    async function fetchSessions() {
      setLoading(true);
      try {
        const userSessions = await getUserSessions(user!.uid);
        setSessions(userSessions);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
        toast({
          title: "Error",
          description: "Could not load your sessions. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, [user, authLoading, router, toast]);

  const handleResponse = async (sessionId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      await updateSessionStatus(sessionId, newStatus);
      setSessions(prevSessions =>
        prevSessions.map(s => (s.id === sessionId ? { ...s, status: newStatus } : s))
      );
      toast({
        title: "Success",
        description: `Session has been ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveLink = async (sessionId: string) => {
    const meetingLink = linkInputs[sessionId];
    if (!meetingLink || !meetingLink.startsWith('https://')) {
        toast({ title: "Invalid Link", description: "Please provide a valid meeting link.", variant: "destructive" });
        return;
    }
    try {
        await updateSessionStatus(sessionId, 'accepted', meetingLink);
        setSessions(prevSessions =>
            prevSessions.map(s => (s.id === sessionId ? { ...s, meetingLink } : s))
        );
        toast({ title: "Success", description: "Meeting link saved!" });
    } catch (error) {
        toast({ title: "Error", description: "Failed to save the link. Please try again.", variant: "destructive"});
    }
  };

  const handleMarkComplete = async (session: Session) => {
      if (!user) return;
      try {
        const updatedSession = await markSessionAsComplete(session.id, user.uid);
        setSessions(prev => prev.map(s => s.id === session.id ? {...s, ...updatedSession} : s));
        toast({ title: "Session Updated", description: "Your action has been recorded."});
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to mark complete.", variant: "destructive"});
      }
  }

  const openFeedbackModal = (session: Session) => {
    setCurrentSessionForFeedback(session);
    setRating(0);
    setReviewText("");
    setFeedbackModalOpen(true);
  }

  const handleFeedbackSubmit = async () => {
    if (!currentSessionForFeedback || rating === 0 || !reviewText || !user) {
        toast({ title: "Incomplete", description: "Please provide a rating and a review.", variant: "destructive" });
        return;
    }
    setIsSubmittingFeedback(true);
    try {
        const functions = getFunctions();
        const submitReview = httpsCallable(functions, 'submitReview');

        await submitReview({
            sessionId: currentSessionForFeedback.id,
            mentorId: currentSessionForFeedback.mentorId,
            menteeId: currentSessionForFeedback.menteeId,
            menteeName: user.displayName || "Anonymous User",
            rating: rating,
            reviewText: reviewText,
        });

        setSessions(prev => prev.map(s => s.id === currentSessionForFeedback.id ? {...s, feedbackSubmitted: true} : s));
        toast({ title: "Success", description: "Your feedback has been submitted!" });
        setFeedbackModalOpen(false);
    } catch (error: any) {
        console.error("Firebase Functions call failed:", error);
        toast({ title: "Error", description: error.message || "Failed to submit feedback.", variant: "destructive" });
    } finally {
        setIsSubmittingFeedback(false);
    }
  }

  const renderSessionCard = (session: Session) => {
      const isMentor = session.mentorId === user?.uid;
      const otherPartyName = isMentor ? session.menteeName : session.mentorName;
      const userHasCompleted = isMentor ? session.mentorCompleted : session.menteeCompleted;

      return (
        <Card key={session.id} className="mb-4">
          <CardHeader>
            <CardTitle>Session with {otherPartyName}</CardTitle>
            <CardDescription>Skill: {session.skill}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              <span>{new Date(session.dateTime).toLocaleString()}</span>
            </div>
            <p>Status: <span className="font-semibold capitalize">{session.status}</span></p>

            {session.status === 'pending' && isMentor && (
              <div className="flex gap-2">
                <Button onClick={() => handleResponse(session.id, 'accepted')}><Check className="mr-2 h-4 w-4" /> Accept</Button>
                <Button variant="destructive" onClick={() => handleResponse(session.id, 'rejected')}><X className="mr-2 h-4 w-4" /> Reject</Button>
              </div>
            )}

            {session.status === 'accepted' && !session.meetingLink && isMentor && (
                <div className="space-y-3 p-4 border rounded-lg bg-secondary/20">
                    <h4 className="font-semibold">Add Meeting Link</h4>
                    <p className="text-sm text-muted-foreground">Generate a Google Meet link and paste it below for the mentee.</p>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Paste Google Meet link here..." 
                            value={linkInputs[session.id] || ''}
                            onChange={(e) => setLinkInputs(prev => ({ ...prev, [session.id]: e.target.value }))}
                        />
                         <Button onClick={() => handleSaveLink(session.id)}><Save className="mr-2 h-4 w-4"/> Save</Button>
                    </div>
                     <Button variant="outline" asChild>
                        <Link href="https://meet.google.com/new" target="_blank"><LinkIcon className="mr-2 h-4 w-4"/> Generate Link</Link>
                    </Button>
                </div>
            )}

            {session.status === 'accepted' && session.meetingLink && (
               <div className="flex gap-2 items-center flex-wrap">
                 <Button variant="outline" disabled><MessageSquare className="mr-2 h-4 w-4" /> Message</Button>
                 <Button asChild>
                    <Link href={session.meetingLink} target="_blank"><Video className="mr-2 h-4 w-4" /> Join Meet</Link>
                 </Button>
                 <Button variant={userHasCompleted ? "secondary" : "default"} onClick={() => handleMarkComplete(session)} disabled={userHasCompleted}>
                    {userHasCompleted ? <><Check className="mr-2 h-4 w-4" /> You've marked as complete</> : <><ThumbsUp className="mr-2 h-4 w-4"/> Mark as Complete</>}
                 </Button>
               </div>
            )}

            {session.status === 'accepted' && !session.meetingLink && !isMentor && (
                <p className="text-muted-foreground">Waiting for the mentor to provide a meeting link.</p>
            )}

          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2">
            {session.status === 'completed' && !session.feedbackSubmitted && !isMentor && (
                <Button onClick={() => openFeedbackModal(session)}><Star className="mr-2 h-4 w-4" /> Leave Feedback</Button>
            )}
            {session.status === 'completed' && session.feedbackSubmitted && !isMentor && (
                <p className="text-sm text-green-600 flex items-center"><Check className="mr-2 h-4 w-4"/> Feedback submitted. Thank you!</p>
            )}
            {session.status === 'completed' && (
                <p className="text-sm text-muted-foreground">This session is complete and in your history.</p>
            )}
             {session.status === 'rejected' && (
                <p className="text-sm text-muted-foreground">This session was rejected and is in your history.</p>
            )}
          </CardFooter>
        </Card>
      );
  }

  if (loading || authLoading) {
    return <LoadingSpinner text="Loading sessions..." />;
  }

  const upcomingSessions = sessions.filter(s => s.status === 'pending' || s.status === 'accepted');
  const pastSessions = sessions.filter(s => s.status === 'completed' || s.status === 'rejected');

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-2">Manage Your Sessions</h1>
        <p className="text-lg text-muted-foreground">Keep track of your learning and teaching appointments.</p>
      </header>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming"><CalendarCheck className="mr-2 h-4 w-4"/>Upcoming</TabsTrigger>
          <TabsTrigger value="history"><History className="mr-2 h-4 w-4"/>History</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {upcomingSessions.length > 0 ? upcomingSessions.map(renderSessionCard) : (
            <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">You have no upcoming sessions.</p>
                <p>Visit the <Link href="/discover" className="text-primary underline">Discover</Link> page to find a peer!</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="history">
          {pastSessions.length > 0 ? pastSessions.map(renderSessionCard) : (
            <p className="text-muted-foreground text-center py-8">You have no past sessions.</p>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isFeedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Leave Feedback for {currentSessionForFeedback?.mentorName}</DialogTitle>
                <DialogDescription>Your feedback helps other users find great mentors.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div>
                    <Label>Rating</Label>
                    <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                                key={star} 
                                className={`h-8 w-8 cursor-pointer ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <Label htmlFor="reviewText">Review</Label>
                    <Textarea 
                        id="reviewText"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience..."
                        className="mt-2"
                        rows={4}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleFeedbackSubmit} disabled={isSubmittingFeedback}>
                    {isSubmittingFeedback ? "Submitting..." : <><Send className="mr-2 h-4 w-4"/> Submit Feedback</>}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
