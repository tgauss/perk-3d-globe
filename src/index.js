/**
 * M&M's Fun Club Globe - Exportable Components
 *
 * Main exports for integrating the globe into other applications.
 *
 * @example
 * // Basic usage
 * import { MMSGlobe } from '@mms/globe';
 * <MMSGlobe />
 *
 * @example
 * // With configuration
 * import { MMSGlobe } from '@mms/globe';
 * <MMSGlobe
 *   programId="10000154"
 *   initialLimit={30}
 *   maxTotal={150}
 *   apiEndpoint="/api/mms-activity"
 * />
 *
 * @example
 * // Use hook separately
 * import { useMMSGlobeData } from '@mms/globe/hooks';
 * const { points, isLoading } = useMMSGlobeData({ programId: '10000154' });
 */

// Main Components
export { default as MMSGlobe } from './routes/mms-globe';
export { default as MMSLoadingScreen } from './components/MMSLoadingScreen';

// Hooks
export { useMMSGlobeData } from './hooks/useMMSGlobeData';

// Constants and Config (for customization)
export { MMS_BRAND_COLORS, ACTIVITY_TYPES } from './constants/globe-config';

// Version
export const VERSION = '1.0.0';
