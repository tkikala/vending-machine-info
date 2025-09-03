// Social Media Configuration
// These URLs can be updated via Vercel environment variables
// Go to Vercel Dashboard > Your Project > Settings > Environment Variables

export const SOCIAL_CONFIG = {
  TWITTER_URL: import.meta.env.VITE_TWITTER_URL || 'https://x.com/vendingcommunity',
  TELEGRAM_URL: import.meta.env.VITE_TELEGRAM_URL || 'https://t.me/vendingcommunity',
  // Add more social platforms here as needed
  // INSTAGRAM_URL: import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com/vendingcommunity',
  // LINKEDIN_URL: import.meta.env.VITE_LINKEDIN_URL || 'https://linkedin.com/company/vendingcommunity',
};
