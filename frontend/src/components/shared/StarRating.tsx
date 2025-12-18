import { cn } from "@/utils/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number; // (0-5)
  maxRating?: number;
  onRatingChange?: (rating: number) => void; // torna o componente interativo se fornecido
  readOnly?: boolean;
  size?: number;
}

export const StarRating = ({
  rating,
  maxRating = 5,
  onRatingChange,
  readOnly = false,
  size = 20,
}: StarRatingProps) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;

        return (
          <Star
            key={index}
            size={size}
            className={cn(
              "transition-colors",
              isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
              !readOnly && "cursor-pointer hover:scale-110"
            )}
            onClick={() => !readOnly && onRatingChange?.(starValue)}
          />
        );
      })}
    </div>
  );
};
