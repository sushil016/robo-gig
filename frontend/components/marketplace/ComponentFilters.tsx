/**
 * Component Filters Sidebar
 * Filters for component marketplace
 */

'use client';

import { useState } from 'react';
import { ComponentFilters as Filters } from '@/lib/types/marketplace.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';

interface ComponentFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
}

export function ComponentFilters({ filters, onFilterChange }: ComponentFiltersProps) {
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() || '');

  const handlePriceFilter = () => {
    const min = minPrice ? parseFloat(minPrice) * 100 : undefined; // Convert to cents
    const max = maxPrice ? parseFloat(maxPrice) * 100 : undefined;
    onFilterChange({ minPrice: min, maxPrice: max });
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    onFilterChange({
      minPrice: undefined,
      maxPrice: undefined,
      inStock: true,
      search: undefined,
    });
  };

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.search;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Price Range (₹)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full"
            />
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full"
            />
          </div>
          <Button onClick={handlePriceFilter} variant="outline" size="sm" className="w-full">
            Apply
          </Button>
        </div>

        <Separator />

        {/* Stock Availability */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Availability</Label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="inStock"
              checked={filters.inStock}
              onChange={(e) => onFilterChange({ inStock: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="inStock" className="text-sm cursor-pointer">
              In Stock Only
            </label>
          </div>
        </div>

        <Separator />

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Active Filters</Label>
            <div className="space-y-2">
              {filters.search && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="text-xs">Search: {filters.search}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFilterChange({ search: undefined })}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="text-xs">
                    Price: ₹{filters.minPrice ? filters.minPrice / 100 : '0'} - ₹
                    {filters.maxPrice ? filters.maxPrice / 100 : '∞'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('');
                      onFilterChange({ minPrice: undefined, maxPrice: undefined });
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
