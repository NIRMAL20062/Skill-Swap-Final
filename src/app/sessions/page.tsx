
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getUserSessions, Session, updateSessionStatus } from "@/lib/firestore";
import LoadingSpinner from "@/components/layout/loading-spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CalendarCheck, Clock, Check, X, MessageSquare, Video } from "lucide-react";

export default function SessionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

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

  const renderSessionCard = (session: Session, type: 'mentee' | 'mentor') => (
    <Card key={session.id} className="mb-4">
      <CardHeader>
        <CardTitle>
          {type === 'mentee' ? `Session with ${session.mentorName}` : `Session with ${session.menteeName}`}
        </CardTitle>
        <CardDescription>Skill: {session.skill}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Clock className="mr-2 h-4 w-4" />
          <span>{new Date(session.dateTime).toLocaleString()}</span>
        </div>
        <p className="mb-4">Status: <span className="font-semibold">{session.status}</span></p>

        {session.status === 'pending' && type === 'mentor' && (
          <div className="flex gap-2">
            <Button onClick={() => handleResponse(session.id, 'accepted')}><Check className="mr-2 h-4 w-4" /> Accept</Button>
            <Button variant="destructive" onClick={() => handleResponse(session.id, 'rejected')}><X className="mr-2 h-4 w-4" /> Reject</Button>
          </div>
        )}

        {session.status === 'accepted' && (
           <div className="flex gap-2 items-center">
             <Button variant="outline"><MessageSquare className="mr-2 h-4 w-4" /> Message</Button>
             <Button><Video className="mr-2 h-4 w-4" /> Join Meet</Button>
           </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading || authLoading) {
    return <LoadingSpinner text="Loading sessions..." />;
  }

  const sessionsAsMentee = sessions.filter(s => s.menteeId === user?.uid);
  const sessionsAsMentor = sessions.filter(s => s.mentorId === user?.uid);

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
      
      <Tabs defaultValue="mentee" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mentee">Learning (as Mentee)</TabsTrigger>
          <TabsTrigger value="mentor">Teaching (as Mentor)</TabsTrigger>
        </TabsList>
        <TabsContent value="mentee">
          {sessionsAsMentee.length > 0 ? (
            sessionsAsMentee.map(session => renderSessionCard(session, 'mentee'))
          ) : (
            <p className="text-muted-foreground text-center py-8">You have not requested any sessions.</p>
          )}
        </TabsContent>
        <TabsContent value="mentor">
          {sessionsAsMentor.length > 0 ? (
            sessionsAsMentor.map(session => renderSessionCard(session, 'mentor'))
          ) : (
            <p className="text-muted-foreground text-center py-8">You have no incoming session requests.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
