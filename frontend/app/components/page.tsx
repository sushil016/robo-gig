import { Suspense } from "react";
import { MarketplacePage } from "@/features/products/components/MarketplacePage";

export default function ComponentsPage() {
  return (
    <Suspense>
      <MarketplacePage />
    </Suspense>
  );
}
