"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  AlertTriangle,
  Coins,
  IndianRupee,
  Info,
} from "lucide-react";
import { getUserProfile, UserProfile } from "@/lib/firestore";
import LoadingSpinner from "@/components/layout/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SellCoinsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [coinsToSell, setCoinsToSell] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (authLoading || !user) return;

      try {
        const userProfile = await getUserProfile(user.uid);
        if (!userProfile) {
          router.push("/complete-profile");
          return;
        }
        setProfile(userProfile);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <LoadingSpinner text="Loading..." />;
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Required</h1>
          <Button asChild>
            <a href="/complete-profile">Complete Profile</a>
          </Button>
        </div>
      </div>
    );
  }

  const currentBalance = profile.coins || 0;
  const minimumBalance = 100;
  const availableToSell = Math.max(0, currentBalance - minimumBalance);
  const coinsToSellNumber = parseInt(coinsToSell) || 0;
  const rupeeAmount = coinsToSellNumber * 10;
  const canSell =
    currentBalance > minimumBalance &&
    coinsToSellNumber > 0 &&
    coinsToSellNumber <= availableToSell;

  const handleSellCoins = async () => {
    if (!canSell || !user) return;

    setIsProcessing(true);
    try {
      // This would typically integrate with your backend API
      // For now, we'll show a placeholder message
      toast({
        title: "Sell request submitted",
        description: `Your request to sell ${coinsToSellNumber} coins for INR ${rupeeAmount} has been submitted. Processing time: 3-5 business days.`,
      });

      router.push("/wallet");
    } catch (error) {
      console.error("Sell error:", error);
      toast({
        title: "Sell request failed",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // If user doesn't have enough coins
  if (currentBalance <= minimumBalance) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                Insufficient Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                You need more than {minimumBalance} SkillCoins to sell coins.
              </p>
              <p className="text-sm">
                Current balance:{" "}
                <span className="font-semibold">
                  {currentBalance} SkillCoins
                </span>
              </p>
              <p className="text-sm">
                Minimum required:{" "}
                <span className="font-semibold">
                  {minimumBalance} SkillCoins
                </span>
              </p>
              <Button asChild>
                <a href="/wallet/purchase">Purchase More Coins</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-headline font-bold mb-2">
            💸 Sell SkillCoins
          </h1>
          <p className="text-muted-foreground">
            Convert your SkillCoins back to cash
          </p>
        </div>

        {/* Current Balance */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Current Balance
                </p>
                <p className="text-xl font-bold flex items-center justify-center gap-2">
                  <Coins className="w-5 h-5 text-primary" />
                  {currentBalance}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Minimum Required
                </p>
                <p className="text-xl font-bold text-amber-600">
                  {minimumBalance}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Available to Sell
                </p>
                <p className="text-xl font-bold text-green-600">
                  {availableToSell}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sell Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sell Coins</CardTitle>
            <CardDescription>
              Enter the number of coins you want to sell
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="coinsToSell">Number of Coins to Sell</Label>
              <Input
                id="coinsToSell"
                type="number"
                placeholder="Enter coins to sell"
                value={coinsToSell}
                onChange={(e) => setCoinsToSell(e.target.value)}
                min="1"
                max={availableToSell}
              />
              <p className="text-sm text-muted-foreground">
                Maximum: {availableToSell} coins
              </p>
            </div>

            {coinsToSellNumber > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">You will receive:</span>
                  <span className="text-xl font-bold flex items-center gap-1">
                    <IndianRupee className="w-5 h-5" />
                    {rupeeAmount.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Exchange rate: 1 SkillCoin = INR 10
                </p>
              </div>
            )}

            <Button
              onClick={handleSellCoins}
              disabled={!canSell || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  <IndianRupee className="w-5 h-5 mr-2" />
                  Sell {coinsToSellNumber || 0} Coins
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Important Information */}
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Processing Time:</strong> Coin sales are processed within
              3-5 business days. Amount will be transferred to your registered
              bank account.
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Minimum Balance:</strong> You must maintain at least 100
              SkillCoins in your wallet to continue using the platform services.
            </AlertDescription>
          </Alert>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Bank Details:</strong> Make sure your bank account details
              are updated in your profile settings before selling coins.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
