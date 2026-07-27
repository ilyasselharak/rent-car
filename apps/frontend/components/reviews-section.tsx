"use client";

import { Star, ThumbsUp, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: {
    user: {
      name: string | null;
      avatar: string | null;
    };
  };
}

interface ReviewsSectionProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  className?: string;
}

function RatingBar({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium w-8 text-right">{value}</span>
    </div>
  );
}

export function ReviewsSection({
  reviews,
  averageRating = 0,
  totalReviews,
  className,
}: ReviewsSectionProps) {
  const ratingDistribution = [0, 0, 0, 0, 0];
  reviews.forEach((review) => {
    const rating = review.rating ?? 0;
    if (rating >= 1 && rating <= 5) {
      ratingDistribution[rating - 1]!++;
    }
  });

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Reviews</h2>
        {totalReviews > 0 && (
          <span className="text-sm text-muted-foreground">
            ({totalReviews})
          </span>
        )}
      </div>

      {totalReviews === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed bg-muted/20">
          <MessageSquare className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No reviews yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Be the first to review this vehicle
          </p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-6 p-6 rounded-xl border bg-card">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="text-5xl font-bold tracking-tight">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < Math.round(averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    )}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </div>
            </div>
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => (
                <RatingBar
                  key={star}
                  label={`${star} ${star === 1 ? "star" : "stars"}`}
                  value={ratingDistribution[star - 1]!}
                  max={reviews.length}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-5 rounded-xl border bg-card transition-all duration-200 hover:shadow-sm hover:border-primary/10"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={review.customer.user.avatar || ""} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {review.customer.user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {review.customer.user.name || "Anonymous"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3.5 w-3.5",
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted"
                          )}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
