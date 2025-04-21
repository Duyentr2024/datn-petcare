// Determine API base URL based on environment
let API_BASE_URL;

// Check for an environment variable if available (using Vite's approach)
if (import.meta.env.VITE_API_BASE_URL) {
  API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
} else if (window.API_BASE_URL) {
  // Check for a global variable that might be set in index.html
  API_BASE_URL = window.API_BASE_URL;
} else {
  // Default fallback - sử dụng URL tương đối để tránh CORS
  API_BASE_URL = '/api';
  console.warn(`Warning: No API_BASE_URL provided, using default: ${API_BASE_URL}`);
}

export { API_BASE_URL }; 