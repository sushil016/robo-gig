import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getProjectMetadataById } from "@/features/projects/services/project.service";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const project = await getProjectMetadataById(id);
    const title = project.title ?? "Project";
    const description = project.description ?? `${title} on RoboRoot`;
    const image = project.thumbnailUrl;

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
