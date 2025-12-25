
import React, { useState } from 'react';

interface Props {
  onLogin: (userData: any) => void;
}

const AuthPage: React.FC<Props> = ({ onLogin }) => {
  const [isToggled, setIsToggled] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    onLogin({
      fullName: 'Arjun Sharma',
      email: 'arjun@example.in'
    });
  };

  const handleDemoMode = () => {
    onLogin({
      fullName: 'Demo Citizen',
      email: 'demo@yojnagpt.in',
      isDemo: true
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 transition-colors duration-300">
      <div className={`auth-wrapper shadow-2xl ${isToggled ? 'toggled' : ''}`}>
        
        {/* Sign In Panel */}
        <div className="credentials-panel signin">
          <h2 className="text-3xl font-bold text-orange-600 mb-2">Login</h2>
          <p className="text-slate-400 text-sm mb-6">Access your YojnaGPT dashboard</p>
          <form onSubmit={handleSubmit}>
            <div className="field-wrapper">
              <input type="text" required />
              <label>Username</label>
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="field-wrapper">
              <input type="password" required />
              <label>Password</label>
              <i className="fa-solid fa-lock"></i>
            </div>
            <button className="w-full mt-10 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg" type="submit">
              Login
            </button>
            
            <div className="text-center mt-6 text-sm text-slate-500">
              Don't have an account? <br />
              <button type="button" onClick={() => setIsToggled(true)} className="text-orange-600 font-bold hover:underline">Sign Up</button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center">
              <button 
                type="button"
                onClick={handleDemoMode}
                className="text-xs font-bold text-slate-400 hover:text-orange-500 transition-colors flex items-center gap-2"
              >
                <span>🚀</span> Explore in Demo Mode
              </button>
            </div>
          </form>
        </div>

        {/* Welcome Signin */}
        <div className="welcome-section signin flex items-center justify-center text-center">
          <h2 className="text-4xl font-black mb-4">WELCOME BACK!</h2>
          <p className="opacity-90 max-w-[200px]">Empowering every citizen with real-time support.</p>
        </div>

        {/* Sign Up Panel */}
        <div className="credentials-panel signup">
          <h2 className="text-3xl font-bold text-orange-600 mb-2">Register</h2>
          <p className="text-slate-400 text-sm mb-6">Join YojnaGPT today</p>
          <form onSubmit={handleSubmit}>
            <div className="field-wrapper">
              <input type="text" required />
              <label>Username</label>
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="field-wrapper">
              <input type="email" required />
              <label>Email</label>
              <i className="fa-solid fa-envelope"></i>
            </div>
            <div className="field-wrapper">
              <input type="password" required />
              <label>Password</label>
              <i className="fa-solid fa-lock"></i>
            </div>
            <button className="w-full mt-10 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg" type="submit">
              Register
            </button>
            <div className="text-center mt-6 text-sm text-slate-500">
              Already have an account? <br />
              <button type="button" onClick={() => setIsToggled(false)} className="text-orange-600 font-bold hover:underline">Sign In</button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center">
              <button 
                type="button"
                onClick={handleDemoMode}
                className="text-xs font-bold text-slate-400 hover:text-orange-500 transition-colors flex items-center gap-2"
              >
                <span>🚀</span> Explore in Demo Mode
              </button>
            </div>
          </form>
        </div>

        {/* Welcome Signup */}
        <div className="welcome-section signup flex items-center justify-center text-center">
          <h2 className="text-4xl font-black mb-4">NAMASTE! 🙏</h2>
          <p className="opacity-90 max-w-[200px]">Create an account to save schemes and track progress.</p>
        </div>

      </div>
      
      <div className="fixed bottom-10 text-slate-400 text-xs">
        Made with ❤️ by <span className="text-orange-600 font-bold">Tantra tech</span>
      </div>
    </div>
  );
};

export default AuthPage;
