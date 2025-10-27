/**
 * M&M's Globe Configuration Constants
 *
 * Centralized configuration for M&M's brand colors, activity types,
 * and globe settings that can be customized by consuming applications.
 */

// M&M's Brand Colors
export const MMS_BRAND_COLORS = {
  // Primary
  yellow: '#FFD200',
  background: '#FFD200',

  // Activity Type Colors
  brown: '#5A1F06',    // Account & System
  green: '#00A836',    // Commerce & Receipts
  blue: '#0E74E1',     // Content & Education
  orange: '#FA6400',   // Social & Games
  red: '#D70100',      // Negative/Spending

  // Usage Guide:
  // Brown (#5A1F06)   → account and system actions
  // Yellow (#FFD200)  → rewards, tiers, achievements
  // Green (#00A836)   → receipts and commerce proof
  // Blue (#0E74E1)    → content, education, info, messaging
  // Orange (#FA6400)  → social, UGC, games, general activity
  // Red (#D70100)     → negative points changes
};

// Activity Type Mapping
export const ACTIVITY_TYPES = {
  // Account & System (Brown)
  JOIN: { id: 0, icon: '✨', color: MMS_BRAND_COLORS.brown, name: 'Join' },
  SIGN_IN: { id: 1, icon: '🔑', color: MMS_BRAND_COLORS.brown, name: 'Sign In' },
  PROFILE: { id: 2, icon: '👤', color: MMS_BRAND_COLORS.brown, name: 'Profile' },

  // Content & Education (Blue)
  VIDEO: { id: 3, icon: '📺', color: MMS_BRAND_COLORS.blue, name: 'Video' },
  LINK: { id: 4, icon: '🔗', color: MMS_BRAND_COLORS.blue, name: 'Link' },
  ARTICLE: { id: 5, icon: '📖', color: MMS_BRAND_COLORS.blue, name: 'Article' },
  QUIZ: { id: 6, icon: '🧠', color: MMS_BRAND_COLORS.blue, name: 'Quiz' },
  SURVEY: { id: 7, icon: '📝', color: MMS_BRAND_COLORS.blue, name: 'Survey' },
  POST: { id: 12, icon: '👁️', color: MMS_BRAND_COLORS.blue, name: 'Post' },

  // Rewards (Yellow)
  REWARD: { id: 13, icon: '🏆', color: MMS_BRAND_COLORS.yellow, name: 'Reward' },
  LEVEL_UP: { id: 24, icon: '⭐', color: MMS_BRAND_COLORS.yellow, name: 'Level Up' },

  // Social & Games (Orange)
  CHALLENGE: { id: 20, icon: '🎯', color: MMS_BRAND_COLORS.orange, name: 'Challenge' },
  GAME: { id: 25, icon: '🎮', color: MMS_BRAND_COLORS.orange, name: 'Game' },
  QUIZ_COMPLETE: { id: 29, icon: '✅', color: MMS_BRAND_COLORS.orange, name: 'Quiz Complete' },
  RECRUIT: { id: 9, icon: '👥', color: MMS_BRAND_COLORS.orange, name: 'Recruit' },

  // Commerce (Green)
  RECEIPT: { id: 23, icon: '🛒', color: MMS_BRAND_COLORS.green, name: 'Receipt' },
};

// Default Globe Configuration
export const DEFAULT_GLOBE_CONFIG = {
  // Data Loading
  initialLimit: 20,
  batchSize: 30,
  maxTotal: 100,
  batchDelay: 15000, // 15 seconds
  minLoadingTime: 5000, // 5 seconds

  // Animation
  playbackSpeed: 3000, // 3 seconds per activity
  autoRotateSpeed: 0.2,

  // Appearance
  backgroundColor: MMS_BRAND_COLORS.yellow,
  atmosphereColor: 'rgba(200,200,200,0.3)',
  atmosphereAltitude: 0.15,

  // API
  apiEndpoint: '/api/mms-activity',
  programId: '10000154', // M&M's Fun Club

  // Pin/Ring Settings
  pointRadius: 0.5,
  pointAltitude: 0.02,
  ringMaxRadius: 12,
  ringSpeed: 2,
};

// Export default for easy access
export default {
  colors: MMS_BRAND_COLORS,
  activityTypes: ACTIVITY_TYPES,
  defaultConfig: DEFAULT_GLOBE_CONFIG,
};
