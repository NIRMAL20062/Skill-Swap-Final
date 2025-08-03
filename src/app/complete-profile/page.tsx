
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getUserProfile, updateUserProfile, UserProfile } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/layout/loading-spinner";
import { User, Github, Linkedin, Code, Lightbulb, GraduationCap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters."),
  skillsToTeach: z.string().min(1, "Please list at least one skill to teach."),
  skillsToLearn: z.string().min(1, "Please list at least one skill to learn."),
  linkedinProfile: z.string().url("Please enter a valid LinkedIn URL.").min(1, "LinkedIn profile is required."),
  githubProfile: z.string().url("Please enter a valid GitHub URL.").optional().or(z.literal('')),
  leetcodeProfile: z.string().url("Please enter a valid LeetCode URL.").optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const steps = [
  { id: "displayName", title: "What's your name?", description: "Let's start with the basics.", icon: <User />, fields: ["displayName"] },
  { id: "skillsToTeach", title: "What skills can you teach?", description: "List your areas of expertise. Separate skills with a comma.", icon: <GraduationCap />, fields: ["skillsToTeach"] },
  { id: "skillsToLearn", title: "What do you want to learn?", description: "What skills are you eager to acquire? Separate skills with a comma.", icon: <Lightbulb />, fields: ["skillsToLearn"] },
  { id: "linkedinProfile", title: "Your LinkedIn Profile", description: "This is required to help build trust in the community.", icon: <Linkedin />, fields: ["linkedinProfile"] },
  { id: "socialProfiles", title: "Optional: Other Profiles", description: "Link your other professional profiles to showcase your work.", icon: <Code />, fields: ["githubProfile", "leetcodeProfile"] },
];

export default function CompleteProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      skillsToTeach: "",
      skillsToLearn: "",
      linkedinProfile: "",
      githubProfile: "",
      leetcodeProfile: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        setProfileLoading(true);
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          form.reset({
            displayName: userProfile.displayName || user.displayName || "",
            skillsToTeach: (userProfile.skillsToTeach || []).join(", "),
            skillsToLearn: (userProfile.skillsToLearn || []).join(", "),
            linkedinProfile: userProfile.linkedinProfile || "",
            githubProfile: userProfile.githubProfile || "",
            leetcodeProfile: userProfile.leetcodeProfile || "",
          });
        }
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, [user, form]);

  const nextStep = async () => {
    const fields = steps[currentStep].fields;
    const isValid = await form.trigger(fields as FieldPath<ProfileFormValues>[]);
    if (!isValid) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(step => step + 1);
    } else {
      await form.handleSubmit(onSubmit)();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(step => step - 1);
    }
  };

  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    setIsSaving(true);
    
    const updatedProfileData: Partial<UserProfile> = {
      displayName: data.displayName,
      skillsToTeach: data.skillsToTeach.split(',').map(s => s.trim()).filter(Boolean),
      skillsToLearn: data.skillsToLearn.split(',').map(s => s.trim()).filter(Boolean),
      linkedinProfile: data.linkedinProfile,
      githubProfile: data.githubProfile,
      leetcodeProfile: data.leetcodeProfile,
    };

    try {
      await updateUserProfile(user.uid, updatedProfileData);
      toast({
        title: "Profile Complete!",
        description: "Your profile has been saved. Welcome!",
      });
      startTransition(() => {
        router.push('/dashboard');
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const loading = authLoading || profileLoading || isSaving || isPending;
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (loading) {
    return <LoadingSpinner text={isSaving ? "Saving..." : "Loading..."} />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            Let's get you set up to start swapping skills.
          </CardDescription>
          <Progress value={progress} className="w-full mt-4" />
        </CardHeader>
        <CardContent className="overflow-hidden relative min-h-[300px]">
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-8">
                      <div className="flex items-center justify-center gap-3">
                         <div className="p-3 bg-secondary rounded-lg text-secondary-foreground">{steps[currentStep].icon}</div>
                         <div>
                            <h2 className="text-xl font-semibold font-headline">{steps[currentStep].title}</h2>
                            <p className="text-muted-foreground">{steps[currentStep].description}</p>
                        </div>
                      </div>
                  </div>

                  {currentStep === 0 && (
                    <FormField control={form.control} name="displayName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  )}

                  {currentStep === 1 && (
                    <FormField control={form.control} name="skillsToTeach" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills You Can Teach</FormLabel>
                        <FormControl><Input placeholder="e.g., React, Python, UI Design" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  )}

                  {currentStep === 2 && (
                     <FormField control={form.control} name="skillsToLearn" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills You Want to Learn</FormLabel>
                        <FormControl><Input placeholder="e.g., Go, Figma, Project Management" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  )}

                   {currentStep === 3 && (
                     <FormField control={form.control} name="linkedinProfile" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Linkedin size={16}/> LinkedIn Profile URL *</FormLabel>
                          <FormControl><Input placeholder="https://linkedin.com/in/yourprofile" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                  )}
                  
                  {currentStep === 4 && (
                    <div className="space-y-4">
                       <FormField control={form.control} name="githubProfile" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Github size={16}/> GitHub Profile URL (Optional)</FormLabel>
                          <FormControl><Input placeholder="https://github.com/yourusername" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                       <FormField control={form.control} name="leetcodeProfile" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Code size={16}/> LeetCode Profile URL (Optional)</FormLabel>
                          <FormControl><Input placeholder="https://leetcode.com/yourusername" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
              Back
            </Button>
            <Button onClick={nextStep}>
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
