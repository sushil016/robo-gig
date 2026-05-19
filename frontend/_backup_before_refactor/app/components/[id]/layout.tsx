import type { Metadata } from "next";
import type { ReactNode } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === "production" ? "/_/backend" : "http://localhost:4000");

interface ComponentPayload {
  data?: {
    name?: string;
    description?: string;
    imageUrl?: string;
    category?: string;
  };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const res = await fetch(`${API_BASE}/api/components/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("Not found");
    const { data } = await res.json() as ComponentPayload;

    const name = data?.name ?? "Component";
    const description = data?.description ?? `${name} available at RoboRoot`;
    const image = data?.imageUrl;

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
