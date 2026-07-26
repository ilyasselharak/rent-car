"use client";

import Link from "next/link";
import { Heart, Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ClientFavoritesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Favorites</h2>
        <p className="text-muted-foreground">Your saved vehicles</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            You haven&apos;t saved any vehicles yet. Browse our fleet and save the ones you like.
          </p>
          <Button asChild>
            <Link href="/vehicles">
              <Car className="mr-2 h-4 w-4" /> Browse Vehicles
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
