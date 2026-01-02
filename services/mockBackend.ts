import { supabase } from './supabaseClient';
import { EwasteItem, EwasteStatus, Classification, HistoryEvent, DeviceType, User, UserRole } from '../types';
import { MARKET_RATES, REFURBISH_MULTIPLIER } from '../constants';

// --- MAPPING HELPERS (Frontend <-> DB) ---

const mapItemFromDb = (dbItem: any, history: any[]): EwasteItem => ({
  id: dbItem.id,
  citizenId: dbItem.citizen_id,
  type: dbItem.type as DeviceType,
  model: dbItem.model,
  ageYears: dbItem.age_years,
  condition: dbItem.condition,
  powerStatus: dbItem.power_status,
  batteryStatus: dbItem.battery_status,
  imageUrl: dbItem.image_url,
  status: dbItem.status as EwasteStatus,
  classification: dbItem.classification as Classification,
  estimatedValue: dbItem.estimated_value,
  collectionDate: dbItem.collection_date,
  winningRecycler: dbItem.winning_recycler,
  finalBidAmount: dbItem.final_bid_amount,
  history: history.map(h => ({
    date: h.date,
    status: h.status as EwasteStatus,
    actor: h.actor,
    note: h.note
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
});

// --- BUSINESS LOGIC HELPERS ---

const generateResourceId = () => `RES-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

const runAiAssessment = (item: Partial<EwasteItem>): Classification => {
  if (item.powerStatus && (item.condition === 'Like New' || item.condition === 'Good') && (item.ageYears || 10) < 4) {
    return Classification.REFURBISH;
  }
  return Classification.RECYCLE;
};

const calculateValue = (type: DeviceType, classification: Classification): number => {
  const base = MARKET_RATES[type] || 5;
  return classification === Classification.REFURBISH ? base * REFURBISH_MULTIPLIER : base;
};

// --- SERVICE IMPLEMENTATION ---

export const BackendService = {

  // AUTH: Get Profile
  getUserProfile: async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      role: data.role as UserRole,
      avatarUrl: data.avatar_url
    };
  },

  // AUTH: Create Profile (called after SignUp)
  createProfile: async (user: User) => {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name: user.name,
        role: user.role,
        avatar_url: user.avatarUrl
      });
    if (error) console.error("Error creating profile:", error);
  },

  // CITIZEN: Add Item
  addItem: async (data: Omit<EwasteItem, 'id' | 'status' | 'classification' | 'estimatedValue' | 'collectionDate' | 'history'>, actorName: string) => {
    const classification = runAiAssessment(data);
    const value = calculateValue(data.type, classification);
    const newId = generateResourceId();
    
    // Scheduling Logic
    const nextFriday = new Date();
    nextFriday.setDate(nextFriday.getDate() + (5 + 7 - nextFriday.getDay()) % 7);
    
    // 1. Insert Item
    const { error: itemError } = await supabase.from('items').insert({
      id: newId,
      citizen_id: data.citizenId,
      type: data.type,
      model: data.model,
      age_years: data.ageYears,
      condition: data.condition,
      power_status: data.powerStatus,
      battery_status: data.batteryStatus,
      image_url: data.imageUrl,
      status: EwasteStatus.SCHEDULED,
      classification: classification,
      estimated_value: value,
      collection_date: nextFriday.toISOString()
    });

    if (itemError) {
      console.error("Item Insert Error", itemError);
      throw itemError;
    }

    // 2. Insert History Events
    await supabase.from('history').insert([
      { item_id: newId, date: new Date().toISOString(), status: EwasteStatus.SUBMITTED, actor: actorName, note: 'Digital Product Passport Created' },
      { item_id: newId, date: new Date().toISOString(), status: EwasteStatus.SCHEDULED, actor: 'System AI', note: `Auto-scheduled. Class: ${classification}` }
    ]);
  },

  // GET: All Items (With History)
  getAllItems: async (): Promise<EwasteItem[]> => {
    const { data: items, error } = await supabase
      .from('items')
      .select(`*, history(*)`);
    
    if (error) {
      console.error(error);
      return [];
    }

    return items.map((i: any) => mapItemFromDb(i, i.history || []));
  },

  // GET: Citizen's Items
  getItemsByCitizen: async (citizenId: string): Promise<EwasteItem[]> => {
    const { data: items, error } = await supabase
      .from('items')
      .select(`*, history(*)`)
      .eq('citizen_id', citizenId);

    if (error) {
      console.error(error);
      return [];
    }

    return items.map((i: any) => mapItemFromDb(i, i.history || []));
  },

  // TRANSITION: Citizen marks as given
  markAsGiven: async (id: string, actorName: string) => {
    await supabase.from('items').update({ status: EwasteStatus.COLLECTED_BY_CITIZEN }).eq('id', id);
    await supabase.from('history').insert({
      item_id: id,
      date: new Date().toISOString(),
      status: EwasteStatus.COLLECTED_BY_CITIZEN,
      actor: actorName,
      note: 'Citizen confirmed handover'
    });
  },

  // TRANSITION: Municipality Verifies
  verifyCollection: async (id: string, actorName: string, overrideClassification?: Classification) => {
    // First fetch to get type for value recalc
    const { data: item } = await supabase.from('items').select('type, classification').eq('id', id).single();
    if (!item) return;

    const newClass = overrideClassification || item.classification;
    let updateData: any = { status: EwasteStatus.VERIFIED, classification: newClass };

    if (newClass !== item.classification) {
      updateData.estimated_value = calculateValue(item.type as DeviceType, newClass as Classification);
    }

    await supabase.from('items').update(updateData).eq('id', id);
    await supabase.from('history').insert({
      item_id: id,
      date: new Date().toISOString(),
      status: EwasteStatus.VERIFIED,
      actor: actorName,
      note: overrideClassification ? `Verified with override: ${overrideClassification}` : 'Physically Verified'
    });
  },

  // TRANSITION: Recycler Bids/Wins
  placeBidAndWin: async (id: string, recyclerName: string, bidAmount: number) => {
    await supabase.from('items').update({
      status: EwasteStatus.ASSIGNED_TO_RECYCLER,
      winning_recycler: recyclerName,
      final_bid_amount: bidAmount
    }).eq('id', id);

    await supabase.from('history').insert({
      item_id: id,
      date: new Date().toISOString(),
      status: EwasteStatus.ASSIGNED_TO_RECYCLER,
      actor: 'Marketplace Engine',
      note: `Winning Bid: ₹${bidAmount} by ${recyclerName}`
    });
  },

  // TRANSITION: Handover
  confirmPickup: async (id: string, actorName: string) => {
    await supabase.from('items').update({ status: EwasteStatus.HANDED_OVER }).eq('id', id);
    await supabase.from('history').insert({
      item_id: id,
      date: new Date().toISOString(),
      status: EwasteStatus.HANDED_OVER,
      actor: actorName,
      note: 'Physical pickup confirmed'
    });
  }
};

// Re-export as MockBackendService for backward compatibility with component imports, 
// though it is now real.
export const MockBackendService = BackendService;