
import { Handshake } from "lucide-react";

type LoadingSpinnerProps = {
  text?: string;
};

export default function LoadingSpinner({ text = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute h-full w-full animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <Handshake className="h-10 w-10 text-primary" />
      </div>
      <p className="mt-4 text-lg font-medium text-foreground">{text}</p>
    </div>
  );
}
