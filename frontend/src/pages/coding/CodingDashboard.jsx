import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Editor from '@monaco-editor/react';
import { Code2, Play, CheckCircle, AlertCircle, FileText, X, Loader2, Sparkles, Target } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const LANGUAGE_MAP = {
  javascript: "javascript",
  python: "python",
  java: "java",
  cpp: "cpp",
  csharp: "csharp",
  go: "go",
  rust: "rust"
};

function CodingDashboard() {
  const [resumes, setResumes] = useState([]);
  const [activeRound, setActiveRound] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [startingResumeId, setStartingResumeId] = useState(null);
  const [code, setCode] = useState("// Write your code here...");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState(null);
  const [review, setReview] = useState(null);
  const [showReview, setShowReview] = useState(false);


  async function fetchData() {
    try {
      const resRes = await api.get('/resume/history');
      setResumes(resRes.data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  }

  async function startRound(resumeId) {
    setStartingResumeId(resumeId);
    try {
      const res = await api.post('/coding/start', {
        resume_id: resumeId,
        target_role: "Software Engineer",
        difficulty: "medium"
      });
      setActiveRound(res.data);
      
      const defaultCode = {
        python: `import sys
import ast

def solve(input_data):
    # input_data is a string containing the test case input.
    # Write your solution here:
    
    pass

if __name__ == "__main__":
    # Read the raw input string from standard input
    input_data = sys.stdin.read().strip()
    if input_data:
        result = solve(input_data)
        if result is not None:
            print(result)
`,
        javascript: `const fs = require('fs');

function solve(inputData) {
    // inputData is a string containing the test case input.
    // Write your solution here:
    
}

try {
    // Read the raw input string from standard input
    const inputData = fs.readFileSync('/dev/stdin', 'utf-8').trim();
    if (inputData) {
        const result = solve(inputData);
        if (result !== undefined) console.log(result);
    }
} catch (e) {}
`,
        java: `import java.util.Scanner;

public class main {
    public static void solve(String inputData) {
        // inputData is a string containing the test case input.
        // Write your solution here and print the result:
        
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextLine()) {
            String inputData = scanner.nextLine();
            solve(inputData);
        }
        scanner.close();
    }
}`
      };
      setCode(defaultCode[language] || "// Write your code here...\n\n");
      setOutput(null);
      setReview(null);
    } catch (err) {
      console.error(err);
    } finally {
      setStartingResumeId(null);
    }
  }

  async function runCode() {
    if (!activeRound || activeRound.questions.length === 0) return;
    
    setIsProcessing(true);
    setOutput(null);
    setReview(null);
    setShowReview(false);
    try {
      const questionId = activeRound.questions[0].id;
      const res = await api.post(`/coding/question/${questionId}/run`, {
        language: LANGUAGE_MAP[language] || "python",
        code: code
      });
      
      setOutput({
        status: res.data.status,
        passed_cases: res.data.passed_cases,
        total_cases: res.data.total_cases,
        time: res.data.execution_time_ms
      });
    } catch (err) {
      console.error(err);
      setOutput({ status: "error", error: "Execution failed or timed out." });
    } finally {
      setIsProcessing(false);
    }
  }

  async function submitCode() {
    if (!activeRound || activeRound.questions.length === 0) return;
    
    setIsProcessing(true);
    setOutput(null);
    try {
      const questionId = activeRound.questions[0].id;
      const res = await api.post(`/coding/question/${questionId}/submit`, {
        language: LANGUAGE_MAP[language] || "python",
        code: code
      });
      
      setOutput({
        status: res.data.status,
        passed_cases: res.data.passed_cases,
        total_cases: res.data.total_cases,
        time: res.data.execution_time_ms
      });
      
      if (res.data.review) {
        setReview(res.data.review);
        setShowReview(true);
      }
    } catch (err) {
      console.error(err);
      setOutput({ status: "error", error: "Execution failed or timed out." });
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Initializing IDE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      
      {!activeRound ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto w-full space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-transparent p-8 rounded-3xl border border-gray-200 dark:border-white/5 relative overflow-hidden">
            <div className="absolute left-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Code2 className="w-3 h-3" /> Algorithmic Round
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">AI Coding Environment</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 max-w-xl">Solve real-world algorithms dynamically generated based on your resume and target role. Live AI evaluation.</p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-8 relative overflow-hidden group max-w-3xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white relative z-10"><Play className="w-5 h-5 text-emerald-500"/> Start New Challenge</h2>
            
            <div className="space-y-4 relative z-10">
              {resumes.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                  <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium mb-4">Please upload and analyze a resume first.</p>
                </div>
              ) : (
                resumes.map(resume => (
                  <div key={resume.id} className="p-5 rounded-2xl bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors flex items-center justify-between group/item">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{resume.filename}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Target className="w-3 h-3" /> Target: Software Engineer</p>
                      </div>
                    </div>
                    <button
                      onClick={() => startRound(resume.id)}
                      disabled={startingResumeId !== null}
                      className="btn-premium px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
                    >
                      {startingResumeId === resume.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />} Start
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex gap-6 min-h-0">
          
          {/* Left Panel - Question & Test Cases */}
          <div className="w-1/3 flex flex-col gap-6 min-w-[350px]">
            <div className="flex-1 glass-card rounded-3xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-[#0A0D14]/80 flex flex-col relative shadow-2xl">
              <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-black/20 backdrop-blur-md z-10">
                <h3 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  <Code2 className="w-5 h-5 text-primary" /> Problem Description
                </h3>
                <button onClick={() => setActiveRound(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md text-gray-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{activeRound.questions[0].title}</h2>
                  <div className="flex gap-2 mb-6">
                    <span className="px-2.5 py-1 rounded bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-wider">{activeRound.questions[0].difficulty}</span>
                    <span className="px-2.5 py-1 rounded bg-gray-100 dark:bg-white/5 text-gray-500 text-xs font-bold uppercase tracking-wider">Algorithm</span>
                  </div>
                  
                  <div className="prose prose-sm dark:prose-invert text-gray-700 dark:text-gray-300">
                    <ReactMarkdown>{activeRound.questions[0].problem_statement}</ReactMarkdown>
                  </div>
                </div>

                {activeRound.questions[0].visible_test_cases && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Example Test Cases</h4>
                    {activeRound.questions[0].visible_test_cases.slice(0, 2).map((tc, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-[#1A1D24] rounded-xl p-4 border border-gray-200 dark:border-white/5 font-mono text-xs">
                        <div className="mb-2"><span className="text-gray-400">Input:</span> <span className="text-gray-900 dark:text-white">{tc.input}</span></div>
                        <div><span className="text-gray-400">Output:</span> <span className="text-emerald-500">{tc.expected}</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - IDE & Output */}
          <div className="flex-1 flex flex-col gap-6">
            
            <div className="flex-1 glass-card rounded-3xl overflow-hidden border border-gray-200 dark:border-white/5 bg-[#1E1E1E] flex flex-col shadow-2xl relative">
              
              <div className="p-3 border-b border-[#2D2D2D] flex items-center justify-between bg-[#1E1E1E] z-10">
                <div className="flex gap-2">
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-[#2D2D2D] border-none text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-3">
                  <button onClick={() => runCode()} disabled={isProcessing} className="px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                    <Play className="w-4 h-4" /> Run
                  </button>
                  <button onClick={() => submitCode()} disabled={isProcessing} className="btn-premium px-5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />} Submit Code
                  </button>
                </div>
              </div>

              <div className="flex-1 relative">
                <Editor
                  height="100%"
                  language={LANGUAGE_MAP[language]}
                  theme="vs-dark"
                  value={code}
                  onChange={(val) => setCode(val)}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                    formatOnPaste: true,
                  }}
                />
              </div>
            </div>

            {/* Output Panel */}
            <AnimatePresence>
              {(output || isProcessing || review) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: '240px' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card rounded-3xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-[#0A0D14]/80 flex flex-col shadow-2xl"
                >
                  <div className="p-3 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-black/20">
                    <div className="flex gap-4">
                      <button onClick={() => setShowReview(false)} className={`text-sm font-bold px-3 py-1 rounded-lg transition-colors ${!showReview ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Execution</button>
                      {review && <button onClick={() => setShowReview(true)} className={`text-sm font-bold px-3 py-1 rounded-lg transition-colors flex items-center gap-2 ${showReview ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                        <Sparkles className="w-3.5 h-3.5" /> AI Review
                      </button>}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar font-mono text-sm">
                    {isProcessing && !output ? (
                      <div className="flex items-center gap-3 text-gray-500 h-full justify-center">
                        <Loader2 className="w-5 h-5 animate-spin" /> Evaluating submission on remote cluster...
                      </div>
                    ) : !showReview && output ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {output.status === 'passed' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : output.status === 'error' ? <AlertCircle className="w-5 h-5 text-red-500" /> : <AlertCircle className="w-5 h-5 text-orange-500" />}
                          <span className={`font-bold ${output.status === 'passed' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {output.status === 'passed' ? 'Accepted' : output.status === 'error' ? 'Execution Error' : 'Wrong Answer'}
                          </span>
                        </div>
                        {output.status !== 'error' && (
                          <div className="flex gap-8 text-gray-500 text-xs">
                            <p>Test Cases: <span className="font-bold text-gray-900 dark:text-white">{output.passed_cases} / {output.total_cases}</span> passed</p>
                            <p>Time: <span className="font-bold text-gray-900 dark:text-white">{output.time}ms</span></p>
                          </div>
                        )}
                        {output.error && (
                          <div className="bg-red-500/10 text-red-500 p-3 rounded-xl whitespace-pre-wrap">{output.error}</div>
                        )}
                      </div>
                    ) : showReview && review ? (
                      <div className="prose prose-sm dark:prose-invert font-sans text-gray-700 dark:text-gray-300 max-w-none bg-primary/5 p-4 rounded-xl border border-primary/20 relative">
                        <div className="absolute top-0 right-0 p-4">
                          <span className="text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded-lg">Score: {review.score}/100</span>
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">Correctness</h4>
                        <p className="text-sm mb-4">{review.correctness}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-white dark:bg-[#111827] p-3 rounded-lg border border-gray-200 dark:border-white/5">
                            <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Time</span>
                            <span className="text-sm font-mono text-primary">{review.time_complexity}</span>
                          </div>
                          <div className="bg-white dark:bg-[#111827] p-3 rounded-lg border border-gray-200 dark:border-white/5">
                            <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Space</span>
                            <span className="text-sm font-mono text-primary">{review.space_complexity}</span>
                          </div>
                        </div>

                        <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm mt-4">Code Quality</h4>
                        <p className="text-sm mb-4">{review.code_quality}</p>

                        {review.optimization_suggestions?.length > 0 && (
                          <>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">Suggestions</h4>
                            <ul className="list-disc pl-4 text-sm space-y-1">
                              {review.optimization_suggestions.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </>
                        )}
                        {review.alternative_solution && review.alternative_solution !== "N/A" && (
                          <>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm mt-4">Alternative Approach</h4>
                            <p className="text-sm">{review.alternative_solution}</p>
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CodingDashboard;
