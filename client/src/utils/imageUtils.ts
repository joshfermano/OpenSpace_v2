import placeholder from '../assets/logo_black.jpg';

/**
 * Returns a properly formatted image URL based on whether it's from Supabase storage or local
 * @param imagePath The image path or URL
 * @param defaultImage Optional fallback image
 * @returns Formatted image URL
 */
export const getImageUrl = (
  imagePath?: string,
  defaultImage = placeholder
): string => {
  console.log('getImageUrl input:', imagePath);

  if (!imagePath) {
    console.log('No image path provided, returning default');
    return defaultImage;
  }

  // If it's already a full URL (Supabase or other external URL)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('Image is already a full URL');
    return imagePath;
  }

  // If it's a data URL (base64)
  if (imagePath.startsWith('data:')) {
    console.log('Image is a data URL');
    return imagePath;
  }

  // API URL for local files
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  console.log('Using API_URL:', API_URL);

  // If path starts with a slash, ensure we don't double-slash
  const normalizedPath = imagePath.startsWith('/')
    ? imagePath
    : `/${imagePath}`;

  const finalUrl = `${API_URL}${normalizedPath}`;
  console.log('Formatted image URL:', finalUrl);
  return finalUrl;
};

/**
 * Handles image load errors by setting a fallback image
 * @param event The error event
 * @param fallbackImage Optional custom fallback image
 */
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackImage = placeholder
): void => {
  const img = event.currentTarget;
  console.error('Image error occurred for:', img.src);
  img.onerror = null; // Prevent infinite error loop
  img.src = fallbackImage;
};
