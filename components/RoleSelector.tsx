import React from 'react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../constants';
import { Users } from 'lucide-react';

interface RoleSelectorProps {
  currentUser: User;
  onSelect: (user: User) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ currentUser, onSelect }) => {
  return (
    <div className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
            <div className="bg-green-600 p-2 rounded-lg">
                <Users className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-gray-700 text-sm hidden md:inline">EcoCycle Role Switcher</span>
        </div>
        
        <div className="flex gap-2">
          {Object.values(DEMO_USERS).map(user => (
            <button
              key={user.id}
              onClick={() => onSelect(user as User)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                currentUser.role === user.role
                  ? 'bg-green-600 text-white shadow-md transform scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {user.role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;