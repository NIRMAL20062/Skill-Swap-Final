
"use client";

import { useEffect, useState } from "react";
import { getAllUsers, UserProfile } from "@/lib/firestore";
import LoadingSpinner from "@/components/layout/loading-spinner";
import { UserCard } from "@/components/features/user-card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";

export default function DiscoverPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      if (authLoading) return;
      setLoading(true);
      try {
        const allUsers = await getAllUsers();
        // Filter out the current user and users who haven't completed their profile
        const completeProfiles = allUsers.filter(user => user.profileComplete && user.uid !== currentUser?.uid);
        setUsers(completeProfiles);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [authLoading, currentUser]);

  const filteredUsers = users.filter(user => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesName = user.displayName?.toLowerCase().includes(searchTermLower);
    const matchesSkills = user.skillsToTeach?.some(skill => skill.toLowerCase().includes(searchTermLower));
    return matchesName || matchesSkills;
  });

  const isLoading = loading || authLoading;

  if (isLoading) {
    return <LoadingSpinner text="Finding peers..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-2">
          Discover Peers
        </h1>
        <p className="text-lg text-muted-foreground">
          Find the perfect mentor to learn from or a student to teach.
        </p>
      </header>
      
      <div className="mb-8 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or skill..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <main>
        {filteredUsers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredUsers.map((user) => (
              <UserCard key={user.uid} user={user} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No users found matching your search.</p>
            <p>Try a different skill or name.</p>
          </div>
        )}
      </main>
    </div>
  );
}
