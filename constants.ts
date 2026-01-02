import { DeviceType, UserRole } from './types';

export const MARKET_RATES: Record<DeviceType, number> = {
  [DeviceType.SMARTPHONE]: 15, // Base value in currency
  [DeviceType.LAPTOP]: 40,
  [DeviceType.TABLET]: 25,
  [DeviceType.APPLIANCE]: 10,
  [DeviceType.ACCESSORY]: 2,
};

export const REFURBISH_MULTIPLIER = 2.5;

export const DEMO_USERS = {
  CITIZEN: {
    id: 'u_cit_001',
    name: 'Alex Citizen',
    role: UserRole.CITIZEN,
    avatarUrl: 'https://picsum.photos/seed/alex/100/100',
  },
  MUNICIPALITY: {
    id: 'u_mun_001',
    name: 'City Admin',
    role: UserRole.MUNICIPALITY,
    avatarUrl: 'https://picsum.photos/seed/city/100/100',
  },
  RECYCLER: {
    id: 'u_rec_001',
    name: 'GreenEarth Recyclers',
    role: UserRole.RECYCLER,
    avatarUrl: 'https://picsum.photos/seed/green/100/100',
  },
};