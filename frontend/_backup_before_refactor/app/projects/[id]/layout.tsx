import type { Metadata } from "next";
import type { ReactNode } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === "production" ? "/_/backend" : "http://localhost:4000");

interface ProjectPayload {
  data?: { title?: string; description?: string; thumbnailUrl?: string };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const res = await fetch(`${API_BASE}/api/projects/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("Not found");
    const { data } = await res.json() as ProjectPayload;

    const title = data?.title ?? "Project";
    const description = data?.description ?? `${title} on RoboRoot`;
    const image = data?.thumbnailUrl;

    return {
      title: `${title} | RoboRoot`,
      description,
      openGraph: {
        title: `${title} | RoboRoot`,
        description,
        ...(image ? { images: [{ url: image }] } : {}),
      },
    };
  } catch {
    return {
      title: "Project | RoboRoot",
      description: "Robotics and electronics project kits for makers and engineers.",
    };
  }
}

export default function ProjectDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
