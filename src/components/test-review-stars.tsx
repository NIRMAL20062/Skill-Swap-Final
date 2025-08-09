// Test file to verify ReviewStars component handles edge cases
// You can delete this after testing

import { ReviewStars } from "@/components/ui/review-stars";

// Test cases that would have caused the RangeError
const testCases = [
  { rating: -1, description: "Negative rating" },
  { rating: NaN, description: "NaN rating" },
  { rating: Infinity, description: "Infinity rating" },
  { rating: 6, description: "Rating above 5" },
  { rating: 0, description: "Zero rating" },
  { rating: 4.5, description: "Valid decimal rating" },
];

export function TestReviewStars() {
  return (
    <div className="p-4 space-y-4">
      <h2>ReviewStars Edge Case Tests</h2>
      {testCases.map(({ rating, description }, index) => (
        <div key={index} className="border p-2 rounded">
          <p>
            {description}: {rating}
          </p>
          <ReviewStars rating={rating} />
        </div>
      ))}
    </div>
  );
}
