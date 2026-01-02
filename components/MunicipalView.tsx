import React, { useState, useEffect } from 'react';
import { EwasteItem, EwasteStatus, Classification } from '../types';
import { BackendService } from '../services/mockBackend';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ClipboardCheck, Truck, Scale, AlertCircle } from 'lucide-react';
import DPPModal from './DPPModal';

const MunicipalView: React.FC = () => {
  const [items, setItems] = useState<EwasteItem[]>([]);
  const [viewingDPP, setViewingDPP] = useState<EwasteItem | null>(null);

  const fetchItems = async () => {
    const data = await BackendService.getAllItems();
    setItems(data);
  };

  useEffect(() => {
    // Poll for updates to simulate real-time dashboard
    fetchItems();
    const interval = setInterval(fetchItems, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async (id: string) => {
    await BackendService.verifyCollection(id, 'Municipal Admin');
    fetchItems(); // Immediate update
  };

  // Stats Logic
  const totalValue = items.reduce((sum, i) => sum + i.estimatedValue, 0);
  const totalWeight = items.length * 1.5; // Mock weight avg
  
  const statusCounts = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: 'Submitted', value: statusCounts[EwasteStatus.SUBMITTED] || 0 },
    { name: 'Scheduled', value: statusCounts[EwasteStatus.SCHEDULED] || 0 },
    { name: 'Verified', value: statusCounts[EwasteStatus.VERIFIED] || 0 },
    { name: 'Assigned', value: statusCounts[EwasteStatus.ASSIGNED_TO_RECYCLER] || 0 },
  ].filter(d => d.value > 0);

  const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#6366F1'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Municipal Operations Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Scale className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Total Recovery Value</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{totalValue.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Estimated from market rates</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
           <div className="flex items-center gap-2 text-orange-600 mb-2">
            <Truck className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Pending Collection</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {(statusCounts[EwasteStatus.SCHEDULED] || 0) + (statusCounts[EwasteStatus.PRIORITY_COLLECTION] || 0)}
          </p>
          <p className="text-xs text-gray-500">Devices scheduled</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
           <div className="flex items-center gap-2 text-green-600 mb-2">
            <ClipboardCheck className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Verified Stock</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {statusCounts[EwasteStatus.VERIFIED] || 0}
          </p>
          <p className="text-xs text-gray-500">Ready for recyclers</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
           <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Scale className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Est. Weight Diverted</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalWeight} kg</p>
          <p className="text-xs text-gray-500">From landfill</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Queue (Actionable) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
             <h2 className="font-bold text-gray-800">Verification Queue</h2>
             <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
               Action Required
             </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="p-4">ID / Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">AI Assessment</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items
                  .filter(i => 
                    i.status === EwasteStatus.COLLECTED_BY_CITIZEN || 
                    i.status === EwasteStatus.SCHEDULED || 
                    i.status === EwasteStatus.PRIORITY_COLLECTION
                  )
                  .sort((a,b) => new Date(a.collectionDate).getTime() - new Date(b.collectionDate).getTime())
                  .map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{item.type}</div>
                      <div 
                        className="text-xs text-blue-600 cursor-pointer hover:underline"
                        onClick={() => setViewingDPP(item)}
                      >
                        {item.id}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.status === EwasteStatus.COLLECTED_BY_CITIZEN 
                          ? 'bg-purple-100 text-purple-800' // Citizen said yes
                          : 'bg-yellow-100 text-yellow-800' // Pending
                      }`}>
                        {item.status === EwasteStatus.COLLECTED_BY_CITIZEN ? 'Citizen Confirmed' : 'Scheduled'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-mono font-bold ${item.classification === 'REFURBISH' ? 'text-green-600' : 'text-orange-600'}`}>
                        {item.classification}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleVerify(item.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <ClipboardCheck className="w-3 h-3" />
                        Verify Receipt
                      </button>
                    </td>
                  </tr>
                ))}
                {items.filter(i => i.status === EwasteStatus.COLLECTED_BY_CITIZEN || i.status === EwasteStatus.SCHEDULED).length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      No pending collections to verify.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="font-bold text-gray-800 mb-4">Operations Overview</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg text-xs text-blue-800 flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>
              <strong>System Logic:</strong> Only VERIFIED items appear in the Recycler Marketplace. 
              Items not verified by Friday roll over to next cycle automatically.
            </p>
          </div>
        </div>
      </div>
      
       <DPPModal item={viewingDPP} onClose={() => setViewingDPP(null)} />
    </div>
  );
};

export default MunicipalView;