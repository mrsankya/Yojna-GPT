
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

  const FooterText = () => (
    <div className="mt-4 text-slate-400 text-[10px] font-medium tracking-wide">
      Made with ❤️ by <span className="text-orange-600 font-bold">Tantra tech</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 transition-colors duration-300">
      <div className={`auth-wrapper shadow-2xl ${isToggled ? 'toggled' : ''}`}>
        
        {/* Sign In Panel */}
        <div className="credentials-panel signin">
          <h2 className="text-3xl font-bold text-orange-600 mb-2">Login</h2>
          <p className="text-slate-400 text-sm mb-4">Access your YojnaGPT dashboard</p>
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
            <button className="w-full mt-8 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg" type="submit">
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
                className="group relative px-6 py-3 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl text-xs font-black text-orange-600 dark:text-orange-400 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all flex items-center gap-3 animate-pulse shadow-md hover:animate-none"
              >
                <span className="text-lg group-hover:scale-125 transition-transform">🚀</span> 
                <div className="text-left">
                  <p className="leading-none">EXPLORE IN DEMO MODE</p>
                  <p className="text-[8px] opacity-70 mt-0.5 uppercase tracking-tighter">Unlock All Gold Features Instantly</p>
                </div>
              </button>
              <FooterText />
            </div>
          </form>
        </div>

        {/* Welcome Signin */}
        <div className="welcome-section signin flex items-center justify-center">
          <div className="push-group">
            <div className="welcome-content">
              <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Welcome Back!</h2>
              <p className="opacity-90 max-w-[200px] mx-auto text-sm">Empowering every citizen with real-time support and instant scheme matching.</p>
            </div>
            <div className="rocket-pusher">
              🚀
              <div className="thruster-flame"></div>
            </div>
          </div>
        </div>

        {/* Sign Up Panel */}
        <div className="credentials-panel signup">
          <h2 className="text-3xl font-bold text-orange-600 mb-2">Register</h2>
          <p className="text-slate-400 text-sm mb-4">Join YojnaGPT today</p>
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
            <button className="w-full mt-8 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg" type="submit">
              Register
            </button>
            <div className="text-center mt-4 text-sm text-slate-500">
              Already have an account? <br />
              <button type="button" onClick={() => setIsToggled(false)} className="text-orange-600 font-bold hover:underline">Sign In</button>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center">
              <button 
                type="button"
                onClick={handleDemoMode}
                className="group relative px-6 py-3 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl text-xs font-black text-orange-600 dark:text-orange-400 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all flex items-center gap-3 animate-pulse shadow-md hover:animate-none"
              >
                <span className="text-lg group-hover:scale-125 transition-transform">🚀</span> 
                <div className="text-left">
                  <p className="leading-none">EXPLORE IN DEMO MODE</p>
                  <p className="text-[8px] opacity-70 mt-0.5 uppercase tracking-tighter">Unlock All Gold Features Instantly</p>
                </div>
              </button>
              <FooterText />
            </div>
          </form>
        </div>

        {/* Welcome Signup */}
        <div className="welcome-section signup flex items-center justify-center">
          <div className="push-group">
            <div className="welcome-content">
              <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Namaste! 🙏</h2>
              <p className="opacity-90 max-w-[200px] mx-auto text-sm">Create an account to save schemes, verify documents, and track your citizen progress.</p>
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
