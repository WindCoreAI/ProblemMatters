import {
  Monitor,
  Building2,
  Heart,
  GraduationCap,
  Factory,
  ShoppingCart,
  Landmark,
  Truck,
  Leaf,
  Zap,
  Briefcase,
  Globe,
  type LucideIcon,
} from 'lucide-react';

const industryIcons: Record<string, LucideIcon> = {
  'technology-software': Monitor,
  technology: Monitor,
  software: Monitor,
  healthcare: Heart,
  health: Heart,
  education: GraduationCap,
  manufacturing: Factory,
  retail: ShoppingCart,
  'e-commerce': ShoppingCart,
  finance: Landmark,
  banking: Landmark,
  'financial-services': Landmark,
  transportation: Truck,
  logistics: Truck,
  energy: Zap,
  utilities: Zap,
  'real-estate': Building2,
  construction: Building2,
  agriculture: Leaf,
  environment: Leaf,
  government: Globe,
  'public-sector': Globe,
  professional: Briefcase,
  consulting: Briefcase,
};

export function getIndustryIcon(slug: string): LucideIcon {
  // Try exact match first
  if (industryIcons[slug]) {
    return industryIcons[slug];
  }

  // Try partial match
  const slugLower = slug.toLowerCase();
  for (const [key, icon] of Object.entries(industryIcons)) {
    if (slugLower.includes(key) || key.includes(slugLower)) {
      return icon;
    }
  }

  // Default icon
  return Briefcase;
}

export function getIconByName(name: string): LucideIcon | null {
  const iconMap: Record<string, LucideIcon> = {
    monitor: Monitor,
    building: Building2,
    heart: Heart,
    graduation: GraduationCap,
    factory: Factory,
    cart: ShoppingCart,
    landmark: Landmark,
    truck: Truck,
    leaf: Leaf,
    zap: Zap,
    briefcase: Briefcase,
    globe: Globe,
  };

  return iconMap[name.toLowerCase()] || null;
}
