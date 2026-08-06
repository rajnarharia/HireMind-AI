import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FileText, Download, ChevronRight, Loader2, Target, Zap, AlertTriangle, CheckCircle, BarChart, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart as RechartsBar, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import html2pdf from 'html2pdf.js';

import { useNavigate } from 'react-router-dom';

function HiringReportDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  
  const [jdText, setJdText] = useState("");
  const [jdTitle, setJdTitle] = useState("Software Engineer");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [activeGap, setActiveGap] = useState(null);
  
  const reportRef = useRef(null);


  async function fetchData() {
    try {
      const [resRes, repRes] = await Promise.all([
        api.get('/resume/history'),
        api.get('/report/history')
      ]);
      setResumes(resRes.data);
      setReports(repRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadReport(reportId) {
    setIsLoading(true);
    try {
      const gapRes = await api.get(`/report/${reportId}/gap`);
      const rep = reports.find(r => r.id === reportId);
      setActiveReport(rep);
      setActiveGap(gapRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function generateReport() {
    if (!selectedResume || !jdText.trim()) return;
    setIsProcessing(true);
    try {
      const res = await api.post(`/report/generate?resume_id=${selectedResume}`, {
        title: jdTitle,
        raw_text: jdText
      });
      await fetchData();
      await loadReport(res.data.id);
    } catch (err) {
      alert("Failed to generate report. Please try again or check the server logs.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }

  function downloadPDF() {
    const element = reportRef.current;
    if (!element) return;
    
    const opt = {
      margin: 10,
      filename: `HireMind_Report_${activeReport.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  }

  async function generateRoadmapForReport() {
    if (!activeReport) return;
    setIsProcessing(true);
    try {
      await api.post(`/roadmap/generate/${activeReport.id}`);
      navigate('/dashboard/roadmap');
    } catch (err) {
      alert("Failed to generate roadmap.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-pulse">
        <div className="h-40 skeleton w-full"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 skeleton w-full"></div>
          <div className="h-96 skeleton w-full"></div>
        </div>
      </div>
    );
  }

  function downloadCSV() {
    if (!activeReport) return;
    const csvContent = [
      ["Metric", "Value"],
      ["Report ID", activeReport.id],
      ["Date", new Date(activeReport.created_at).toLocaleDateString()],
      ["Overall Score", activeReport.overall_score],
      ["Resume Score", activeReport.resume_score],
      ["Interview Score", activeReport.interview_score],
      ["Coding Score", activeReport.coding_score],
      ["Strengths", (activeReport.strengths || []).join("; ")],
      ["Weaknesses", (activeReport.weaknesses || []).join("; ")]
    ].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `HireMind_Report_${activeReport.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- VIEW: Active Report ---
  if (activeReport && activeGap) {
    
    // Prepare Radar Data
    const radarData = [
      { subject: 'Technical', A: activeGap.technical_match_percent || 0, fullMark: 100 },
      { subject: 'Soft Skills', A: activeGap.soft_skill_match_percent || 0, fullMark: 100 },
      { subject: 'Experience', A: activeGap.experience_match_percent || 0, fullMark: 100 },
      { subject: 'Coding', A: activeReport.coding_score || 0, fullMark: 100 },
      { subject: 'Interview', A: activeReport.interview_score || 0, fullMark: 100 },
    ];

    const barData = [
      ...(activeGap.matching_skills || []).map(s => ({ name: s, Required: 8, Current: 9 })),
      ...(activeGap.weak_skills || []).map(s => ({ name: s, Required: 8, Current: 4 })),
      ...(activeGap.missing_skills || []).map(s => ({ name: s, Required: 7, Current: 1 }))
    ].slice(0, 10);

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8 pb-12">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-gray-200 dark:border-white/5 backdrop-blur-md sticky top-4 z-50 shadow-sm">
          <button 
            onClick={() => setActiveReport(null)}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Generator
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={generateRoadmapForReport}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Target className="w-4 h-4" /> Generate Roadmap
            </button>
            <button 
              onClick={downloadCSV}
              className="px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button 
              onClick={downloadPDF}
              className="btn-premium px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>

        {/* Report Container (for PDF export) */}
        <div ref={reportRef} className="space-y-8 bg-white dark:bg-[#07090D] rounded-3xl p-6 md:p-12 shadow-2xl border border-gray-200 dark:border-white/5 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-200 dark:border-white/10 pb-8 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black shadow-lg">H</div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">HireMind AI Report</h1>
              </div>
              <p className="text-gray-500 mt-2 font-medium">Comprehensive Readiness Analysis</p>
              <div className="mt-6 space-y-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white"><span className="text-gray-500 font-medium">Candidate:</span> {user?.name}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white"><span className="text-gray-500 font-medium">Report ID:</span> {activeReport.id}</p>
                <p className="text-sm text-gray-500"><span className="font-medium">Date:</span> {new Date(activeReport.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Overall Match</p>
              <div className="w-32 h-32 relative flex flex-col items-center justify-center bg-gray-50 dark:bg-white/5 rounded-full border-4 border-gray-100 dark:border-white/10 shadow-inner">
                <span className="text-4xl font-black text-primary">{activeReport.overall_score}</span>
                <span className="text-sm font-bold text-gray-400">/ 100</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 relative z-10">
            {/* Core Metrics */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white"><Target className="w-5 h-5 text-primary"/> Core Assessments</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Resume ATS</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{activeReport.resume_score}</p>
                </div>
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">AI Interview</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{activeReport.interview_score}</p>
                </div>
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Coding Round</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{activeReport.coding_score}</p>
                </div>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white"><BarChart className="w-5 h-5 text-primary"/> Competency Radar</h3>
              <div className="h-64 bg-gray-50 dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/5 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{fill: '#888', fontSize: 12}} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Candidate" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Skill Gaps Bar Chart */}
          <div className="pt-8 relative z-10 border-t border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white"><Zap className="w-5 h-5 text-orange-500"/> Skill Proficiency vs Requirement</h3>
            
            <div className="h-80 bg-gray-50 dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/5 p-6">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBar data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="Current" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Required" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </RechartsBar>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">No skill gaps identified.</div>
              )}
            </div>
          </div>

          {/* Key Findings */}
          <div className="pt-8 relative z-10 border-t border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white"><ShieldCheck className="w-5 h-5 text-primary"/> AI Recommendations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card bg-emerald-500/5 border-emerald-500/20 rounded-3xl p-6">
                <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Strengths</h4>
                <ul className="space-y-3">
                  {(activeReport.strengths || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-emerald-500 mt-1">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card bg-orange-500/5 border-orange-500/20 rounded-3xl p-6">
                <h4 className="font-bold text-orange-600 dark:text-orange-400 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Development Areas</h4>
                <ul className="space-y-3">
                  {(activeReport.weaknesses || []).map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-orange-500 mt-1">•</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
        </div>
      </motion.div>
    );
  }

  // --- VIEW: Generator & History ---
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-transparent p-8 rounded-3xl border border-gray-200 dark:border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3 h-3" /> Synthesis
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Hiring Reports & Gaps</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 max-w-xl">Generate comprehensive reports combining resume parsing, coding, and behavioral interview data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Generator Form */}
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-primary/20 transition-all"></div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white relative z-10"><Zap className="w-5 h-5 text-primary"/> Generate New Report</h2>
          
          <div className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Candidate Resume</label>
              {resumes.length === 0 ? (
                <div className="p-4 bg-gray-50 dark:bg-[#111827] rounded-xl border border-dashed border-gray-200 dark:border-white/10 text-sm text-gray-500">
                  No resumes found. Please upload one first.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                  {resumes.map(r => (
                    <div 
                      key={r.id} 
                      onClick={() => setSelectedResume(r.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                        selectedResume === r.id 
                          ? 'bg-primary/10 border-primary shadow-sm' 
                          : 'bg-white dark:bg-[#111827] border-gray-200 dark:border-white/10 hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedResume === r.id ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className={`text-sm font-bold truncate ${selectedResume === r.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{r.filename}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target Job Title</label>
              <input 
                type="text" 
                value={jdTitle}
                onChange={(e) => setJdTitle(e.target.value)}
                className="input-premium w-full px-4 py-3 rounded-xl text-sm"
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Job Description (JD)</label>
              <textarea 
                rows="5"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="input-premium w-full px-4 py-3 rounded-xl text-sm resize-none"
                placeholder="Paste the full job description here to generate skill gap analysis..."
              />
            </div>

            <button
              onClick={generateReport}
              disabled={!selectedResume || !jdText.trim() || isProcessing}
              className="w-full btn-premium py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart className="w-5 h-5" />}
              {isProcessing ? 'Generating AI Report...' : 'Generate Comprehensive Report'}
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-emerald-500/10 transition-all"></div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white relative z-10"><FileText className="w-5 h-5 text-emerald-500"/> Report Archive</h2>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 relative z-10">
            {reports.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 dark:bg-[#111827] rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">No reports generated yet.</p>
              </div>
            ) : (
              reports.map(report => (
                <div 
                  key={report.id}
                  onClick={() => loadReport(report.id)}
                  className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 flex items-center justify-between group/item hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Report #{report.id}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(report.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Score</p>
                      <p className="text-sm font-black text-primary">{report.overall_score}/100</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover/item:text-primary transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HiringReportDashboard;
