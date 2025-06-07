// Dynamic environment configuration that adapts to the current host
function getBackendUrl(): { apiUrl: string; wsUrl: string } {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // Server-side rendering - use default localhost
    return {
      apiUrl: 'http://localhost:3000',
      wsUrl: 'ws://localhost:3000/menu-updates'
    };
  }

  const hostname = window.location.hostname;
  const port = '3000';

  // If accessing via localhost, use localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return {
      apiUrl: `http://localhost:${port}`,
      wsUrl: `ws://localhost:${port}/menu-updates`
    };
  }

  // Otherwise, use the same hostname as the frontend (assuming backend is on same machine)
  return {
    apiUrl: `http://${hostname}:${port}`,
    wsUrl: `ws://${hostname}:${port}/menu-updates`
  };
}

const backendConfig = getBackendUrl();

// Utility function to convert relative image paths to full URLs
function getFullImageUrl(relativePath: string): string {
  if (!relativePath) return '';

  // If it's already a full URL, return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }

  // If it's a relative path, prepend the backend URL
  return `${backendConfig.apiUrl}${relativePath}`;
}

export const environment = {
  production: false,
  apiUrl: backendConfig.apiUrl,
  wsUrl: backendConfig.wsUrl,
  getFullImageUrl: getFullImageUrl
};
