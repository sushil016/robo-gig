"use client";

import { useQuery } from "@tanstack/react-query";
import { projectApi } from "@/features/projects/services/project.service";
import type { ProjectFilters } from "@/features/projects/types/project.types";

export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: () => projectApi.getProjects(filters),
  });
}
