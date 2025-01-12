export function getSiteURL() {
  // Check if we have an environment variable for the URL
  const envURL = process.env.NEXT_PUBLIC_SITE_URL;
  if (envURL) {
    return envURL;
  }

  // Fallback for development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // Fallback for production - using window.location if available
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Final fallback
  return 'http://localhost:3000';
} 