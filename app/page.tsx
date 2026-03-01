'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import CodeEditor from '@/components/code-editor';
import AnalysisCards from '@/components/analysis-cards';
import AnalysisSkeleton from '@/components/analysis-skeleton';

interface Analysis {
  language_detected: string;
  issue: string;
  severity: "low" | "medium" | "high" | "critical";
  bug_type: "syntax" | "runtime" | "logic" | "security" | "performance" | "maintainability";
  root_cause: string;
  minimal_fix: string;
  improved_version: string;
  diff_summary: {
    lines_added: number;
    lines_removed: number;
    lines_modified: number;
    structural_change: "none" | "minor" | "moderate" | "major";
    key_changes: string[];
  };
  risk_assessment: string;
  confidence: number;
  code_diff?: {
    original: string;
    fixed: string;
  };
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export default function Page() {
  const [code, setCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [previousAnalysis, setPreviousAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze code');
      }

      const data = await response.json();

      // Update comparison state
      if (analysis) {
        setPreviousAnalysis(analysis);
      }

      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const EXAMPLES = {
    nullBug: `function getUser(user) {
  console.log(user.profile.name);
}

getUser();`,
    asyncBug: `async function fetchData() {
  const result = fetch('https://api.example.com/data');
  const json = result.json();
  return json;
}`,
    logicBug: `function calculateTotal(items) {
  return items.reduce((total, item) => {
    total + item.price;
  });
}`
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20">
      {/* Subtle Background Accent */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full opacity-30" />
      </div>

      {/* Developer Tool Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-md bg-background/80">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="text-primary font-bold text-base select-none">M</span>
            </div>
            <h1 className="text-xs font-bold tracking-tight text-foreground/80 uppercase">
              Mistral Code Surgeon
            </h1>
          </div>
          <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest pl-4 border-l border-border/20">
            v2.1 Diagnostics
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-10">

          {/* Editor Container */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="text-metadata">
                Source Code Interface
              </label>
              <div className="flex items-center gap-2">
                {Object.entries(EXAMPLES).map(([key, value]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] uppercase tracking-wider font-bold border-border/40 bg-card hover:bg-card-hover hover:border-border transition-all"
                    onClick={() => setCode(value)}
                  >
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-b from-primary/10 to-transparent rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <div className="relative">
                <CodeEditor value={code} onChange={setCode} />
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !code.trim()}
                className={`btn-premium btn-premium-primary min-w-[200px] transition-all duration-300 ${isAnalyzing ? 'opacity-80 scale-[0.98]' : 'hover:scale-[1.02]'
                  }`}
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Analyzing Diagnostic Data...
                  </span>
                ) : (
                  'Perform Deep Analysis'
                )}
              </Button>
            </div>
          </section>

          <div className="h-px bg-border/20 w-full" />

          {/* Results Overview */}
          <section className="space-y-8 fade-in">
            {error && (
              <div className="p-4 bg-accent-high/10 border border-accent-high/20 rounded-xl text-accent-high text-xs flex items-center gap-3 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-high animate-pulse" />
                Diagnostic Error: {error}
              </div>
            )}

            {isAnalyzing ? (
              <AnalysisSkeleton />
            ) : analysis ? (
              <div className="space-y-10">
                <AnalysisCards
                  analysis={analysis}
                  previousAnalysis={previousAnalysis}
                />

                {/* Refined Tool Stats */}
                <div className="border-t border-border/10 pt-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                      Engine: Mistral-Large-Latest
                    </span>
                    {analysis.usage?.total_tokens && (
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-2 py-0.5 bg-secondary/20 rounded border border-border/10">
                        {analysis.usage.total_tokens} tokens
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-muted-foreground/20 font-bold uppercase tracking-[0.3em]">
                    SECURE STATIC ANALYSIS
                  </p>
                </div>
              </div>
            ) : !error && (
              <div className="text-center py-24 bg-card/10 rounded-2xl border border-dashed border-border/20">
                <p className="text-[11px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                  Ready for code ingestion
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Decoration Blur */}
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-primary/2 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}

