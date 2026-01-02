import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { supabase } from './services/supabaseClient';
import { BackendService } from './services/mockBackend';
import LoginView from './components/LoginView';
import CitizenView from './components/CitizenView';
import MunicipalView from './components/MunicipalView';
import RecyclerView from './components/RecyclerView';
import { Leaf, Recycle, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        BackendService.getUserProfile(session.user.id).then(user => {
          if (user) setCurrentUser(user);
          setLoading(false);
        }).catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
            setCurrentUser(null);
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-green-600 font-bold animate-pulse">Loading EcoCycle...</div>
          </div>
      );
  }

  if (!currentUser) {
    return <LoginView onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* Main Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center text-green-600 gap-2">
                <Recycle className="h-8 w-8" />
                <span className="font-bold text-xl tracking-tight text-gray-900">EcoCycle <span className="text-green-600">Recovery</span></span>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                 <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                 <p className="text-xs text-gray-500">{currentUser.role}</p>
               </div>
               <img 
                 className="h-10 w-10 rounded-full bg-gray-100 border-2 border-green-100" 
                 src={currentUser.avatarUrl} 
                 alt="" 
               />
               <button 
                 onClick={handleLogout}
                 className="ml-2 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                 title="Logout"
               >
                 <LogOut className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Render View Based on Role */}
        {currentUser.role === UserRole.CITIZEN && (
          <CitizenView user={currentUser} />
        )}

        {currentUser.role === UserRole.MUNICIPALITY && (
          <MunicipalView />
        )}

        {currentUser.role === UserRole.RECYCLER && (
          <RecyclerView user={currentUser} />
        )}

      </main>

      <footer className="bg-white border-t mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p className="flex items-center justify-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-green-500" />
            Sustainable E-Waste Management Platform
          </p>
          <p>&copy; 2024 EcoCycle Municipal Initiative. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;