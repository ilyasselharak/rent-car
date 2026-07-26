"use client";

import Link from "next/link";
import { Star, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ClientReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Reviews</h2>
        <p className="text-muted-foreground">Reviews you left for completed rentals</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Star className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            You haven&apos;t left any reviews yet. After completing a rental, you can rate and review the vehicle.
          </p>
          <Button asChild>
            <Link href="/dashboard/client/bookings">
              <CalendarDays className="mr-2 h-4 w-4" /> View My Bookings
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
