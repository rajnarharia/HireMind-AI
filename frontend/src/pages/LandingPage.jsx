import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2, LineChart, Sparkles, CheckCircle2 } from 'lucide-react';

function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-secondary/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-blob pointer-events-none" />
      <div className="absolute top-1/3 -left-1/4 w-[600px] h-[600px] bg-accent/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-blob animation-delay-2000 pointer-events-none" />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Introducing HireMind AI 2.0
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 dark:text-white mb-8 leading-tight"
          >
            Hire the top 1% <br className="hidden sm:block" />
            with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">AI Precision.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-400 mx-auto mb-10 font-medium"
          >
            An intelligent, adaptive platform that automates resume screening, conducts technical interviews, and analyzes skill gaps in real-time.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-full hover:scale-105 transition-transform shadow-xl group">
              Start Hiring Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Candidate Login
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="py-12 border-y border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-8">Trusted by innovative engineering teams</p>
          <div className="flex justify-center gap-12 opacity-50 grayscale flex-wrap">
            <span className="text-2xl font-black">Vercel</span>
            <span className="text-2xl font-black">Stripe</span>
            <span className="text-2xl font-black">Linear</span>
            <span className="text-2xl font-black">Notion</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-gray-900 dark:text-white">The ultimate hiring foundation.</h2>
          <p className="text-xl text-gray-500 dark:text-gray-400">Everything you need to scale your engineering team, built on a robust, premium architecture.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Secure Authentication', desc: 'Enterprise-grade JWT authentication with Role Based Access Control.', icon: Code2 },
            { title: 'Global Theming', desc: 'Beautiful dark and light modes that respect system preferences automatically.', icon: Sparkles },
            { title: 'Analytics Ready', desc: 'Dashboard architectures built to handle massive data throughput visually.', icon: LineChart },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="glass-card hover-3d p-8 rounded-3xl group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Placeholder */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white">HireMind<span className="text-primary">.ai</span></span>
          </div>
          <p className="text-sm text-gray-500 font-medium">© 2026 HireMind AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
