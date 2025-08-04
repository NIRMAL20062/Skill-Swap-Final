
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { getUserProfile, getUserTransactions, UserProfile, Transaction } from "@/lib/firestore";
import LoadingSpinner from "@/components/layout/loading-spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet as WalletIcon, Coins, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [userProfile, userTransactions] = await Promise.all([
          getUserProfile(user.uid),
          getUserTransactions(user.uid)
        ]);
        
        if (userProfile) {
          setProfile(userProfile);
          setTransactions(userTransactions);
        } else {
          router.push("/complete-profile");
        }
      } catch (error) {
        console.error("Failed to fetch wallet data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, router]);

  if (loading || authLoading || !profile) {
    return <LoadingSpinner text="Loading your wallet..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-2 flex items-center gap-3">
          <WalletIcon className="w-10 h-10 text-primary" /> My Wallet
        </h1>
        <p className="text-lg text-muted-foreground">View your SkillCoin balance and transaction history.</p>
      </header>

      <Card className="mb-8 max-w-sm">
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Coins className="w-12 h-12 text-yellow-400" />
          <div className="text-5xl font-bold">{profile.coins || 0}</div>
           <div className="text-2xl text-muted-foreground">SkillCoins</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>A log of all your SkillCoin transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.timestamp ? format(tx.timestamp.toDate(), 'PPp') : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === 'credit' ? 'secondary' : 'destructive'}>
                        {tx.type === 'credit' ? <ArrowUpRight className="mr-2 h-4 w-4"/> : <ArrowDownLeft className="mr-2 h-4 w-4"/>}
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell className={`text-right font-semibold ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No transactions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
