
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getAllUsers, getUserProfile, UserProfile, adjustUserCoins } from "@/lib/firestore";
import LoadingSpinner from "@/components/layout/loading-spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Shield, Users, Coins } from "lucide-react";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newCoinAmount, setNewCoinAmount] = useState<number>(0);
  const [isAdjusting, setIsAdjusting] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authLoading) return;
      if (!user) {
        router.push("/login");
        return;
      }

      setLoading(true);
      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile?.admin) {
          setProfile(userProfile);
          const usersList = await getAllUsers();
          setAllUsers(usersList);
        } else {
          toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [authLoading, user, router, toast]);

  const openAdjustModal = (userToAdjust: UserProfile) => {
    setSelectedUser(userToAdjust);
    setNewCoinAmount(userToAdjust.coins || 0);
    setIsAdjustModalOpen(true);
  };

  const handleAdjustCoins = async () => {
    if (!selectedUser) return;
    
    setIsAdjusting(true);
    try {
      await adjustUserCoins(selectedUser.uid, newCoinAmount);
      toast({ title: "Success", description: `Successfully updated ${selectedUser.displayName}'s coin balance.` });
      // Refresh user list
      const usersList = await getAllUsers();
      setAllUsers(usersList);
      setIsAdjustModalOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to adjust coin balance.", variant: "destructive" });
    } finally {
      setIsAdjusting(false);
    }
  };

  if (loading || authLoading) {
    return <LoadingSpinner text="Loading Admin Dashboard..." />;
  }
  
  if (!profile?.admin) {
    return null; // Should have been redirected, but as a fallback.
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-2 flex items-center gap-3">
          <Shield className="w-10 h-10 text-primary" /> Admin Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">Manage users and system settings.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coins in System</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.reduce((acc, u) => acc + (u.coins || 0), 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View all registered users and their coin balances.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Coins</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((u) => (
                <TableRow key={u.uid}>
                  <TableCell className="font-medium">{u.displayName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.coins || 0}</TableCell>
                  <TableCell>{u.admin ? 'Admin' : 'User'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openAdjustModal(u)}>
                      Adjust Coins
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isAdjustModalOpen} onOpenChange={setIsAdjustModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Coins for {selectedUser?.displayName}</DialogTitle>
            <DialogDescription>Manually set the coin balance for this user.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="coins" className="text-right">
                Coins
              </Label>
              <Input
                id="coins"
                type="number"
                value={newCoinAmount}
                onChange={(e) => setNewCoinAmount(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAdjustCoins} disabled={isAdjusting}>
              {isAdjusting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
