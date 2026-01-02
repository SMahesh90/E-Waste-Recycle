import React, { useState, useEffect } from 'react';
import { User, EwasteItem, DeviceType, EwasteStatus } from '../types';
import { BackendService } from '../services/mockBackend';
import { Camera, Upload, QrCode, CheckCircle, Truck } from 'lucide-react';
import DPPModal from './DPPModal';

interface CitizenViewProps {
  user: User;
}

const CitizenView: React.FC<CitizenViewProps> = ({ user }) => {
  const [myItems, setMyItems] = useState<EwasteItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingDPP, setViewingDPP] = useState<EwasteItem | null>(null);

  // Form State
  const [deviceType, setDeviceType] = useState<DeviceType>(DeviceType.SMARTPHONE);
  const [model, setModel] = useState('');
  const [age, setAge] = useState<number>(2);
  const [condition, setCondition] = useState<EwasteItem['condition']>('Good');
  const [power, setPower] = useState(true);
  const [battery, setBattery] = useState<EwasteItem['batteryStatus']>('Normal');
  
  const refreshItems = async () => {
    const items = await BackendService.getItemsByCitizen(user.id);
    setMyItems(items);
  };

  useEffect(() => {
    refreshItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await BackendService.addItem({
        citizenId: user.id,
        type: deviceType,
        model: model || 'Generic Device',
        ageYears: age,
        condition: condition,
        powerStatus: power,
        batteryStatus: battery,
        imageUrl: `https://picsum.photos/seed/${Date.now()}/400/300`
      }, user.name);
      
      setModel('');
      await refreshItems();
    } catch (e) {
      console.error("Error submitting", e);
      alert("Failed to submit device");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkGiven = async (id: string) => {
    await BackendService.markAsGiven(id, user.name);
    refreshItems();
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}</h1>
        <p className="opacity-90">Contribute to the circular economy. Schedule your e-waste collection today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Submission Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border border-gray-100 h-fit">
          <div className="flex items-center gap-2 mb-6 text-green-800">
            <Camera className="w-6 h-6" />
            <h2 className="text-xl font-bold">Add New Device</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
              <select 
                className="w-full border rounded-lg p-2 bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value as DeviceType)}
              >
                {Object.values(DeviceType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Name / Description</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. iPhone 12, Old Toaster"
                className="w-full border rounded-lg p-2 bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age (Years)</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full border rounded-lg p-2 bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select 
                  className="w-full border rounded-lg p-2 bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as EwasteItem['condition'])}
                >
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                  <option value="Broken">Broken</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 py-2">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={power} 
                   onChange={(e) => setPower(e.target.checked)}
                   className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                 />
                 <span className="text-sm text-gray-700">Powers On?</span>
               </label>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Tap to upload device photo (Simulated)</p>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow transition disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Submit Device'}
            </button>
          </form>
        </div>

        {/* My List */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-green-600" />
            My Digital Product Passports
          </h2>
          
          <div className="space-y-4">
            {myItems.length === 0 && (
              <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed">
                <p className="text-gray-500">No devices submitted yet.</p>
              </div>
            )}
            
            {myItems.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <img src={item.imageUrl} alt={item.type} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{item.type} - {item.model}</h3>
                      <p className="text-xs text-gray-500 font-mono">{item.id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === EwasteStatus.SCHEDULED ? 'bg-yellow-100 text-yellow-800' :
                      item.status === EwasteStatus.VERIFIED ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  <div className="mt-2 flex gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                       <Truck className="w-3 h-3" /> 
                       Collection: {new Date(item.collectionDate).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-green-700">
                      Est. Value: ₹{item.estimatedValue.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[140px]">
                   <button 
                     onClick={() => setViewingDPP(item)}
                     className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition"
                   >
                     View Passport
                   </button>
                   
                   {(item.status === EwasteStatus.SCHEDULED || item.status === EwasteStatus.PRIORITY_COLLECTION) && (
                     <button 
                       onClick={() => handleMarkGiven(item.id)}
                       className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition"
                     >
                       <CheckCircle className="w-4 h-4" />
                       Mark Given
                     </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <DPPModal item={viewingDPP} onClose={() => setViewingDPP(null)} />
    </div>
  );
};

export default CitizenView;