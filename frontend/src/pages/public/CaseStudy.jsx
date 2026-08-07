import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Lightbulb, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

function CaseStudy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 glass-card hover-3d border-b border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 font-bold text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5"/> Back to Home
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-lg">H</div>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-24 max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-sm mb-6 border border-green-500/20">
            <Lightbulb className="w-4 h-4" /> Official Case Study
          </div>
          <h1 className="text-5xl font-black mb-6 tracking-tight">Solving Technical Hiring</h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
            Why traditional ATS platforms fail, and how HireMind AI leverages Multi-Agent architectures to fix the recruitment pipeline.
          </p>
        </motion.div>

        <div className="space-y-12">
          
          <section className="glass-card hover-3d p-8 rounded-3xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-red-500"/>
              <h2 className="text-2xl font-black">The Problem</h2>
            </div>
            <div className="prose prose-lg dark:prose-invert text-gray-500 font-medium leading-relaxed max-w-none">
              <p>Technical recruitment in 2026 is fundamentally broken. The process is fragmented across multiple expensive tools:</p>
              <ul>
                <li><strong>Workday/Greenhouse</strong> for tracking candidates (Static Databases).</li>
                <li><strong>HackerRank/LeetCode</strong> for technical screening (Expensive & easily cheated).</li>
                <li><strong>Calendly</strong> for scheduling.</li>
              </ul>
              <p>Because these systems are disconnected, recruiters spend 60% of their time moving data between tabs. Furthermore, standard ATS keyword scanners reject highly qualified candidates who simply formatted their resume poorly. Engineering teams waste hundreds of hours conducting initial phone screens that an AI could perform instantly.</p>
            </div>
          </section>

          <section className="glass-card hover-3d p-8 rounded-3xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-8 h-8 text-primary"/>
              <h2 className="text-2xl font-black">The Solution</h2>
            </div>
            <div className="prose prose-lg dark:prose-invert text-gray-500 font-medium leading-relaxed max-w-none">
              <p>HireMind AI is an <strong>AI-Native OS</strong>. Instead of bolting an AI chatbot onto an old database, we built the ATS around the LLM.</p>
              <ul>
                <li><strong>Resume Parsing:</strong> We don't use regex. We feed the resume to LLaMA-3, which semantically understands the candidate's experience and scores it accurately against the Job Description.</li>
                <li><strong>Adaptive Interviews:</strong> Candidates take a voice-enabled interview immediately after applying. If they claim to know React, the AI pivots and asks deep technical questions about React reconciliation.</li>
                <li><strong>Integrated IDE:</strong> We embedded a Monaco Editor directly into the ATS. The AI executes the candidate's code, runs test cases, and reads their time complexity instantly.</li>
              </ul>
              <p>By unifying these steps, HireMind AI reduces Time-to-Hire by 80% while dramatically improving the candidate experience by providing them with immediate feedback and personalized learning roadmaps.</p>
            </div>
          </section>

          <section className="glass-card hover-3d p-8 rounded-3xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-green-500"/>
              <h2 className="text-2xl font-black">Future Roadmap</h2>
            </div>
            <div className="prose prose-lg dark:prose-invert text-gray-500 font-medium leading-relaxed max-w-none">
              <p>While Phase 1 through 10 achieved MVP parity with enterprise software, the future of HireMind AI involves deep predictive analytics. By tracking the success of hired candidates over 5 years, the AI will learn which interview questions correlate with high employee retention, continuously training its own screening algorithms.</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default CaseStudy;
