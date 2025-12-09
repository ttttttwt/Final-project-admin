import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the API base URL (without /api/v1 suffix)
 */
export const getApiBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088/api/v1';
  // Remove /api/v1 suffix to get the base URL
  return apiUrl.replace(/\/api\/v1$/, '');
};

/**
 * Convert relative URL to absolute URL if needed.
 * Handles:
 * - Absolute URLs (http://, https://) - returned as-is
 * - API file paths (/api/v1/files/...) - prepends API base URL
 * - Other relative paths - prepends API base URL
 * 
 * @param url - The URL to convert (can be relative or absolute)
 * @returns The absolute URL or null if input is null/undefined
 */
export const getAbsoluteUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // Already absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Get base URL (without /api/v1)
  const baseUrl = getApiBaseUrl();
  
  // Handle relative paths
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`;
  }
  
  return `${baseUrl}/${url}`;
};

/**
 * Get the full image URL for display.
 * This is a convenience wrapper around getAbsoluteUrl specifically for images.
 * 
 * @param imageUrl - The image URL from API response
 * @returns The full URL for the image or undefined if no URL
 */
export const getImageUrl = (imageUrl: string | null | undefined): string | undefined => {
  const url = getAbsoluteUrl(imageUrl);
  return url ?? undefined;
};
