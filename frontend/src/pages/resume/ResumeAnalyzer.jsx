import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, CheckCircle, AlertCircle, RefreshCw, Target, TrendingUp, Sparkles, BrainCircuit, FileSearch, Download } from 'lucide-react';
import api from '../../services/api';

function ScoreRing({ score, label, colorClass, size = "lg" }) {
  const radius = size === "lg" ? 45 : 30;
  const stroke = size === "lg" ? 8 : 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 filter drop-shadow-xl">
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-gray-100 dark:text-white/5"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={`${colorClass}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`font-black ${size === "lg" ? 'text-2xl' : 'text-lg'} text-gray-900 dark:text-white`}>
            {Math.round(score)}
          </span>
        </div>
      </div>
      <span className="mt-4 text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upload');


  async function fetchHistory() {
    try {
      const response = await api.get('/resume/history');
      setHistory(response.data);
      if (response.data.length > 0 && !result) {
        setResult(response.data[0]); 
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  }

  async function handleAnalyze() {
    if (!file) return;
    
    setIsAnalyzing(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
      setFile(null);
      fetchHistory(); 
      setActiveTab('history');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });


  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-transparent p-8 rounded-3xl border border-gray-200 dark:border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Engine
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Resume Analyzer</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 max-w-xl">Upload your resume to get instant AI-driven feedback, ATS compatibility scores, and gap analysis.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Sidebar */}
        <div className="space-y-6">
          <div className="glass-card hover-3d rounded-3xl p-2 flex border border-gray-200 dark:border-white/10 relative overflow-hidden bg-gray-50 dark:bg-black/20">
            <button 
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all relative z-10 ${activeTab === 'upload' ? 'bg-white dark:bg-[var(--surface)] text-gray-900 dark:text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Upload New
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all relative z-10 ${activeTab === 'history' ? 'bg-white dark:bg-[var(--surface)] text-gray-900 dark:text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              History
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'upload' ? (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="glass-card hover-3d rounded-3xl p-6 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-primary/20 transition-all"></div>
                <div 
                  {...getRootProps()} 
                  className={`relative z-10 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive 
                      ? 'border-primary bg-primary/5' 
                      : file ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-300 dark:border-white/10 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 transition-colors ${file ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                    {file ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                  </div>
                  {file ? (
                    <div>
                      <p className="text-gray-900 dark:text-white font-bold mb-1">{file.name}</p>
                      <p className="text-xs text-emerald-500 font-medium">Ready to analyze</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-900 dark:text-white font-bold mb-1">Drop your PDF here</p>
                      <p className="text-xs text-gray-500">or click to browse</p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-500 font-medium">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={!file || isAnalyzing}
                  className="w-full mt-6 btn-premium btn-3d py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      <RefreshCw className="w-5 h-5 animate-spin relative z-10" />
                      <span className="relative z-10">AI is Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" /> Analyze Resume
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="glass-card hover-3d rounded-3xl p-6"
              >
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Past Uploads</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {history.length === 0 ? (
                    <div className="text-center py-10">
                      <FileSearch className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 font-medium">No resumes analyzed yet.</p>
                    </div>
                  ) : (
                    history.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => setResult(item)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          result?.id === item.id 
                            ? 'bg-primary/5 border-primary/30 shadow-md' 
                            : 'bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${result?.id === item.id ? 'bg-primary/20 text-primary' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${result?.id === item.id ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{item.filename}</p>
                            <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">{item.analysis?.overall_score || Math.round((item.analysis?.ats_score + item.analysis?.resume_score) / 2) || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Content - Results */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass-card hover-3d h-full rounded-3xl flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-black/20 min-h-[500px]"
              >
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-6 shadow-inner">
                  <BrainCircuit className="w-12 h-12 text-gray-300 dark:text-gray-700" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No Analysis Selected</h2>
                <p className="text-gray-500 max-w-sm mx-auto font-medium">Upload a resume or select one from your history to view the AI analysis report.</p>
              </motion.div>
            ) : (
              <motion.div 
                key={result.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Analysis Report</h3>
                    <p className="text-xs text-gray-500">Generated on {new Date(result.created_at).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => {
                      const text = `Resume Analysis Report\n\nFile: ${result.filename}\nATS Score: ${result.analysis?.ats_score}\nImpact Score: ${result.analysis?.resume_score}\n\nSummary:\n${result.analysis?.summary}\n\nStrengths:\n${(result.analysis?.strengths || []).join('\n')}\n\nAreas to Improve:\n${(result.analysis?.weaknesses || []).join('\n')}\n\nSkills:\n${(result.analysis?.skills || []).join(', ')}`;
                      const blob = new Blob([text], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Resume_Analysis_${result.filename}.txt`;
                      a.click();
                    }}
                    className="btn-premium btn-3d px-4 py-2 rounded-xl text-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Report
                  </button>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card hover-3d rounded-3xl p-8 flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute -left-10 -top-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
                    <div>
                      <h3 className="text-gray-500 dark:text-gray-400 font-bold mb-1">ATS Parse Score</h3>
                      <p className="text-sm text-gray-400 font-medium max-w-[200px]">How well automated systems can read your format.</p>
                    </div>
                    <ScoreRing score={result.analysis?.ats_score || 0} colorClass="text-emerald-500" />
                  </div>
                  
                  <div className="glass-card hover-3d rounded-3xl p-8 flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
                    <div>
                      <h3 className="text-gray-500 dark:text-gray-400 font-bold mb-1">Impact Score</h3>
                      <p className="text-sm text-gray-400 font-medium max-w-[200px]">Strength of your bullet points and metrics.</p>
                    </div>
                    <ScoreRing score={result.analysis?.resume_score || 0} colorClass="text-blue-500" />
                  </div>
                </div>

                {/* AI Summary */}
                <div className="glass-card hover-3d rounded-3xl p-8 relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] pointer-events-none"></div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white"><Sparkles className="w-5 h-5 text-primary"/> AI Executive Summary</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed relative z-10 text-lg">
                    {result.analysis?.summary || 'No summary available.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="glass-card hover-3d rounded-3xl p-8 border-t-4 border-t-emerald-500">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white"><TrendingUp className="w-5 h-5 text-emerald-500"/> Key Strengths</h3>
                    <ul className="space-y-4">
                      {(result.analysis?.strengths || []).map((s, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-medium">{s}</span>
                        </li>
                      ))}
                      {(!result.analysis?.strengths || result.analysis.strengths.length === 0) && (
                        <p className="text-gray-500 text-sm">No specific strengths identified.</p>
                      )}
                    </ul>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="glass-card hover-3d rounded-3xl p-8 border-t-4 border-t-orange-500">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white"><AlertCircle className="w-5 h-5 text-orange-500"/> Areas to Improve</h3>
                    <ul className="space-y-4">
                      {(result.analysis?.weaknesses || []).map((w, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold">!</span>
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-medium">{w}</span>
                        </li>
                      ))}
                      {(!result.analysis?.weaknesses || result.analysis.weaknesses.length === 0) && (
                        <p className="text-gray-500 text-sm">No critical weaknesses identified.</p>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Skills Analysis */}
                <div className="glass-card hover-3d rounded-3xl p-8">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white"><Target className="w-5 h-5 text-primary"/> Extracted Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(result.analysis?.skills || []).map((skill, i) => (
                      <span key={i} className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-default">
                        {skill}
                      </span>
                    ))}
                    {(!result.analysis?.skills || result.analysis.skills.length === 0) && (
                      <p className="text-gray-500 text-sm">No specific technical skills extracted.</p>
                    )}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
