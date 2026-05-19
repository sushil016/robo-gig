/**
 * Project Utilities
 * Helper functions for project-related operations
 */

import { ProjectCategory, DifficultyLevel } from '@/lib/types/projects.types';

/**
 * Get display label for project category
 */
export function getCategoryLabel(category: ProjectCategory): string {
  const labels: Record<ProjectCategory, string> = {
    [ProjectCategory.IOT]: 'IoT',
    [ProjectCategory.ROBOTICS]: 'Robotics',
    [ProjectCategory.DRONE]: 'Drones',
    [ProjectCategory.AUTOMATION]: 'Automation',
    [ProjectCategory.ENVIRONMENT]: 'Environment',
    [ProjectCategory.HEALTH]: 'Healthcare',
    [ProjectCategory.AGRICULTURE]: 'Agriculture',
    [ProjectCategory.SECURITY]: 'Security',
    [ProjectCategory.EDUCATION]: 'Education',
    [ProjectCategory.AUTOMOTIVE]: 'Automotive',
    [ProjectCategory.SMART_HOME]: 'Smart Home',
    [ProjectCategory.ENERGY]: 'Energy',
    [ProjectCategory.WEARABLES]: 'Wearables',
    [ProjectCategory.GAMING]: 'Gaming',
    [ProjectCategory.MUSIC]: 'Music',
    [ProjectCategory.COMMUNICATION]: 'Communication',
    [ProjectCategory.AI_ML]: 'AI & ML',
    [ProjectCategory.COMPUTER_VISION]: 'Computer Vision',
    [ProjectCategory.OTHER]: 'Other',
  };
  return labels[category] || category;
}

/**
 * Get display label for difficulty level
 */
export function getDifficultyLabel(difficulty: DifficultyLevel): string {
  const labels: Record<DifficultyLevel, string> = {
    [DifficultyLevel.BEGINNER]: 'Beginner',
    [DifficultyLevel.INTERMEDIATE]: 'Intermediate',
    [DifficultyLevel.ADVANCED]: 'Advanced',
  };
  return labels[difficulty] || difficulty;
}

/**
 * Get color class for difficulty badge
 */
export function getDifficultyColor(difficulty: DifficultyLevel): string {
  const colors: Record<DifficultyLevel, string> = {
    [DifficultyLevel.BEGINNER]: 'bg-green-100 text-green-800 border-green-200',
    [DifficultyLevel.INTERMEDIATE]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [DifficultyLevel.ADVANCED]: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[difficulty] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Format build time from minutes to readable string
 */
export function formatBuildTime(minutes?: number): string {
  if (!minutes) return 'N/A';
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format price from cents to rupees
 */
export function formatProjectPrice(cents?: number): string {
  if (!cents) return 'Free';
  const rupees = cents / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees);
}

/**
 * Get category icon (you can customize this with actual icons)
 */
export function getCategoryIcon(category: ProjectCategory): string {
  const icons: Record<ProjectCategory, string> = {
    [ProjectCategory.IOT]: '🌐',
    [ProjectCategory.ROBOTICS]: '🤖',
    [ProjectCategory.DRONE]: '🚁',
    [ProjectCategory.AUTOMATION]: '⚙️',
    [ProjectCategory.ENVIRONMENT]: '🌱',
    [ProjectCategory.HEALTH]: '🏥',
    [ProjectCategory.AGRICULTURE]: '🌾',
    [ProjectCategory.SECURITY]: '🔒',
    [ProjectCategory.EDUCATION]: '📚',
    [ProjectCategory.AUTOMOTIVE]: '🚗',
    [ProjectCategory.SMART_HOME]: '🏠',
    [ProjectCategory.ENERGY]: '⚡',
    [ProjectCategory.WEARABLES]: '⌚',
    [ProjectCategory.GAMING]: '🎮',
    [ProjectCategory.MUSIC]: '🎵',
    [ProjectCategory.COMMUNICATION]: '📡',
    [ProjectCategory.AI_ML]: '🧠',
    [ProjectCategory.COMPUTER_VISION]: '👁️',
    [ProjectCategory.OTHER]: '📦',
  };
  return icons[category] || '📦';
}
