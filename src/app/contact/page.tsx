import { Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-xl mx-auto">
        <header className="mb-8 text-center">
          <Mail className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="text-4xl font-headline font-bold">Contact Us</h1>
          <p className="text-muted-foreground mt-2">
            We’re here to help! If you have any questions, feedback, or issues regarding SkillSwap, feel free to reach out.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <strong className="w-20">Name:</strong>
              <span>Nirmal Kumar</span>
            </div>
            <div className="flex items-center gap-4">
               <strong className="w-20">Email:</strong>
               <a href="mailto:kumar.nirmal2608@gmail.com" className="text-primary hover:underline">kumar.nirmal2608@gmail.com</a>
            </div>
            <div className="flex items-center gap-4">
                <strong className="w-20">Phone:</strong>
                <a href="tel:+919356668568" className="text-primary hover:underline">+91 9356668568</a>
            </div>
            <div className="flex items-start gap-4">
                <strong className="w-20 shrink-0">Availability:</strong>
                <span className="text-muted-foreground">Monday–Saturday, 10:00 AM to 6:00 PM IST</span>
            </div>
             <div className="pt-4 text-center text-muted-foreground">
                <p>Alternatively, use the contact form on our website, and we’ll respond within 48 hours.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}