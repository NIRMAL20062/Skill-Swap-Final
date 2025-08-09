// src/app/api/payments/verify/route.ts
// Updated to handle development mode permissions gracefully and use client-provided user emails
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  runTransaction,
  collection,
  addDoc,
} from "firebase/firestore";
import { sendPaymentConfirmationEmail } from "@/lib/email";

// Initialize Firebase for server-side use
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      paymentId,
      userId,
      amount,
      coins,
      userEmail, // Client provides user email from auth
      userName, // Client provides user name from auth
    } = await request.json();

    // Always verify Razorpay signature first
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Invalid Razorpay signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Log successful verification for development
    console.log("✅ Payment signature verified successfully:", {
      paymentId,
      userId,
      amount,
      coins,
      razorpay_payment_id,
      razorpay_order_id,
    });

    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === "development";

    // Use client-provided user details (from authenticated user context)
    const finalUserEmail = userEmail || "user@example.com";
    const finalUserName = userName || "Test User";

    console.log(
      `📧 Using email from client auth: ${finalUserEmail} for user: ${finalUserName}`
    );
    console.log(
      `✅ Real user email delivered via client-side authentication context`
    );

    if (isDevelopment) {
      console.log(
        "🧪 Running in DEVELOPMENT mode - simulating database updates"
      );
      console.log(`📝 Would update user ${userId} with +${coins} coins`);
      console.log(`💰 Payment ${paymentId} would be marked as completed`);

      // CREATE TRANSACTION RECORD even in development mode
      try {
        const transactionData = {
          userId,
          type: "purchase" as const,
          amount: coins,
          description: `Purchased ${coins} coins for INR ${amount}`,
          timestamp: new Date(),
          paymentId,
          exchangeRate: 10,
          rupeeAmount: amount,
        };

        const transactionRef = doc(collection(db, "transactions"));
        await setDoc(transactionRef, transactionData);
        console.log(
          "✅ Transaction record created successfully in development mode"
        );
      } catch (transactionError) {
        console.error(
          "❌ Failed to create transaction record:",
          transactionError
        );
      }

      // Send confirmation email with REAL user email
      const emailResult = await sendPaymentConfirmationEmail({
        userEmail: finalUserEmail,
        userName: finalUserName,
        paymentId,
        orderId: razorpay_order_id,
        amount,
        coins,
        paymentDate: new Date().toLocaleString(),
        razorpayPaymentId: razorpay_payment_id,
      });

      console.log(`📧 Email result: ${emailResult.message}`);

      // In development, return success without database operations
      return NextResponse.json({
        success: true,
        message: "Payment verified successfully (development mode)",
        data: {
          paymentId,
          userId,
          coinsAdded: coins,
          amount,
          emailSent: emailResult.success,
        },
      });
    }

    // Production database updates would go here
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", userId);
        const userDoc = await transaction.get(userRef);
        const currentCoins = userDoc.data()?.coins || 0;

        // Update user coins
        transaction.update(userRef, {
          coins: currentCoins + coins,
          updatedAt: new Date(),
        });

        // Mark payment as completed
        const paymentRef = doc(db, "payments", paymentId);
        transaction.update(paymentRef, {
          status: "completed",
          completedAt: new Date(),
        });

        // Create transaction record
        const transactionRef = doc(collection(db, "transactions"));
        transaction.set(transactionRef, {
          userId,
          type: "purchase",
          amount: coins,
          description: `Purchased ${coins} coins for INR ${amount}`,
          timestamp: new Date(),
          paymentId,
          exchangeRate: 10,
          rupeeAmount: amount,
        });
      });

      // Send confirmation email
      const emailResult = await sendPaymentConfirmationEmail({
        userEmail: finalUserEmail,
        userName: finalUserName,
        paymentId,
        orderId: razorpay_order_id,
        amount,
        coins,
        paymentDate: new Date().toLocaleString(),
        razorpayPaymentId: razorpay_payment_id,
      });

      return NextResponse.json({
        success: true,
        message: "Payment processed successfully",
        data: {
          paymentId,
          userId,
          coinsAdded: coins,
          amount,
          emailSent: emailResult.success,
        },
      });
    } catch (error) {
      console.error("❌ Database update failed:", error);
      return NextResponse.json(
        { error: "Payment processed but database update failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Payment verification failed:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
