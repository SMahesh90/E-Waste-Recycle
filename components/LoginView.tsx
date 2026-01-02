import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../services/supabaseClient';
import { BackendService } from '../services/mockBackend';
import { User as UserIcon, Building2, Factory, Recycle, ArrowLeft, Mail, Lock, UserPlus, LogIn, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'signin' | 'signup';

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleRoleSelect = (role: UserRole, mode: AuthMode) => {
    setSelectedRole(role);
    setAuthMode(mode);
    setEmail('');
    setPassword('');
    setName('');
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (authMode === 'signup') {
        // 1. Sign Up
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;
        if (authData.user) {
           // 2. Create Profile
           const newUser: User = {
             id: authData.user.id,
             name: name,
             role: selectedRole!,
             avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
           };
           await BackendService.createProfile(newUser);
           onLogin(newUser);
        }
      } else {
        // 1. Sign In
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) throw authError;
        if (authData.user) {
          // 2. Fetch Profile
          const userProfile = await BackendService.getUserProfile(authData.user.id);
          if (userProfile) {
            if (userProfile.role !== selectedRole) {
              throw new Error(`Account exists but is registered as ${userProfile.role}, not ${selectedRole}`);
            }
            onLogin(userProfile);
          } else {
             throw new Error("Profile not found.");
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderRoleCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {/* Citizen Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col items-center hover:shadow-2xl transition-shadow duration-300">
          <div className="bg-blue-100 p-4 rounded-full mb-6">
            <UserIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Citizen</h2>
          <p className="text-gray-500 text-center mb-8 flex-grow">
            Responsibly dispose of your e-waste. Schedule collections and track your Digital Product Passports.
          </p>
          <div className="w-full flex flex-col gap-3">
             <button
               onClick={() => handleRoleSelect(UserRole.CITIZEN, 'signin')}
               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow transition flex items-center justify-center gap-2"
             >
               <LogIn className="w-4 h-4" /> Sign In
             </button>
             <button
               onClick={() => handleRoleSelect(UserRole.CITIZEN, 'signup')}
               className="w-full bg-white border-2 border-blue-600 text-blue-600 font-bold py-3 px-6 rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-2"
             >
               <UserPlus className="w-4 h-4" /> Register
             </button>
          </div>
        </div>

        {/* Municipality Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col items-center hover:shadow-2xl transition-shadow duration-300">
          <div className="bg-orange-100 p-4 rounded-full mb-6">
            <Building2 className="w-10 h-10 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Municipality</h2>
          <p className="text-gray-500 text-center mb-8 flex-grow">
            Manage e-waste collections, verify assets, and oversee the city-wide recycling dashboard.
          </p>
          <div className="w-full flex flex-col gap-3">
             <button
               onClick={() => handleRoleSelect(UserRole.MUNICIPALITY, 'signin')}
               className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl shadow transition flex items-center justify-center gap-2"
             >
               <LogIn className="w-4 h-4" /> Sign In
             </button>
             <button
               onClick={() => handleRoleSelect(UserRole.MUNICIPALITY, 'signup')}
               className="w-full bg-white border-2 border-orange-600 text-orange-600 font-bold py-3 px-6 rounded-xl hover:bg-orange-50 transition flex items-center justify-center gap-2"
             >
               <UserPlus className="w-4 h-4" /> Register
             </button>
          </div>
        </div>

        {/* Recycler Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col items-center hover:shadow-2xl transition-shadow duration-300">
          <div className="bg-green-100 p-4 rounded-full mb-6">
            <Factory className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Recycler</h2>
          <p className="text-gray-500 text-center mb-8 flex-grow">
            Access verified e-waste feedstock. Bid on bulk batches and manage material recovery.
          </p>
          <div className="w-full flex flex-col gap-3">
             <button
               onClick={() => handleRoleSelect(UserRole.RECYCLER, 'signin')}
               className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow transition flex items-center justify-center gap-2"
             >
               <LogIn className="w-4 h-4" /> Sign In
             </button>
             <button
               onClick={() => handleRoleSelect(UserRole.RECYCLER, 'signup')}
               className="w-full bg-white border-2 border-green-600 text-green-600 font-bold py-3 px-6 rounded-xl hover:bg-green-50 transition flex items-center justify-center gap-2"
             >
               <UserPlus className="w-4 h-4" /> Register
             </button>
          </div>
        </div>
      </div>
  );

  const renderAuthForm = () => {
    const isCitizen = selectedRole === UserRole.CITIZEN;
    const isMuni = selectedRole === UserRole.MUNICIPALITY;
    const isRecycler = selectedRole === UserRole.RECYCLER;

    const bgClass = isCitizen ? 'bg-blue-600' : isMuni ? 'bg-orange-600' : 'bg-green-600';
    const textClass = isCitizen ? 'text-blue-600' : isMuni ? 'text-orange-600' : 'text-green-600';
    const borderClass = isCitizen ? 'border-blue-600' : isMuni ? 'border-orange-600' : 'border-green-600';
    const hoverBgClass = isCitizen ? 'hover:bg-blue-700' : isMuni ? 'hover:bg-orange-700' : 'hover:bg-green-700';

    return (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden relative">
            <button 
                onClick={() => setSelectedRole(null)} 
                className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition text-gray-600"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>
            
            <div className={`p-8 text-center text-white ${bgClass}`}>
                <div className="bg-white/20 p-4 rounded-full inline-block mb-4 backdrop-blur-sm">
                    {isCitizen && <UserIcon className="w-8 h-8 text-white" />}
                    {isMuni && <Building2 className="w-8 h-8 text-white" />}
                    {isRecycler && <Factory className="w-8 h-8 text-white" />}
                </div>
                <h2 className="text-2xl font-bold capitalize">{selectedRole?.toLowerCase()} Portal</h2>
                <p className="text-white/80 text-sm mt-1">
                    {authMode === 'signin' ? 'Welcome back! Please sign in.' : 'Create your account to get started.'}
                </p>
            </div>

            <div className="p-8">
                 {/* Tabs */}
                 <div className="flex mb-6 border-b">
                    <button 
                        className={`flex-1 pb-2 text-center font-medium transition ${authMode === 'signin' ? `${textClass} border-b-2 ${borderClass}` : 'text-gray-400'}`}
                        onClick={() => setAuthMode('signin')}
                    >
                        Sign In
                    </button>
                    <button 
                        className={`flex-1 pb-2 text-center font-medium transition ${authMode === 'signup' ? `${textClass} border-b-2 ${borderClass}` : 'text-gray-400'}`}
                        onClick={() => setAuthMode('signup')}
                    >
                        Sign Up
                    </button>
                 </div>

                 {errorMsg && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> {errorMsg}
                    </div>
                 )}

                 <form onSubmit={handleSubmit} className="space-y-4">
                    {authMode === 'signup' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="text" 
                                    required 
                                    className="pl-10 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-opacity-50 outline-none transition"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                type="email" 
                                required
                                className="pl-10 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-opacity-50 outline-none transition"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                type="password" 
                                required
                                className="pl-10 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-opacity-50 outline-none transition"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full text-white font-bold py-3 rounded-lg shadow-md transition mt-6 ${bgClass} ${hoverBgClass} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Processing...' : (authMode === 'signin' ? 'Access Dashboard' : 'Create Account')}
                    </button>
                 </form>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col justify-center items-center p-4">
      <div className={`text-center transition-all duration-500 ${selectedRole ? 'mb-8' : 'mb-12'}`}>
        <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-green-600 p-3 rounded-2xl shadow-lg cursor-pointer" onClick={() => setSelectedRole(null)}>
                <Recycle className="h-10 w-10 text-white" />
            </div>
        </div>
        {!selectedRole && (
            <>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                EcoCycle <span className="text-green-600">Recovery</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                Municipal E-Waste Resource Recovery Platform. <br/>
                Select your role to continue.
                </p>
            </>
        )}
      </div>

      {selectedRole ? renderAuthForm() : renderRoleCards()}
      
      <div className="mt-12 text-center text-sm text-gray-500">
        &copy; 2024 Municipal E-Waste Resource Recovery Platform
      </div>
    </div>
  );
};

export default LoginView;