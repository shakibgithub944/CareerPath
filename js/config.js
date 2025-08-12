/**
 * Configuration file for Career Path Explorer
 * Handles environment variables and app settings
 */

// Environment variables helper
function getEnvVar(name, defaultValue = '') {
  // In a static site, we'll use a simple object for configuration
  // For production, you might want to use build-time replacement
  const envVars = {
    VITE_API_BASE_URL: 'https://www.ehlcrm.theskyroute.com/api',
    VITE_CAREERS_ENDPOINT: '/test/top-future-career',
    VITE_CAREER_DETAILS_ENDPOINT: '/future-career-details',
    VITE_BOOKING_URL: 'https://www.ehlweb.theskyroute.com/book-appointment',
    VITE_PRIVACY_POLICY_URL: 'https://www.ehlweb.theskyroute.com/privacy-policy',
    VITE_TERMS_URL: 'https://www.ehlweb.theskyroute.com/terms-service',
    VITE_VIDEO_URL: 'https://www.youtube.com/watch?v=KA0Q1Oki9bw',
    VITE_SITE_NAME: 'Education Hub',
    VITE_SITE_DESCRIPTION: 'Explore future career opportunities with expert guidance'
  };
  
  return envVars[name] || defaultValue;
}

// App Configuration
window.AppConfig = {
  // API Configuration
  API: {
    BASE_URL: getEnvVar('VITE_API_BASE_URL'),
    ENDPOINTS: {
      CAREERS: getEnvVar('VITE_CAREERS_ENDPOINT'),
      CAREER_DETAILS: getEnvVar('VITE_CAREER_DETAILS_ENDPOINT')
    }
  },
  
  // External URLs
  URLS: {
    BOOKING: getEnvVar('VITE_BOOKING_URL'),
    PRIVACY_POLICY: getEnvVar('VITE_PRIVACY_POLICY_URL'),
    TERMS: getEnvVar('VITE_TERMS_URL'),
    VIDEO: getEnvVar('VITE_VIDEO_URL')
  },
  
  // Site Configuration
  SITE: {
    NAME: getEnvVar('VITE_SITE_NAME'),
    DESCRIPTION: getEnvVar('VITE_SITE_DESCRIPTION')
  },
  
  // App Settings
  SETTINGS: {
    CAREERS_PER_PAGE: 12,
    ANIMATION_DURATION: 300,
    SEARCH_DEBOUNCE: 300
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.AppConfig;
}
