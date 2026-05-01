/**
 * Projects Listing Page
 * Browse all featured robotics projects
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '@/lib/api/projects.api';
import type { ProjectFilters, ProjectCategory, DifficultyLevel } from '@/lib/types/projects.types';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFiltersComponent } from '@/components/projects/ProjectFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Sparkles } from 'lucide-react';

export default function ProjectsPage() {
  const [filters, setFilters] = useState<ProjectFilters>(() => {
    const params =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : undefined;

    return {
      page: 1,
      limit: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      isPublic: true,
      search: params?.get('search') || undefined,
      category: (params?.get('category') as ProjectCategory | null) || undefined,
      difficulty: (params?.get('difficulty') as DifficultyLevel | null) || undefined,
    };
  });
  const [searchInput, setSearchInput] = useState(() =>
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('search') || ''
      : ''
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectApi.getProjects(filters),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleFilterChange = (newFilters: Partial<ProjectFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-[1600px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Featured Projects</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Explore amazing robotics and electronics projects with step-by-step guides
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </div>
      </form>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <ProjectFiltersComponent
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {data ? `Showing ${data.projects.length} of ${data.total} projects` : 'Loading...'}
            </p>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [
                  'createdAt' | 'title' | 'viewCount' | 'buildCount' | 'averageRating' | 'estimatedCostCents',
                  'asc' | 'desc'
                ];
                setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
              }}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="title-asc">Name (A-Z)</option>
              <option value="title-desc">Name (Z-A)</option>
              <option value="viewCount-desc">Most Viewed</option>
              <option value="buildCount-desc">Most Built</option>
              <option value="averageRating-desc">Highest Rated</option>
              <option value="estimatedCostCents-asc">Cost (Low to High)</option>
              <option value="estimatedCostCents-desc">Cost (High to Low)</option>
            </select>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load projects</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please try again later
              </p>
            </div>
          )}

          {/* Empty State */}
          {data && data.projects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg font-medium">No projects found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}

          {/* Projects Grid */}
          {data && data.projects.length > 0 && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {data.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(filters.page! - 1)}
                    disabled={filters.page === 1}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={filters.page === page ? 'default' : 'outline'}
                      onClick={() => handlePageChange(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={filters.page === data.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
