export function getSiteURL() {
  // In development, always use localhost
  if (process.env.NODE_ENV === 'development') {
    console.log('getSiteURL: Using development URL - http://localhost:3000');
    return 'http://localhost:3000';
  }

  // In production, use the NEXT_PUBLIC_SITE_URL or window.location.origin
  if (typeof window !== 'undefined') {
    const url = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    console.log('getSiteURL: Using production URL -', url);
    return url;
  }

  // Server-side in production
  console.log('getSiteURL: Using server-side production URL -', process.env.NEXT_PUBLIC_SITE_URL || '');
  return process.env.NEXT_PUBLIC_SITE_URL || '';
} 