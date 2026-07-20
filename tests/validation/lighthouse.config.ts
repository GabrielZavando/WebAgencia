export const lighthouseThresholds = {
  performance: process.env.LIGHTHOUSE_CI ? 80 : 85,
  accessibility: process.env.LIGHTHOUSE_CI ? 85 : 90,
  bestPractices: process.env.LIGHTHOUSE_CI ? 85 : 90,
  seo: process.env.LIGHTHOUSE_CI ? 85 : 90,
};

export const lighthouseRoutes = [
  { path: '/', label: 'Home' },
  { path: '/blog', label: 'Blog' },
];
