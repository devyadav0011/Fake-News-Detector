'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Search, ShieldAlert, ShieldCheck, ShieldQuestion, Loader2, AlertTriangle, CheckCircle2, Info, Activity, Globe, BrainCircuit, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AnalysisResult {
  verdict: 'True' | 'Fake' | 'Misleading' | 'Unverified';
  confidence: number;
  reasoning: string;
  extractedFacts: string[];
  credibilityAnalysis: string;
}

export default function Home() {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  const copyInput = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 2000);
  };

  const copyReport = () => {
    if (!result) return;
    const report = `VeraCT Scan Report\nVerdict: ${result.verdict} (${result.confidence}% Confidence)\n\nReasoning:\n${result.reasoning}\n\nExtracted Facts:\n${result.extractedFacts.map(f => `- ${f}`).join('\n')}\n\nCredibility Analysis:\n${result.credibilityAnalysis}`;
    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              currentTranscript += transcript + ' ';
            }
          }
          if (currentTranscript) {
             setText((prev) => prev + currentTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setText(''); // Clear previous text when starting new recording
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to analyze the text. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case 'true': return 'text-emerald-300 border-emerald-300/30 bg-emerald-300/5';
      case 'fake': return 'text-rose-300 border-rose-300/30 bg-rose-300/5';
      case 'misleading': return 'text-amber-300 border-amber-300/30 bg-amber-300/5';
      default: return 'text-white/50 border-white/10 bg-white/5';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case 'true': return <ShieldCheck className="w-10 h-10 text-emerald-300" strokeWidth={1} />;
      case 'fake': return <ShieldAlert className="w-10 h-10 text-rose-300" strokeWidth={1} />;
      case 'misleading': return <AlertTriangle className="w-10 h-10 text-amber-300" strokeWidth={1} />;
      default: return <ShieldQuestion className="w-10 h-10 text-white/50" strokeWidth={1} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20">
      <div className="max-w-5xl mx-auto px-6 py-16 sm:px-8 lg:px-12">
        
        {/* Header */}
        <header className="text-center mb-20 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center space-y-6"
          >
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
              <Activity className="h-5 w-5 text-white/70" strokeWidth={1.5} />
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight text-white">
              VeraCT Scan
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm uppercase tracking-[0.2em] text-white/50 max-w-2xl mx-auto"
          >
            Combating Fake News in the Digital Age
          </motion.p>
          <div className="w-12 h-[1px] bg-white/20 mx-auto mt-8" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Input Area */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
                <Search className="w-4 h-4 text-white/50" />
                <h2 className="text-xs uppercase tracking-[0.15em] text-white/70">Analyze Content</h2>
              </div>
              
              <div className="relative">
                <Textarea 
                  placeholder="Paste a news article, claim, or use voice input..." 
                  className="min-h-[240px] bg-transparent border border-white/10 rounded-none text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30 resize-y text-lg p-6 font-light leading-relaxed"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                
                {/* Voice Control Button */}
                <div className="absolute bottom-6 right-6 flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyInput}
                    className="rounded-full w-12 h-12 transition-all duration-300 border-white/20 bg-black hover:bg-white/10 text-white/70"
                    title="Copy input text"
                  >
                    {copiedInput ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleListening}
                    className={`rounded-full w-12 h-12 transition-all duration-300 border-white/20 bg-black hover:bg-white/10 ${isListening ? 'border-rose-400 text-rose-400 animate-pulse' : 'text-white/70'}`}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={!text.trim() || isAnalyzing}
                className="w-full h-14 text-sm uppercase tracking-[0.1em] font-medium bg-white text-black hover:bg-white/90 rounded-none transition-all disabled:opacity-50 disabled:bg-white/10 disabled:text-white/50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Truth'
                )}
              </Button>

              {error && (
                <div className="p-4 border border-rose-500/30 bg-rose-500/5 text-rose-300 text-sm flex items-start space-x-3">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>

            {/* How It Works Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-white/10">
              <div className="space-y-3">
                <BrainCircuit className="w-4 h-4 text-white/40" />
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-white/70">Fact Extraction</h3>
                <p className="text-sm text-white/40 font-light leading-relaxed">Isolates key factual claims using advanced language models.</p>
              </div>
              <div className="space-y-3">
                <Globe className="w-4 h-4 text-white/40" />
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-white/70">Intelligent Search</h3>
                <p className="text-sm text-white/40 font-light leading-relaxed">Finds corroborating articles across the web via retrieval-augmented techniques.</p>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyReport} 
                      className="text-[10px] uppercase tracking-[0.15em] border-white/10 bg-transparent hover:bg-white/5 text-white/50 h-8 rounded-none"
                    >
                      {copiedReport ? <Check className="w-3 h-3 mr-2 text-emerald-400" /> : <Copy className="w-3 h-3 mr-2" />}
                      {copiedReport ? 'Copied' : 'Copy Report'}
                    </Button>
                  </div>
                  {/* Verdict Card */}
                  <div className={`p-8 border ${getVerdictColor(result.verdict)} flex flex-col items-center text-center space-y-6`}>
                    {getVerdictIcon(result.verdict)}
                    <div>
                      <h2 className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-2">Final Verdict</h2>
                      <div className="text-4xl font-serif font-light tracking-wide">
                        {result.verdict}
                      </div>
                    </div>
                    
                    <div className="w-full pt-6 border-t border-current/20">
                      <div className="flex justify-between text-[11px] uppercase tracking-[0.1em] mb-3 opacity-80">
                        <span>Confidence</span>
                        <span className="font-mono">{result.confidence}%</span>
                      </div>
                      <div className="h-1 w-full bg-current/10 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-current opacity-80" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="space-y-4">
                    <h3 className="text-[11px] uppercase tracking-[0.15em] text-white/50 flex items-center space-x-2">
                      <Info className="w-3 h-3" />
                      <span>Reasoning</span>
                    </h3>
                    <p className="text-sm text-white/80 font-light leading-relaxed border-l border-white/20 pl-4">
                      {result.reasoning}
                    </p>
                  </div>

                  {/* Extracted Facts */}
                  <div className="space-y-4">
                    <h3 className="text-[11px] uppercase tracking-[0.15em] text-white/50 flex items-center space-x-2">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Extracted Facts</span>
                    </h3>
                    <ul className="space-y-3">
                      {result.extractedFacts.map((fact, idx) => (
                        <li key={idx} className="flex items-start space-x-3 text-sm text-white/80 font-light leading-relaxed">
                          <span className="text-white/30 mt-1 text-[10px]">0{idx + 1}</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Credibility Analysis */}
                  <div className="space-y-4">
                    <h3 className="text-[11px] uppercase tracking-[0.15em] text-white/50 flex items-center space-x-2">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Credibility Analysis</span>
                    </h3>
                    <p className="text-sm text-white/80 font-light leading-relaxed border-l border-white/20 pl-4">
                      {result.credibilityAnalysis}
                    </p>
                  </div>

                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-white/10 bg-white/[0.02]"
                >
                  <ShieldQuestion className="w-8 h-8 text-white/20 mb-6" strokeWidth={1} />
                  <h3 className="text-[11px] uppercase tracking-[0.15em] text-white/50 mb-3">Awaiting Input</h3>
                  <p className="text-sm text-white/30 font-light max-w-[240px] leading-relaxed">
                    Enter text or use voice control to begin the verification process.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <footer className="mt-24 pt-8 border-t border-white/10 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            VeraCT Scan &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}
