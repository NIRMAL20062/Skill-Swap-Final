
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getUserSessions, Session, updateSessionStatus } from "@/lib/firestore";
import LoadingSpinner from "@/components/layout/loading-spinner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CalendarCheck, Clock, Check, X, MessageSquare, Video, History, Link as LinkIcon, Save } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function SessionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const [linkInputs, setLinkInputs] = useState<Record<string, string>>({});

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
    if (!meetingLink || !meetingLink.startsWith('https://meet.google.com/')) {
        toast({ title: "Invalid Link", description: "Please provide a valid Google Meet link.", variant: "destructive" });
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
  
  const renderSessionCard = (session: Session) => {
      const isMentor = session.mentorId === user?.uid;
      const otherPartyName = isMentor ? session.menteeName : session.mentorName;

      return (
        <Card key={session.id} className="mb-4">
          <CardHeader>
            <CardTitle>
              Session with {otherPartyName}
            </CardTitle>
            <CardDescription>Skill: {session.skill}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <Clock className="mr-2 h-4 w-4" />
              <span>{new Date(session.dateTime).toLocaleString()}</span>
            </div>
            <p className="mb-4">Status: <span className="font-semibold capitalize">{session.status}</span></p>

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
               <div className="flex gap-2 items-center">
                 <Button variant="outline" disabled><MessageSquare className="mr-2 h-4 w-4" /> Message</Button>
                 <Button asChild>
                    <Link href={session.meetingLink} target="_blank"><Video className="mr-2 h-4 w-4" /> Join Meet</Link>
                 </Button>
               </div>
            )}

            {session.status === 'accepted' && !session.meetingLink && !isMentor && (
                <p className="text-muted-foreground">Waiting for the mentor to provide a meeting link.</p>
            )}

          </CardContent>
          {(session.status === 'completed' || session.status === 'rejected') && (
            <CardFooter>
                 <p className="text-sm text-muted-foreground">This session is in your history.</p>
            </CardFooter>
          )}
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
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-2">
          Manage Your Sessions
        </h1>
        <p className="text-lg text-muted-foreground">
          Keep track of your learning and teaching appointments.
        </p>
      </header>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming"><CalendarCheck className="mr-2 h-4 w-4"/>Upcoming</TabsTrigger>
          <TabsTrigger value="history"><History className="mr-2 h-4 w-4"/>History</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map(session => renderSessionCard(session))
          ) : (
            <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">You have no upcoming sessions.</p>
                <p>Visit the <Link href="/discover" className="text-primary underline">Discover</Link> page to find a peer!</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="history">
          {pastSessions.length > 0 ? (
            pastSessions.map(session => renderSessionCard(session))
          ) : (
            <p className="text-muted-foreground text-center py-8">You have no past sessions.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
