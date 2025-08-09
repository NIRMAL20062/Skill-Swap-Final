import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewStarsProps {
  rating: number;
  className?: string;
}

export function ReviewStars({ rating, className }: ReviewStarsProps) {
  // Ensure rating is a valid number between 0 and 5
  const validRating = Math.max(0, Math.min(5, isNaN(rating) ? 0 : rating));

  const totalStars = 5;
  const fullStars = Math.floor(validRating);
  const partialStar = validRating - fullStars;
  const emptyStars = totalStars - Math.ceil(validRating);

  return (
    <div className={cn("flex items-center", className)}>
      {fullStars > 0 &&
        [...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className="h-4 w-4 text-yellow-400 fill-yellow-400"
          />
        ))}
      {partialStar > 0 && (
        <div className="relative">
          <Star key="partial" className="h-4 w-4 text-yellow-400" />
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: `${partialStar * 100}%` }}
          >
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          </div>
        </div>
      )}
      {emptyStars > 0 &&
        [...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
        ))}
    </div>
  );
}
