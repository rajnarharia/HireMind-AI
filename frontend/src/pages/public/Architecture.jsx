import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Server, Code2, LayoutDashboard, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

function Architecture() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 glass-card border-b border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 font-bold text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5"/> Back to Home
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-lg">H</div>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-24 max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-sm mb-6 border border-blue-500/20">
            <Server className="w-4 h-4" /> System Architecture
          </div>
          <h1 className="text-5xl font-black mb-6 tracking-tight">Built for Enterprise Scale</h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
            HireMind AI utilizes a modern, decoupled architecture powered by React 18, FastAPI, and a Multi-Agent LLM routing engine via Groq.
          </p>
        </motion.div>

        {/* Frontend Arch */}
        <div className="mb-16 glass-card p-8 rounded-3xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6"/>
            </div>
            <h2 className="text-2xl font-black">Frontend Architecture</h2>
          </div>
          <p className="text-gray-500 font-medium mb-6 leading-relaxed">
            The presentation layer is an SPA built with Vite and React 18. It uses Context API for global state (Auth, Theme) to avoid Redux boilerplate. The UI is constructed with Tailwind CSS utility classes, utilizing CSS variables to enforce strict design tokens for Dark/Light mode glassmorphism.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <strong className="block mb-1 text-gray-900 dark:text-white">Routing</strong>
              <span className="text-sm text-gray-500">React Router v6 with declarative Protected Routes and Role-Based Authorization barriers.</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <strong className="block mb-1 text-gray-900 dark:text-white">IDE Integration</strong>
              <span className="text-sm text-gray-500">Embedded Monaco Editor with custom Web Workers for syntax highlighting.</span>
            </div>
          </div>
        </div>

        {/* Backend Arch */}
        <div className="mb-16 glass-card p-8 rounded-3xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
              <Code2 className="w-6 h-6"/>
            </div>
            <h2 className="text-2xl font-black">Backend Architecture</h2>
          </div>
          <p className="text-gray-500 font-medium mb-6 leading-relaxed">
            The core logic layer is powered by FastAPI (Python 3.10), leveraging ASGI for high-concurrency request handling. Pydantic strictly validates all incoming payloads and outgoing JSON responses.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <strong className="block mb-1 text-gray-900 dark:text-white">Database (ORM)</strong>
              <span className="text-sm text-gray-500">SQLAlchemy maps relational tables to Python objects. Currently uses SQLite, instantly translatable to PostgreSQL.</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <strong className="block mb-1 text-gray-900 dark:text-white">Code Execution</strong>
              <span className="text-sm text-gray-500">Safe evaluation using Python's `exec` wrapped in isolated scopes with `io.StringIO` capture.</span>
            </div>
          </div>
        </div>

        {/* AI & RAG Arch */}
        <div className="glass-card p-8 rounded-3xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
              <BrainCircuit className="w-6 h-6"/>
            </div>
            <h2 className="text-2xl font-black">Multi-Agent AI & RAG Engine</h2>
          </div>
          <p className="text-gray-500 font-medium mb-6 leading-relaxed">
            HireMind relies on Groq's LLaMA-3 70B model for near-instant inference capabilities. We implemented a Multi-Agent architecture where prompts are dynamically routed based on the user's role and state.
          </p>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Retrieval-Augmented Generation (RAG)</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              When a Recruiter asks the AI Copilot a question, the `copilot_service` intercepts the request. It queries the SQLite database to pull all active Jobs, Pipelines, and Candidate metrics associated with that recruiter. It constructs a massive Markdown-formatted context string, injects it into the system prompt, and queries the LLM.
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              This guarantees that the AI does not hallucinate and strictly bases its answers, offer letters, and summaries on actual ATS data.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Architecture;
