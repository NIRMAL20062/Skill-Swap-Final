
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getUserProfile, updateUserProfile, UserProfile } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/layout/loading-spinner";
import { User, Github, Linkedin, Code } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters."),
  skillsToTeach: z.string().min(1, "Please list at least one skill to teach."),
  skillsToLearn: z.string().min(1, "Please list at least one skill to learn."),
  linkedinProfile: z.string().url("Please enter a valid LinkedIn URL.").min(1, "LinkedIn profile is required."),
  githubProfile: z.string().url("Please enter a valid GitHub URL.").optional().or(z.literal('')),
  leetcodeProfile: z.string().url("Please enter a valid LeetCode URL.").optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
        setProfile(userProfile);
        if (userProfile) {
          form.reset({
            displayName: userProfile.displayName || "",
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
        title: "Profile Updated",
        description: "Your information has been saved successfully.",
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

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
       <div className="container mx-auto px-4 py-8 md:py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full max-w-sm mt-2" />
          </CardHeader>
          <CardContent className="space-y-8">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32 ml-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {isSaving && <LoadingSpinner text="Saving..." />}
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">My Profile</CardTitle>
              <CardDescription>View and edit your public information here. Keep it up to date!</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skillsToTeach"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills You Can Teach</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., React, Python, UI Design" {...field} />
                    </FormControl>
                    <FormDescription>
                      Separate skills with a comma. This is required.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skillsToLearn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills You Want to Learn</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Go, Figma, Project Management" {...field} />
                    </FormControl>
                    <FormDescription>
                      Separate skills with a comma. This is required.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Social Profiles</h3>
                <FormField
                  control={form.control}
                  name="linkedinProfile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Linkedin /> LinkedIn Profile URL *</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="githubProfile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Github /> GitHub Profile URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/yourusername" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="leetcodeProfile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Code /> LeetCode Profile URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://leetcode.com/yourusername" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
