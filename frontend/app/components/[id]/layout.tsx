import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getProductMetadataById } from "@/features/products/services/product.service";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const component = await getProductMetadataById(id);
    const name = component.name ?? "Component";
    const description = component.description ?? `${name} available at RoboRoot`;
    const image = component.imageUrl;

    return {
      title: `${name} | RoboRoot`,
      description,
      openGraph: {
        title: `${name} | RoboRoot`,
        description,
        ...(image ? { images: [{ url: image }] } : {}),
      },
    };
  } catch {
    return {
      title: "Component | RoboRoot",
      description: "Electronics components and robotics kits for makers and engineers.",
    };
  }
}

export default function ComponentDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
