'use client';

import { useState } from 'react';
import { suggestSkills, type SkillSuggestionOutput } from '@/ai/flows/skill-suggestion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

export default function AiSkillSuggestion() {
  const [userProfile, setUserProfile] = useState(
    'Software engineer with experience in React, TypeScript, and Node.js. Interested in learning about project management and cloud computing. Recently watched tutorials on AWS and Docker.'
  );
  const [suggestions, setSuggestions] = useState<SkillSuggestionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuggestions(null);

    try {
      const result = await suggestSkills({ userProfile });
      setSuggestions(result);
    } catch (error) {
      console.error('Skill suggestion failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to get skill suggestions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg border-2 border-primary/20">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-2">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="font-headline text-2xl">Discover New Skills</CardTitle>
        <CardDescription>Let our AI suggest skills to enhance your profile based on your interests and history.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="user-profile">Your Profile & Interests</Label>
            <Textarea
              id="user-profile"
              placeholder="e.g., I'm a designer skilled in Figma, interested in learning 3D modeling..."
              value={userProfile}
              onChange={(e) => setUserProfile(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>
          {isLoading && (
            <div className="space-y-2 pt-4">
              <Skeleton className="h-8 w-1/3" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
            </div>
          )}
          {suggestions && suggestions.suggestedSkills.length > 0 && (
            <div className="space-y-2 pt-4 animate-in fade-in-50">
              <h4 className="font-semibold flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-secondary" />
                Here are some suggestions for you:
              </h4>
              <div className="flex flex-wrap gap-2">
                {suggestions.suggestedSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-lg py-1 px-3">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Suggest Skills"}
            {!isLoading && <Sparkles className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
