"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, Coins, Check } from "lucide-react";
import { getUserProfile, UserProfile } from "@/lib/firestore";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect } from "react";
import LoadingSpinner from "@/components/layout/loading-spinner";

// Coin packages
const COIN_PACKAGES = [
  { coins: 10, price: 100, popular: false },
  { coins: 25, price: 250, popular: true },
  { coins: 50, price: 500, popular: false },
  { coins: 100, price: 1000, popular: false },
];

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PurchaseCoinsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
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

  const handlePurchase = async (packageIndex: number) => {
    if (!user || !profile) return;

    const selectedPkg = COIN_PACKAGES[packageIndex];
    setSelectedPackage(packageIndex);
    setIsProcessing(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay script failed to load");
      }

      // Create order
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedPkg.price,
          coins: selectedPkg.coins,
          userId: user.uid,
        }),
      });

      const orderData = await response.json();
      if (!response.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // Configure Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SkillSwap",
        description: `Purchase ${selectedPkg.coins} SkillCoins`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                paymentId: orderData.paymentId,
                userId: user.uid,
                amount: selectedPkg.price,
                coins: selectedPkg.coins,
                userEmail: user.email, // Include user email from auth
                userName: user.displayName || profile?.displayName || "User", // Include user name
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            // Update local profile state
            await updateUserCoins(selectedPkg.coins);

            toast({
              title: "Payment successful!",
              description: `${selectedPkg.coins} SkillCoins added to your wallet.`,
            });

            router.push("/wallet");
          } catch (error) {
            console.error("Payment verification error:", error);
            toast({
              title: "Payment verification failed",
              description: "Please contact support if amount was debited.",
              variant: "destructive",
            });
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setSelectedPackage(null);
          },
        },
        prefill: {
          email: user.email,
          name: profile.displayName,
        },
        theme: {
          color: "#000000",
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase failed",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      setIsProcessing(false);
      setSelectedPackage(null);
    }
  };

  const updateUserCoins = async (coinsToAdd: number) => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        coins: increment(coinsToAdd),
        totalCoinsPurchased: increment(coinsToAdd),
        isPaymentVerified: true,
      });

      // Update local state
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              coins: (prev.coins || 0) + coinsToAdd,
              totalCoinsPurchased: (prev.totalCoinsPurchased || 0) + coinsToAdd,
              isPaymentVerified: true,
            }
          : null
      );
    } catch (error) {
      console.error("Error updating user coins:", error);
      throw error;
    }
  };

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
            💰 Buy SkillCoins
          </h1>
          <p className="text-muted-foreground">
            Choose a package to add coins to your wallet
          </p>
        </div>

        {/* Current Balance */}
        <Card className="mb-8 bg-muted/50">
          <CardContent className="flex items-center justify-center py-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Current Balance
              </p>
              <p className="text-2xl font-bold flex items-center justify-center gap-2">
                <Coins className="w-6 h-6 text-primary" />
                {profile.coins || 0} SkillCoins
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Coin Packages */}
        <div className="grid gap-4 mb-8">
          {COIN_PACKAGES.map((pkg, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all hover:shadow-md ${
                pkg.popular ? "ring-2 ring-primary" : ""
              } ${selectedPackage === index ? "ring-2 ring-primary" : ""}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Coins className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {pkg.coins} SkillCoins
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        INR {pkg.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pkg.popular && <Badge variant="default">Popular</Badge>}
                    <Button
                      onClick={() => handlePurchase(index)}
                      disabled={isProcessing}
                    >
                      {isProcessing && selectedPackage === index ? (
                        "Processing..."
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Buy Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Info */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span>Secure payment powered by Razorpay</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span>Instant coin delivery to your wallet</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span>1 SkillCoin = INR 10 value</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span>Use coins to book learning sessions</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
