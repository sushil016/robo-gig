/**
 * Project Filters Component
 * Sidebar filters for project search
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ProjectCategory, DifficultyLevel, type ProjectFilters } from '@/lib/types/projects.types';
import { getCategoryLabel, getDifficultyLabel } from '@/lib/utils/project-utils';

interface ProjectFiltersComponentProps {
  filters: ProjectFilters;
  onFilterChange: (filters: Partial<ProjectFilters>) => void;
}

const categories: ProjectCategory[] = [
  ProjectCategory.ROBOTICS,
  ProjectCategory.IOT,
  ProjectCategory.DRONE,
  ProjectCategory.AUTOMATION,
  ProjectCategory.SMART_HOME,
  ProjectCategory.AI_ML,
  ProjectCategory.COMPUTER_VISION,
  ProjectCategory.EDUCATION,
  ProjectCategory.HEALTH,
  ProjectCategory.ENVIRONMENT,
];

const difficulties: DifficultyLevel[] = [
  DifficultyLevel.BEGINNER,
  DifficultyLevel.INTERMEDIATE,
  DifficultyLevel.ADVANCED,
];

export function ProjectFiltersComponent({ filters, onFilterChange }: ProjectFiltersComponentProps) {
  const [minCost, setMinCost] = useState(filters.minCost?.toString() || '');
  const [maxCost, setMaxCost] = useState(filters.maxCost?.toString() || '');
  const [minTime, setMinTime] = useState(filters.minBuildTime?.toString() || '');
  const [maxTime, setMaxTime] = useState(filters.maxBuildTime?.toString() || '');

  const handleCategoryToggle = (category: ProjectCategory) => {
    const current = filters.category;
    let newCategories: ProjectCategory[] = [];

    if (Array.isArray(current)) {
      if (current.includes(category)) {
        newCategories = current.filter((c) => c !== category);
      } else {
        newCategories = [...current, category];
      }
    } else if (current === category) {
      newCategories = [];
    } else {
      newCategories = current ? [current, category] : [category];
    }

    onFilterChange({ category: newCategories.length > 0 ? newCategories : undefined });
  };

  const handleDifficultyToggle = (difficulty: DifficultyLevel) => {
    const current = filters.difficulty;
    let newDifficulties: DifficultyLevel[] = [];

    if (Array.isArray(current)) {
      if (current.includes(difficulty)) {
        newDifficulties = current.filter((d) => d !== difficulty);
      } else {
        newDifficulties = [...current, difficulty];
      }
    } else if (current === difficulty) {
      newDifficulties = [];
    } else {
      newDifficulties = current ? [current, difficulty] : [difficulty];
    }

    onFilterChange({ difficulty: newDifficulties.length > 0 ? newDifficulties : undefined });
  };

  const handleCostFilter = () => {
    onFilterChange({
      minCost: minCost ? parseInt(minCost) * 100 : undefined, // Convert rupees to cents
      maxCost: maxCost ? parseInt(maxCost) * 100 : undefined,
    });
  };

  const handleTimeFilter = () => {
    onFilterChange({
      minBuildTime: minTime ? parseInt(minTime) : undefined,
      maxBuildTime: maxTime ? parseInt(maxTime) : undefined,
    });
  };

  const clearFilters = () => {
    setMinCost('');
    setMaxCost('');
    setMinTime('');
    setMaxTime('');
    onFilterChange({
      category: undefined,
      difficulty: undefined,
      minCost: undefined,
      maxCost: undefined,
      minBuildTime: undefined,
      maxBuildTime: undefined,
      isFeatured: undefined,
      preBuiltAvailable: undefined,
    });
  };

  const hasActiveFilters =
    filters.category ||
    filters.difficulty ||
    filters.minCost ||
    filters.maxCost ||
    filters.minBuildTime ||
    filters.maxBuildTime ||
    filters.isFeatured ||
    filters.preBuiltAvailable;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div>
          <Label className="mb-3 block">Category</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isSelected = Array.isArray(filters.category)
                ? filters.category.includes(category)
                : filters.category === category;
              
              return (
                <Badge
                  key={category}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleCategoryToggle(category)}
                >
                  {getCategoryLabel(category)}
                </Badge>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Difficulty Filter */}
        <div>
          <Label className="mb-3 block">Difficulty</Label>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((difficulty) => {
              const isSelected = Array.isArray(filters.difficulty)
                ? filters.difficulty.includes(difficulty)
                : filters.difficulty === difficulty;
              
              return (
                <Badge
                  key={difficulty}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleDifficultyToggle(difficulty)}
                >
                  {getDifficultyLabel(difficulty)}
                </Badge>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Cost Range Filter */}
        <div>
          <Label className="mb-2 block">Cost Range (₹)</Label>
          <div className="flex gap-2 items-center mb-2">
            <Input
              type="number"
              placeholder="Min"
              value={minCost}
              onChange={(e) => setMinCost(e.target.value)}
              min="0"
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxCost}
              onChange={(e) => setMaxCost(e.target.value)}
              min="0"
            />
          </div>
          <Button onClick={handleCostFilter} size="sm" className="w-full">
            Apply
          </Button>
        </div>

        <Separator />

        {/* Build Time Filter */}
        <div>
          <Label className="mb-2 block">Build Time (minutes)</Label>
          <div className="flex gap-2 items-center mb-2">
            <Input
              type="number"
              placeholder="Min"
              value={minTime}
              onChange={(e) => setMinTime(e.target.value)}
              min="0"
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxTime}
              onChange={(e) => setMaxTime(e.target.value)}
              min="0"
            />
          </div>
          <Button onClick={handleTimeFilter} size="sm" className="w-full">
            Apply
          </Button>
        </div>

        <Separator />

        {/* Quick Filters */}
        <div>
          <Label className="mb-3 block">Quick Filters</Label>
          <div className="space-y-2">
            <Badge
              variant={filters.isFeatured ? 'default' : 'outline'}
              className="cursor-pointer w-full justify-center"
              onClick={() => onFilterChange({ isFeatured: filters.isFeatured ? undefined : true })}
            >
              Featured Only
            </Badge>
            <Badge
              variant={filters.preBuiltAvailable ? 'default' : 'outline'}
              className="cursor-pointer w-full justify-center"
              onClick={() => onFilterChange({ preBuiltAvailable: filters.preBuiltAvailable ? undefined : true })}
            >
              Pre-Built Available
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
