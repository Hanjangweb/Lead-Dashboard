import { useState } from 'react';
import { API } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ShieldCheck, ShieldAlert } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Strong password regex: 8+ chars, at least 1 letter and 1 number
  const isStrong = (pw) => pw.length >= 8 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStrong(formData.password)) {
      toast.error("Password must be 8+ characters and contain both letters and numbers.");
      return;
    }
    try {
      await API.post('/auth/register', formData);
      toast.success("Registration Successful! Please Login.");
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 overflow-hidden">
      {/* Dynamic Background Blobs (Matched with Login) */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <form 
        onSubmit={handleSubmit} 
        className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
          <p className="text-gray-500 mt-2">Join us and start managing your dashboard</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
              placeholder="John Doe" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
              type="email" 
              placeholder="name@company.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.password && (
              <div className={`flex items-center gap-2 mt-2 text-[10px] font-bold uppercase tracking-wider ${isStrong(formData.password) ? 'text-emerald-600' : 'text-amber-500'}`}>
                {isStrong(formData.password) ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                {isStrong(formData.password) ? 'Strong Password' : 'Weak: Needs 8+ chars, letters & numbers'}
              </div>
            )}
          </div>
        </div>

        <button className="w-full cursor-pointer mt-8 bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 transform transition-active:scale-95 duration-200 shadow-lg shadow-indigo-200">
          Sign Up
        </button>

        {/* Login Link */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 underline underline-offset-4">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;