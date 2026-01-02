export enum UserRole {
  CITIZEN = 'CITIZEN',
  MUNICIPALITY = 'MUNICIPALITY',
  RECYCLER = 'RECYCLER',
}

export enum EwasteStatus {
  SUBMITTED = 'SUBMITTED',
  SCHEDULED = 'SCHEDULED',
  PRIORITY_COLLECTION = 'PRIORITY_COLLECTION',
  COLLECTED_BY_CITIZEN = 'COLLECTED_BY_CITIZEN', // Citizen marked as given
  COLLECTED_PENDING = 'COLLECTED_PENDING', // Truck collected, not verified
  VERIFIED = 'VERIFIED', // Muni verified
  BIDDING_OPEN = 'BIDDING_OPEN',
  ASSIGNED_TO_RECYCLER = 'ASSIGNED_TO_RECYCLER',
  HANDED_OVER = 'HANDED_OVER',
}

export enum Classification {
  RECYCLE = 'RECYCLE',
  REFURBISH = 'REFURBISH',
  PENDING = 'PENDING',
}

export enum DeviceType {
  SMARTPHONE = 'Smartphone',
  LAPTOP = 'Laptop',
  TABLET = 'Tablet',
  APPLIANCE = 'Appliance',
  ACCESSORY = 'Accessory',
}

export interface HistoryEvent {
  date: string;
  status: EwasteStatus;
  actor: string; // "Citizen", "System", "Muni Admin", "Recycler A"
  note?: string;
}

export interface EwasteItem {
  id: string; // Resource ID (DPP)
  citizenId: string;
  type: DeviceType;
  model: string;
  ageYears: number;
  condition: 'Like New' | 'Good' | 'Fair' | 'Poor' | 'Broken';
  powerStatus: boolean;
  batteryStatus: 'Normal' | 'Swollen' | 'Missing' | 'Unknown';
  imageUrl: string;
  
  // Backend Calculated/Managed
  status: EwasteStatus;
  classification: Classification;
  estimatedValue: number;
  collectionDate: string; // ISO Date
  
  // DPP
  history: HistoryEvent[];
  
  // Market
  winningRecycler?: string;
  finalBidAmount?: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
}