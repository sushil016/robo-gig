import { Suspense } from "react";
import { MarketplacePage } from "@/features/marketplace/components/MarketplacePage";

export default function ComponentsPage() {
  return (
    <Suspense>
      <MarketplacePage />
    </Suspense>
  );
}
