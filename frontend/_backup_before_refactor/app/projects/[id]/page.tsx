'use client';

import { useParams, notFound } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { projectApi } from '@/lib/api/projects.api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Clock,
  Eye,
  Users,
  Star,
  Package,
  Sparkles,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Wrench,
  Download,
  FileText,
  ExternalLink,
  Play,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  getDifficultyLabel,
  getDifficultyColor,
  formatBuildTime,
  formatProjectPrice,
  getCategoryLabel,
  getCategoryIcon,
} from '@/lib/utils/project-utils';
import { ProjectComponents } from '@/components/projects/ProjectComponents';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getProjectById(projectId),
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    notFound();
  }

  // Get all project images (thumbnail + gallery images)
  const allImages = [
    project.thumbnailUrl,
    ...(project.imageUrls || []),
  ].filter(Boolean) as string[];

  const hasImages = allImages.length > 0;

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/projects">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </Link>

      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Project Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted group">
            {hasImages ? (
              <>
                <Image
                  src={allImages[selectedImageIndex]}
                  alt={`${project.title} - Image ${selectedImageIndex + 1}`}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    {/* Image Counter */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-muted-foreground">No image available</span>
              </div>
            )}
            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex gap-2">
              {project.isFeatured && (
                <Badge className="bg-primary text-primary-foreground">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              <Badge className={getDifficultyColor(project.difficulty)}>
                {getDifficultyLabel(project.difficulty)}
              </Badge>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Project Info */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>{getCategoryIcon(project.category)}</span>
              <span>{getCategoryLabel(project.category)}</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
            <p className="text-lg text-muted-foreground">{project.summary}</p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 py-4">
            {project.estimatedBuildTimeMinutes && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {formatBuildTime(project.estimatedBuildTimeMinutes)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{project.viewCount} views</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{project.buildCount} builds</span>
            </div>
            {project.averageRating && (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{project.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Pricing */}
          <div className="space-y-3">
            {project.estimatedCostCents && (
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">DIY Kit Cost:</span>
                <span className="text-2xl font-bold">
                  {formatProjectPrice(project.estimatedCostCents)}
                </span>
              </div>
            )}
            {project.preBuiltStock > 0 && project.preBuiltPriceCents && (
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Pre-Built:</span>
                <span className="text-xl font-semibold">
                  {formatProjectPrice(project.preBuiltPriceCents)}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-3">
            {project.components && project.components.length > 0 && (
              <Button className="w-full" size="lg" asChild>
                <a href="#components">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  View Components ({project.componentsCount})
                </a>
              </Button>
            )}
            {project.preBuiltStock > 0 && (
              <Button variant="outline" className="w-full" size="lg">
                <Package className="w-4 h-4 mr-2" />
                Buy Pre-Built ({project.preBuiltStock} in stock)
              </Button>
            )}
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {project.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description Section */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">About This Project</h2>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap">{project.description}</p>
        </div>
      </Card>

      {/* YouTube Video Section */}
      {project.youtubeUrl && (
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Play className="w-5 h-5 text-red-500" />
            <h2 className="text-2xl font-bold">Project Tutorial</h2>
          </div>
          <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
            <iframe
              src={project.youtubeUrl.replace('watch?v=', 'embed/')}
              title={`${project.title} Tutorial`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </Card>
      )}

      {/* PDF Documentation Section */}
      {project.pdfUrls && project.pdfUrls.length > 0 && (
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Documentation & Resources</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.pdfUrls.map((pdfUrl, index) => {
              const fileName = pdfUrl.split('/').pop()?.split('?')[0] || `Document ${index + 1}`;
              const displayName = fileName
                .replace(/^\d+-[a-f0-9-]+/, '') // Remove timestamp-uuid prefix
                .replace(/\.pdf$/i, '') // Remove .pdf extension
                .replace(/[-_]/g, ' ') // Replace dashes/underscores with spaces
                .trim() || `Documentation ${index + 1}`;
              
              return (
                <a
                  key={index}
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border-2 rounded-lg hover:border-primary hover:bg-muted/50 transition-all group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">PDF Document</p>
                  </div>
                  <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </a>
              );
            })}
          </div>
        </Card>
      )}

      {/* External Links Section */}
      {project.externalLinks && project.externalLinks.length > 0 && (
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ExternalLink className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Additional Resources</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.externalLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border-2 rounded-lg hover:border-primary hover:bg-muted/50 transition-all group"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">
                    {link.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                </div>
                <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Learning Outcomes */}
      {project.learningOutcomes && project.learningOutcomes.length > 0 && (
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">What You&apos;ll Learn</h2>
          </div>
          <ul className="space-y-2">
            {project.learningOutcomes.map((outcome, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Prerequisites */}
      {project.prerequisites && project.prerequisites.length > 0 && (
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h2 className="text-2xl font-bold">Prerequisites</h2>
          </div>
          <ul className="space-y-2">
            {project.prerequisites.map((prereq, index) => (
              <li key={index} className="flex items-start gap-2">
                <Wrench className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span>{prereq}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Build Guide - Coming Soon */}
      {/* Note: stepByStepGuide field will be added to schema in future */}

      {/* Required Components Section */}
      {project.components && project.components.length > 0 && (
        <div id="components">
          <ProjectComponents
            components={project.components}
            totalCost={project.totalComponentsCost}
            projectTitle={project.title}
          />
        </div>
      )}
    </div>
  );
}
