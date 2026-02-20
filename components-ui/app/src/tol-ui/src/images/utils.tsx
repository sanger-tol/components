/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

/**
 * Utility functions for image components
 */

/**
 * Validates if a URL is a valid image URL
 * @param url - The URL to validate
 * @returns boolean indicating if the URL is valid
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    // Check if it's a relative path
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
}

/**
 * Filters an array of URLs to only include valid image URLs
 * @param urls - Array of URLs to filter
 * @returns Array of valid image URLs
 */
export function filterValidImageUrls(urls: string[]): string[] {
  return urls.filter(url => isValidImageUrl(url));
}

/**
 * Gets the file extension from an image URL
 * @param url - The image URL
 * @returns The file extension (e.g., 'jpg', 'png')
 */
export function getImageExtension(url: string): string {
  const match = url.match(/\.([^./?#]+)(?:[?#]|$)/);
  return match ? match[1].toLowerCase() : '';
}

/**
 * Checks if a URL points to a supported image format
 * @param url - The image URL
 * @returns boolean indicating if the format is supported
 */
export function isSupportedImageFormat(url: string): boolean {
  const supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const extension = getImageExtension(url);
  return supportedFormats.includes(extension);
}

/**
 * Preloads images to improve performance
 * @param urls - Array of image URLs to preload
 * @returns Promise that resolves when all images are loaded
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  const promises = urls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  });
  
  return Promise.all(promises);
}

/**
 * Formats image alt text from a URL
 * @param url - The image URL
 * @returns Formatted alt text
 */
export function getImageAltText(url: string): string {
  const filename = url.split('/').pop()?.split('?')[0] || 'Image';
  return filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
}
