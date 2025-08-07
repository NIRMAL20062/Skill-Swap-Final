import { ScrollText } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center">
          <ScrollText className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="text-4xl font-headline font-bold">Terms & Conditions</h1>
          <p className="text-muted-foreground mt-2">Welcome to SkillSwap!</p>
        </header>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          <p>
            These terms govern your use of our platform. By signing up or using SkillSwap, you agree to comply with the following conditions:
          </p>

          <section>
            <h2 className="text-2xl font-headline font-semibold">1. Eligibility</h2>
            <p>You must be a student or professional with a verifiable skill to offer or a willingness to learn.</p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold">2. Code of Conduct</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Treat mentors and learners with respect.</li>
              <li>Do not misrepresent your skills or availability.</li>
              <li>No inappropriate behavior during sessions. Violations may lead to suspension.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold">3. Coin System Rules</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Each session costs 10 SkillCoins/hour.</li>
              <li>8 coins go to the mentor, 2 coins are retained by the platform.</li>
              <li>Coins expire 6 months after issuance to prevent hoarding.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold">4. Refund Policy</h2>
            <p>Since SkillCoins are part of a barter system, <strong>no refunds</strong> are issued. However, users may request coin adjustments in case of valid session issues (technical errors, no-shows).</p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold">5. Suspension & Termination</h2>
            <p>We reserve the right to suspend or terminate accounts for misuse, fake reviews, repeated no-shows, or policy violations.</p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-semibold">6. Legal Jurisdiction</h2>
            <p>This platform is operated under Indian law. Any disputes will be handled in the appropriate Indian court of jurisdiction.</p>
          </section>
        </div>
      </div>
    </div>
  );
}