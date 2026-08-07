import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center relative overflow-hidden py-20 px-4">
      {/* Animated Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="glass-card hover-3d rounded-[2rem] p-10 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-2xl text-center">
          
          <div className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">HireMind<span className="text-primary">.ai</span></span>
          </div>

          {!isSubmitted ? (
            <>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Reset your password</h1>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Enter your email and we'll send you a link to reset your password.</p>
              
              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary transition-all group"
                >
                  Send Reset Link
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">We sent a password reset link to <br/><span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span></p>
            </motion.div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link to="/login" className="inline-flex items-center text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to log in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
