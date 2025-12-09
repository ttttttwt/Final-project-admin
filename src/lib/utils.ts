import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert relative URL to absolute URL if needed
 */
export const getAbsoluteUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Get API base URL from environment
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088/api/v1';
  // Remove /api/v1 prefix if present since it's already in baseURL
  const cleanPath = url.startsWith('/api/v1') ? url.substring(7) : url;
  return `${API_BASE_URL}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
};
