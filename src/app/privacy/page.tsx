import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center">
          <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="text-4xl font-headline font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">Effective Date: August 4, 2025</p>
        </header>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          <p>
            At SkillSwap, your privacy is our priority. This Privacy Policy outlines what data we collect, how we use it, and how we protect it.
          </p>

          <section>
            <h2 className="text-2xl font-headline font-semibold">1. Data We Collect</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Personal Information:</strong> Name, email address, college, location, and skills (to teach/learn).</li>
              <li><strong>Usage Data:</strong> Session bookings, coin transactions, ratings, and leaderboard activity.</li>
              <li><strong>Payment Information:</strong> If you purchase SkillCoins, we may collect billing details via secure third-party providers (e.g., Razorpay/Stripe).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold">2. How We Use Your Data</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To authenticate users via Firebase.</li>
              <li>To personalize your skill-matching experience.</li>
              <li>To schedule sessions via Google Calendar.</li>
              <li>To monitor platform engagement and prevent misuse.</li>
              <li>To send reminders, updates, and session-related notifications.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold">3. Data Sharing</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Third-Party Integrations:</strong> We use Firebase, Google Calendar API, and Razorpay/Stripe. These platforms have their own privacy policies.</li>
              <li><strong>We do NOT sell or trade your data</strong> to external advertisers or unauthorized third parties.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold">4. Data Security</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>All data is encrypted and stored securely via Firebase Firestore.</li>
              <li>Access is limited to verified administrators only.</li>
              <li>Coin expiry and rating verification ensure platform integrity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold">5. Your Rights</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>You may update your profile or delete your account anytime.</li>
              <li>For data access or deletion requests, contact us at <a href="mailto:kumar.nirmal2608@gmail.com" className="text-primary underline">kumar.nirmal2608@gmail.com</a>.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}