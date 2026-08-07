import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Building, ArrowRight, Loader2, Briefcase } from 'lucide-react';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate',
    company: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleRegister(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(formData);
      navigate('/login');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Premium Minimal Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-6 group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:scale-105 transition-all">
              <span className="font-black text-2xl text-white">H</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Create an account</h2>
          <p className="text-gray-400">Join HireMind to transform your hiring experience</p>
        </div>

        <div className="glass-card hover-3d bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-5">
            
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'candidate' })}
                className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border ${
                  formData.role === 'candidate'
                    ? 'btn-premium btn-3d border-transparent'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                } flex items-center justify-center gap-2`}
              >
                <User className="w-4 h-4" /> Candidate
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'recruiter' })}
                className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border ${
                  formData.role === 'recruiter'
                    ? 'btn-premium btn-3d border-transparent'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                } flex items-center justify-center gap-2`}
              >
                <Briefcase className="w-4 h-4" /> Recruiter
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-premium block w-full pl-11 pr-4 py-2.5 rounded-xl text-white placeholder-gray-500 transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-premium block w-full pl-11 pr-4 py-2.5 rounded-xl text-white placeholder-gray-500 transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {formData.role === 'recruiter' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block text-sm font-medium text-gray-300 mb-1">Company Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="input-premium block w-full pl-11 pr-4 py-2.5 rounded-xl text-white placeholder-gray-500 transition-all"
                    placeholder="Acme Corp"
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-premium block w-full pl-11 pr-4 py-2.5 rounded-xl text-white placeholder-gray-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-premium btn-3d flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-white hover:text-primary transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
