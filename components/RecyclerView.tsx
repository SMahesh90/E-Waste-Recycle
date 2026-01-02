import React, { useState, useEffect } from 'react';
import { EwasteItem, EwasteStatus, User } from '../types';
import { BackendService } from '../services/mockBackend';
import { Gavel, Check, Factory, Box } from 'lucide-react';
import DPPModal from './DPPModal';

interface RecyclerViewProps {
  user: User;
}

const RecyclerView: React.FC<RecyclerViewProps> = ({ user }) => {
  const [availableItems, setAvailableItems] = useState<EwasteItem[]>([]);
  const [wonItems, setWonItems] = useState<EwasteItem[]>([]);
  const [viewingDPP, setViewingDPP] = useState<EwasteItem | null>(null);
  
  // Quick Mock Bid State
  const [bidAmount, setBidAmount] = useState<Record<string, string>>({});

  const refresh = async () => {
    const all = await BackendService.getAllItems();
    setAvailableItems(all.filter(i => i.status === EwasteStatus.VERIFIED));
    setWonItems(all.filter(i => 
      (i.status === EwasteStatus.ASSIGNED_TO_RECYCLER || i.status === EwasteStatus.HANDED_OVER) && 
      i.winningRecycler === user.name
    ));
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.name]);

  const placeBid = async (item: EwasteItem) => {
    const amount = parseFloat(bidAmount[item.id]);
    if (!amount || amount < item.estimatedValue) {
      alert("Bid must be higher than estimated base value.");
      return;
    }
    
    if (confirm(`Place binding bid of ₹${amount} for ${item.type}?`)) {
      await BackendService.placeBidAndWin(item.id, user.name, amount);
      refresh();
      setBidAmount(prev => ({...prev, [item.id]: ''}));
    }
  };

  const confirmPickup = async (id: string) => {
    await BackendService.confirmPickup(id, user.name);
    refresh();
  };

  return (
    <div className="space-y-8">
      
      {/* Marketplace Header */}
      <div className="bg-slate-800 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Recycler Marketplace</h1>
          <p className="text-slate-300">Bid on verified e-waste batches. High-quality feedstock for your recovery facility.</p>
        </div>
        <Factory className="absolute right-8 top-8 w-32 h-32 text-slate-700 opacity-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Available for Bidding */}
        <div>
           <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
             <Gavel className="w-5 h-5 text-blue-600" />
             Open Auctions
           </h2>
           
           <div className="space-y-4">
             {availableItems.length === 0 && (
               <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl text-center text-gray-500">
                 No verified items available for bidding right now. <br/>
                 <span className="text-xs">Wait for Municipality to verify collections.</span>
               </div>
             )}

             {availableItems.map(item => (
               <div key={item.id} className="bg-white p-5 rounded-xl shadow-md border border-gray-100 transition hover:shadow-lg">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <img src={item.imageUrl} alt={item.type} className="w-16 h-16 object-cover rounded bg-gray-100" />
                      <div>
                        <h3 className="font-bold text-gray-900">{item.type}</h3>
                        <div className="flex gap-2 text-xs mt-1">
                          <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">{item.condition}</span>
                          <span className={`px-2 py-1 rounded font-bold ${item.classification === 'REFURBISH' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                            {item.classification}
                          </span>
                        </div>
                        <button onClick={() => setViewingDPP(item)} className="text-xs text-blue-600 hover:underline mt-1 block">
                          View DPP: {item.id}
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Base Value</p>
                      <p className="text-lg font-bold text-green-700">₹{item.estimatedValue}</p>
                    </div>
                 </div>

                 <div className="flex gap-2">
                   <input 
                     type="number" 
                     placeholder={`Min ₹${item.estimatedValue}`}
                     className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     value={bidAmount[item.id] || ''}
                     onChange={(e) => setBidAmount({...bidAmount, [item.id]: e.target.value})}
                   />
                   <button 
                     onClick={() => placeBid(item)}
                     className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition"
                   >
                     Bid Now
                   </button>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* My Won Batches */}
        <div>
           <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
             <Box className="w-5 h-5 text-green-600" />
             My Won Batches
           </h2>

           <div className="space-y-4">
             {wonItems.length === 0 && (
               <div className="p-8 bg-gray-50 rounded-xl text-center text-gray-400">
                 You haven't won any auctions yet.
               </div>
             )}

             {wonItems.map(item => (
               <div key={item.id} className="bg-white p-5 rounded-xl shadow border-l-4 border-green-500">
                 <div className="flex justify-between items-start">
                   <div>
                     <h3 className="font-bold text-gray-900">{item.type} - {item.model}</h3>
                     <p className="text-xs text-gray-500">Won for: <span className="font-bold text-green-700">₹{item.finalBidAmount}</span></p>
                     <p className="text-xs text-gray-400 mt-1">ID: {item.id}</p>
                   </div>
                   {item.status === EwasteStatus.ASSIGNED_TO_RECYCLER ? (
                     <button 
                       onClick={() => confirmPickup(item.id)}
                       className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                     >
                       <Check className="w-3 h-3" />
                       Confirm Pickup
                     </button>
                   ) : (
                     <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                       <Check className="w-3 h-3" />
                       Handover Complete
                     </span>
                   )}
                 </div>
                 {item.status === EwasteStatus.ASSIGNED_TO_RECYCLER && (
                   <div className="mt-3 bg-yellow-50 p-2 rounded text-xs text-yellow-800 border border-yellow-100">
                     <strong>Action:</strong> Please proceed to Municipal Depot A for pickup within 48 hours.
                   </div>
                 )}
               </div>
             ))}
           </div>
        </div>

      </div>

      <DPPModal item={viewingDPP} onClose={() => setViewingDPP(null)} />
    </div>
  );
};

export default RecyclerView;