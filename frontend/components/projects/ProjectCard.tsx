/**
 * Project Card Component
 * Professional design with consistent spacing and sizing
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Project } from '@/lib/types/projects.types';
import { 
  getCategoryLabel,
  formatBuildTime
} from '@/lib/utils/project-utils';
import { 
  Clock, 
  Eye, 
  ShoppingCart
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const handleBuyProject = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `/projects/${project.id}`;
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
      {/* Most Popular Badge - Fixed Height */}
      <div className="h-12 flex items-center px-6 border-b bg-muted/30">
        {project.isFeatured ? (
          <Badge variant="outline" className="text-xs font-medium">
            Most popular
          </Badge>
        ) : (
          <div className="h-5" /> // Placeholder to maintain consistent height
        )}
      </div>

      <div className="flex-1 flex flex-col p-6 space-y-5">
        {/* Project Thumbnail - Fixed Aspect Ratio */}
        <Link href={`/projects/${project.id}`} className="block">
          <div className="relative w-full aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-xl overflow-hidden border-2 border-border shadow-sm hover:shadow-md transition-shadow">
            {project.thumbnailUrl ? (
              <Image
                src={project.thumbnailUrl}
                alt={project.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-muted-foreground text-sm font-medium">Image</span>
              </div>
            )}
          </div>
        </Link>

        {/* Project Details Section - Consistent Spacing */}
        <div className="space-y-4 flex-1">
          {/* Category */}
          <div className="text-sm leading-relaxed">
            <span className="font-semibold text-foreground">category: </span>
            <span className="text-muted-foreground">{getCategoryLabel(project.category)}</span>
          </div>

          {/* Title */}
          <Link href={`/projects/${project.id}`} className="block">
            <div className="text-sm leading-relaxed">
              <span className="font-semibold text-foreground">Title: </span>
              <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                {project.title}
              </span>
            </div>
          </Link>

          {/* Description - Fixed Height with Line Clamp */}
          {project.summary && (
            <div className="text-sm leading-relaxed">
              <span className="font-semibold text-foreground">Description: </span>
              <span className="text-muted-foreground line-clamp-2">
                {project.summary}
              </span>
            </div>
          )}

          {/* Component Used Section - Fixed Height */}
          <div className="space-y-3 min-h-[180px]">
            <h4 className="font-semibold text-sm text-foreground">Component used</h4>
            
            {project.components && project.components.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {project.components.slice(0, 3).map((pc) => (
                  <Link
                    key={pc.id}
                    href={`/components/${pc.component.id}`}
                    className="flex-shrink-0 group"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="border-2 border-border rounded-lg p-3 hover:border-primary hover:shadow-md transition-all duration-300 w-36 h-36 flex flex-col">
                      {/* Component Image - Fixed Square */}
                      <div className="relative w-full h-20 bg-muted rounded mb-2 overflow-hidden flex-shrink-0">
                        {pc.component.imageUrl ? (
                          <Image
                            src={pc.component.imageUrl}
                            alt={pc.component.name}
                            fill
                            className="object-cover rounded group-hover:scale-110 transition-transform duration-300"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[10px] text-muted-foreground text-center px-1 leading-tight">
                              Image of<br />component
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Component Name - Fixed Height with Line Clamp */}
                      <p className="text-xs text-center line-clamp-2 text-foreground font-medium flex-1 flex items-center justify-center">
                        {pc.component.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-36 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                <span className="text-xs text-muted-foreground">No components yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section - Fixed Height */}
        <div className="space-y-2 pt-4 border-t-2">
          {/* Stats Labels */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Time</span>
              </div>
              <span className="text-foreground text-xs font-semibold">
                {project.estimatedBuildTimeMinutes ? formatBuildTime(project.estimatedBuildTimeMinutes) : 'N/A'}
              </span>
            </div>
            
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span className="font-medium">Views</span>
              </div>
              <span className="text-foreground text-xs font-semibold">{project.viewCount}</span>
            </div>
            
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <ShoppingCart className="w-4 h-4" />
                <span className="font-medium">Sold</span>
              </div>
              <span className="text-foreground text-xs font-semibold">{project.buildCount}</span>
            </div>
          </div>
        </div>

        {/* Buy Button - Fixed Height */}
        <Button 
          onClick={handleBuyProject}
          className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all" 
          size="lg"
        >
          Buy Project
        </Button>

        {/* Note Section - Fixed Height */}
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Note:</span> You can buy project individual components also to unlock documentation of the project or buy the whole project to access all features including YouTube Videos and 1:1 mentor sessions.
          </p>
        </div>
      </div>
    </Card>
  );
}
