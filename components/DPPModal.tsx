import React from 'react';
import { EwasteItem, EwasteStatus } from '../types';
import { X, CheckCircle, Clock, Truck, Gavel, Factory, FileText } from 'lucide-react';

interface DPPModalProps {
  item: EwasteItem | null;
  onClose: () => void;
}

const DPPModal: React.FC<DPPModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const getIcon = (status: EwasteStatus) => {
    switch (status) {
      case EwasteStatus.SUBMITTED: return <FileText className="w-5 h-5 text-blue-500" />;
      case EwasteStatus.SCHEDULED: return <Clock className="w-5 h-5 text-yellow-500" />;
      case EwasteStatus.COLLECTED_BY_CITIZEN: return <Truck className="w-5 h-5 text-orange-500" />;
      case EwasteStatus.VERIFIED: return <CheckCircle className="w-5 h-5 text-green-500" />;
      case EwasteStatus.ASSIGNED_TO_RECYCLER: return <Gavel className="w-5 h-5 text-purple-500" />;
      case EwasteStatus.HANDED_OVER: return <Factory className="w-5 h-5 text-indigo-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b bg-green-50">
          <div>
            <h2 className="text-2xl font-bold text-green-900">Digital Product Passport</h2>
            <p className="text-sm text-green-700 font-mono">{item.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-green-100 rounded-full">
            <X className="w-6 h-6 text-green-800" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Device Info */}
          <div className="space-y-4">
            <img src={item.imageUrl} alt={item.model} className="w-full h-48 object-cover rounded-lg border" />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Type</p>
                <p className="font-semibold">{item.type}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Classification</p>
                <p className={`font-semibold ${item.classification === 'REFURBISH' ? 'text-blue-600' : 'text-orange-600'}`}>
                  {item.classification}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Condition</p>
                <p className="font-semibold">{item.condition}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Value Estimate</p>
                <p className="font-semibold text-green-700">₹{item.estimatedValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800">Lifecycle History</h3>
            <div className="space-y-6 relative border-l-2 border-gray-200 ml-3 pl-6">
              {item.history.slice().reverse().map((event, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[35px] bg-white p-1 rounded-full border border-gray-200">
                    {getIcon(event.status)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{event.status.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{new Date(event.date).toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-1 italic">"{event.note}"</p>
                    <p className="text-xs text-blue-600 mt-1">Actor: {event.actor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DPPModal;