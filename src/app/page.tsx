import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Handshake, BrainCircuit, Users, BookOpen } from 'lucide-react';
import Image from 'next/image';

const featureHighlights = [
  {
    icon: <BrainCircuit className="w-8 h-8" />,
    title: 'Trade Skills',
    description: 'Exchange your expertise for skills you want to learn. No money involved.',
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Collaborate with Peers',
    description: 'Connect with like-minded individuals and work on projects together.',
  },
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: 'Expand Your Knowledge',
    description: 'Learn new things from experienced users in a one-on-one setting.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900/10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Unlock Your Potential with SkillSwap
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    The ultimate platform where you can trade your skills, connect with peers, and grow your expertise without spending a dime.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">Get Started</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login">I have an account</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="collaboration learning"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">New Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Why You'll Love SkillSwap</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We've built a community-driven ecosystem for personal and professional growth.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              {featureHighlights.map((feature) => (
                <div key={feature.title} className="grid gap-2">
                   <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded-full text-secondary-foreground">
                        {feature.icon}
                    </div>
                    <h3 className="text-lg font-bold font-headline">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center h-16 border-t">
          <p className="text-sm text-muted-foreground">&copy; 2024 SkillSwap. All rights reserved.</p>
      </footer>
    </div>
  );
}
