
import React, { useState, useEffect } from 'react';

interface Props {
  onLogin: (userData: any) => void;
}

interface StoredUser {
  username: string;
  password?: string;
  email: string;
  isAdmin: boolean;
}

const AuthPage: React.FC<Props> = ({ onLogin }) => {
  const [isToggled, setIsToggled] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load registered users from local storage or initialize with admin
  const getRegisteredUsers = (): StoredUser[] => {
    const saved = localStorage.getItem('yojnagpt_registered_users');
    const initialAdmin: StoredUser = { 
      username: 'Mr.sankya', 
      password: 'admin@123', 
      email: 'admin@yojnagpt.in', 
      isAdmin: true 
    };
    
    if (!saved) {
      localStorage.setItem('yojnagpt_registered_users', JSON.stringify([initialAdmin]));
      return [initialAdmin];
    }
    return JSON.parse(saved);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    setTimeout(() => {
      const users = getRegisteredUsers();
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

      if (user) {
        onLogin({
          fullName: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          isDemo: false,
          occupation: user.isAdmin ? 'System Administrator' : 'Citizen'
        });
      } else {
        setError("Invalid username or password. Please register if you haven't yet.");
      }
      setIsProcessing(false);
    }, 1000);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    setTimeout(() => {
      const users = getRegisteredUsers();
      const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());

      if (exists) {
        setError("Username already taken. Please choose another one.");
        setIsProcessing(false);
        return;
      }

      const newUser: StoredUser = {
        username,
        password,
        email,
        isAdmin: false
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem('yojnagpt_registered_users', JSON.stringify(updatedUsers));
      
      // Auto-login after registration
      onLogin({
        fullName: newUser.username,
        email: newUser.email,
        isAdmin: false,
        isDemo: false,
        occupation: 'Citizen'
      });
      setIsProcessing(false);
    }, 1200);
  };

  const handleDemoMode = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onLogin({
        fullName: 'Demo Citizen',
        email: 'demo@yojnagpt.in',
        isDemo: true,
        isAdmin: true,
        occupation: 'Product Tester'
      });
      setIsProcessing(false);
    }, 500);
  };

  const FooterText = () => (
    <div className="mt-4 text-slate-400 text-[10px] font-medium tracking-wide">
      Made with ❤️ by <span className="text-orange-600 font-bold">Tantra tech</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 transition-colors duration-300">
      <div className={`auth-wrapper shadow-2xl transition-all duration-500 ${isToggled ? 'toggled' : ''} ${isProcessing ? 'opacity-70 grayscale-[0.3] pointer-events-none' : 'opacity-100'}`}>
        
        {/* Sign In Panel */}
        <div className="credentials-panel signin">
          <h2 className="text-3xl font-bold text-orange-600 mb-2">Login</h2>
          <p className="text-slate-400 text-sm mb-4">Please enter your registered details</p>
          
          {error && !isToggled && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 border border-red-100 animate-shake">
              <i className="fa-solid fa-circle-exclamation mr-2"></i> {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="field-wrapper">
              <input 
                type="text" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label>Username</label>
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="field-wrapper">
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Password</label>
              <i className="fa-solid fa-lock"></i>
            </div>
            
            <button 
              className="w-full mt-8 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg flex items-center justify-center gap-2" 
              type="submit"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                  Verifying...
                </>
              ) : (
                'Login'
              )}
            </button>
            
            <div className="text-center mt-6 text-sm text-slate-500">
              New here? <br />
              <button type="button" onClick={() => { setIsToggled(true); setError(null); }} className="text-orange-600 font-bold hover:underline">Create an Account</button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center">
              <button 
                type="button"
                onClick={handleDemoMode}
                className="group relative px-6 py-3 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl text-xs font-black text-orange-600 dark:text-orange-400 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all flex items-center gap-3 shadow-md"
              >
                <span className="text-lg group-hover:scale-125 transition-transform">🚀</span> 
                <div className="text-left">
                  <p className="leading-none text-[10px]">GUEST DEMO</p>
                  <p className="text-[8px] opacity-70 mt-0.5 uppercase tracking-tighter">Skip Registration</p>
                </div>
              </button>
              <FooterText />
            </div>
          </form>
        </div>

        {/* Welcome Signin Panel (Visual) */}
        <div className="welcome-section signin flex items-center justify-center">
          <div className="push-group">
            <div className="welcome-content">
              <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Welcome Back!</h2>
              <p className="opacity-90 max-w-[200px] mx-auto text-sm">Your secure portal to 500+ Government schemes and benefits.</p>
            </div>
            <div className="rocket-pusher">
              🚀
              <div className="thruster-flame"></div>
            </div>
          </div>
        </div>

        {/* Sign Up Panel */}
        <div className="credentials-panel signup">
          <h2 className="text-3xl font-bold text-orange-600 mb-2">Join Us</h2>
          <p className="text-slate-400 text-sm mb-4">Register to save your history</p>
          
          {error && isToggled && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 border border-red-100 animate-shake">
              <i className="fa-solid fa-circle-exclamation mr-2"></i> {error}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit}>
            <div className="field-wrapper">
              <input 
                type="text" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label>Choose Username</label>
              <i className="fa-solid fa-user-plus"></i>
            </div>
            <div className="field-wrapper">
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Email Address</label>
              <i className="fa-solid fa-envelope"></i>
            </div>
            <div className="field-wrapper">
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Create Password</label>
              <i className="fa-solid fa-lock"></i>
            </div>
            <button 
              className="w-full mt-8 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg flex items-center justify-center gap-2" 
              type="submit"
              disabled={isProcessing}
            >
               {isProcessing ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                  Registering...
                </>
              ) : (
                'Create Account'
              )}
            </button>
            <div className="text-center mt-4 text-sm text-slate-500">
              Already have an account? <br />
              <button type="button" onClick={() => { setIsToggled(false); setError(null); }} className="text-orange-600 font-bold hover:underline">Go to Login</button>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center">
              <button 
                type="button"
                onClick={handleDemoMode}
                className="group relative px-6 py-3 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl text-xs font-black text-orange-600 dark:text-orange-400 hover:bg-orange-600 transition-all shadow-md"
              >
                <span className="text-lg">🚀</span> 
                <div className="text-left">
                  <p className="leading-none text-[10px]">DEMO MODE</p>
                  <p className="text-[8px] opacity-70 mt-0.5 uppercase tracking-tighter">Skip Steps</p>
                </div>
              </button>
              <FooterText />
            </div>
          </form>
        </div>

        {/* Welcome Signup Panel (Visual) */}
        <div className="welcome-section signup flex items-center justify-center">
          <div className="push-group">
            <div className="welcome-content">
              <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Namaste! 🙏</h2>
              <p className="opacity-90 max-w-[200px] mx-auto text-sm">Join thousands of citizens receiving personalized AI guidance for welfare schemes.</p>
            </div>
            <div className="rocket-pusher">
              🚀
              <div className="thruster-flame"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
