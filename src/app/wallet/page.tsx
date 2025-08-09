"use client";

import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { getUserProfile, UserProfile, Transaction } from "@/lib/firestore";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import LoadingSpinner from "@/components/layout/loading-spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Coins,
  CreditCard,
  TrendingUp,
  TrendingDown,
  History,
  Plus,
  Minus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWalletData() {
      if (authLoading || !user) return;

      try {
        setLoading(true);

        // Get user profile
        const userProfile = await getUserProfile(user.uid);
        if (!userProfile) {
          router.push("/complete-profile");
          return;
        }
        setProfile(userProfile);

        // Get recent transactions
        const transactionsQuery = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc"),
          limit(10)
        );

        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactionsData = transactionsSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Transaction)
        );

        setTransactions(transactionsData);
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWalletData();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <LoadingSpinner text="Loading wallet..." />;
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Required</h1>
          <p className="text-muted-foreground mb-4">
            Please complete your profile to access wallet features.
          </p>
          <Button asChild>
            <Link href="/complete-profile">Complete Profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentBalance = profile.coins || 0;
  const balanceValue = currentBalance * 10; // INR 10 per coin
  const canSellCoins = currentBalance > 100;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold mb-2">
              💼 My Wallet
            </h1>
            <p className="text-muted-foreground">
              Manage your SkillCoins and transactions
            </p>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Coins className="w-8 h-8 text-primary" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <p className="text-4xl md:text-5xl font-bold text-primary">
                  {currentBalance}
                  <span className="text-xl ml-2 text-muted-foreground">
                    SkillCoins
                  </span>
                </p>
                <p className="text-xl text-muted-foreground">
                  ≈ INR {balanceValue.toLocaleString()} value
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="min-w-40">
                  <Link href="/wallet/purchase">
                    <Plus className="w-5 h-5 mr-2" />
                    Buy Coins
                  </Link>
                </Button>

                <Button
                  asChild
                  variant={canSellCoins ? "outline" : "secondary"}
                  size="lg"
                  className="min-w-40"
                  disabled={!canSellCoins}
                >
                  {canSellCoins ? (
                    <Link href="/wallet/sell">
                      <Minus className="w-5 h-5 mr-2" />
                      Sell Coins
                    </Link>
                  ) : (
                    <span>
                      <Minus className="w-5 h-5 mr-2" />
                      Sell Coins
                    </span>
                  )}
                </Button>
              </div>

              {!canSellCoins && (
                <p className="text-sm text-muted-foreground">
                  ⚠️ Minimum 100+ coins required to sell
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Earned
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {profile.totalCoinsEarned || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                coins from sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {profile.totalCoinsSpent || 0}
              </div>
              <p className="text-xs text-muted-foreground">coins on sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Purchased</CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {profile.totalCoinsPurchased || 0}
              </div>
              <p className="text-xs text-muted-foreground">coins bought</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Transaction History
            </CardTitle>
            <CardDescription>
              Complete history of your wallet activities and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h3 className="font-medium text-lg mb-2">
                  No transactions yet
                </h3>
                <p className="text-sm mb-4">
                  Your transaction history will appear here
                </p>
                <Button asChild variant="outline">
                  <Link href="/wallet/purchase">
                    <Plus className="w-4 h-4 mr-2" />
                    Purchase Your First Coins
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const isCredit =
                    transaction.type === "credit" ||
                    transaction.type === "purchase" ||
                    transaction.type === "session_earning";

                  const getTransactionIcon = () => {
                    switch (transaction.type) {
                      case "purchase":
                        return <CreditCard className="w-4 h-4" />;
                      case "sale":
                        return <Minus className="w-4 h-4" />;
                      case "session_earning":
                        return <TrendingUp className="w-4 h-4" />;
                      case "session_payment":
                        return <TrendingDown className="w-4 h-4" />;
                      default:
                        return isCredit ? (
                          <Plus className="w-4 h-4" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        );
                    }
                  };

                  const getTransactionTitle = () => {
                    switch (transaction.type) {
                      case "purchase":
                        return "💳 Coin Purchase";
                      case "sale":
                        return "💰 Coin Sale";
                      case "session_earning":
                        return "🎯 Session Earning";
                      case "session_payment":
                        return "📚 Session Payment";
                      case "credit":
                        return "✅ Credit Added";
                      case "debit":
                        return "❌ Debit";
                      default:
                        return transaction.type;
                    }
                  };

                  return (
                    <div
                      key={transaction.id}
                      className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                        isCredit
                          ? "border-green-200 bg-green-50/50"
                          : "border-red-200 bg-red-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2.5 rounded-full ${
                              isCredit
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {getTransactionIcon()}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm">
                                {getTransactionTitle()}
                              </p>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  isCredit
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {isCredit ? "Added" : "Spent"}
                              </span>
                            </div>

                            <p className="text-sm text-muted-foreground mb-2">
                              {transaction.description ||
                                "No description available"}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                📅{" "}
                                {transaction.timestamp
                                  ?.toDate?.()
                                  ?.toLocaleDateString() || "Recent"}
                              </span>
                              <span>
                                🕒{" "}
                                {transaction.timestamp
                                  ?.toDate?.()
                                  ?.toLocaleTimeString() || "N/A"}
                              </span>
                              {transaction.exchangeRate && (
                                <span>
                                  💱 INR {transaction.exchangeRate}/coin
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p
                            className={`font-bold text-lg ${
                              isCredit ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isCredit ? "+" : "-"}
                            {transaction.amount} coins
                          </p>

                          {transaction.rupeeAmount && (
                            <p className="text-sm font-medium text-muted-foreground">
                              INR {transaction.rupeeAmount.toLocaleString()}
                            </p>
                          )}

                          {transaction.paymentId && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ID: {transaction.paymentId.slice(-8)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* View More Button */}
                <div className="pt-4 text-center">
                  <Button variant="outline" className="w-full">
                    <History className="w-4 h-4 mr-2" />
                    View All Transactions
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
