import { companyConfig } from '../config/company.config';

export interface SystemConfig {
  name: string;
  description: string;
  websiteUrl: string;
  logoUrl: string;
  faviconUrl: string;
  address: string;
  phone: string;
  email: string;
  servicesUrl: string;
  social: {
    linkedinUrl: string;
    instagramUrl: string;
    githubUrl: string;
    youtubeUrl: string;
    linkedinIconUrl: string;
    instagramIconUrl: string;
    githubIconUrl: string;
    youtubeIconUrl: string;
  };
}

export async function getSystemConfig(): Promise<SystemConfig> {
  // Usar configuración estática directamente (sin dependencia de API)
  return {
    name: companyConfig.name,
    description: companyConfig.description,
    websiteUrl: companyConfig.websiteUrl,
    logoUrl: companyConfig.logoUrl,
    faviconUrl: companyConfig.faviconUrl,
    address: companyConfig.address,
    phone: companyConfig.phone,
    email: companyConfig.email,
    servicesUrl: companyConfig.servicesUrl,
    social: { ...companyConfig.social }
  } as SystemConfig;
}
