'use client';

import { useState } from 'react';
import {
  Check, Copy, AlertTriangle, Zap, Gauge, Terminal,
  ShieldAlert, Activity, ChevronDown, ChevronRight,
  CornerDownRight, Code2, ArrowUpRight, ArrowDownRight,
  Minus
} from 'lucide-react';

interface AnalysisData {
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
}

interface AnalysisCardsProps {
  analysis: AnalysisData;
  previousAnalysis?: AnalysisData | null;
}

export default function AnalysisCards({ analysis, previousAnalysis }: AnalysisCardsProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    issue: true,
    risk: true,
    rootCause: true,
    changes: true,
    fix: true,
    improved: true,
    delta: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const severityMap = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  };

  const getSeverityColors = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return {
          indicator: 'bg-accent-high',
          text: 'text-accent-high',
          bg: 'bg-accent-high/5',
          border: 'border-accent-high/20'
        };
      case 'medium':
        return {
          indicator: 'bg-accent-moderate',
          text: 'text-accent-moderate',
          bg: 'bg-accent-moderate/5',
          border: 'border-accent-moderate/20'
        };
      case 'low':
      default:
        return {
          indicator: 'bg-accent-low',
          text: 'text-accent-low',
          bg: 'bg-accent-low/5',
          border: 'border-accent-low/20'
        };
    }
  };

  const severityColors = getSeverityColors(analysis.severity);

  // Risk Delta calculation
  const renderRiskDelta = () => {
    if (!previousAnalysis) return null;

    const prevSevVal = severityMap[previousAnalysis.severity];
    const currSevVal = severityMap[analysis.severity];
    const sevImproved = currSevVal < prevSevVal;
    const sevWorsened = currSevVal > prevSevVal;

    const confImproved = analysis.confidence > previousAnalysis.confidence;
    const confWorsened = analysis.confidence < previousAnalysis.confidence;

    return (
      <div className="premium-card bg-card/10 border-border/20 overflow-hidden mb-6">
        <div
          className="flex items-center justify-between p-4 cursor-pointer select-none"
          onClick={() => toggleSection('delta')}
        >
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-primary/60" />
            <h3 className="text-label text-foreground/70 tracking-[0.2em]">Risk Delta Analysis</h3>
          </div>
          {expandedSections.delta ? <ChevronDown className="w-4 h-4 text-muted-foreground/30" /> : <ChevronRight className="w-4 h-4 text-muted-foreground/30" />}
        </div>

        {expandedSections.delta && (
          <div className="px-6 pb-5 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Severity Delta */}
              <div className="p-3 bg-secondary/10 rounded-lg border border-border/10 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1.5">Risk Level</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground/40">{previousAnalysis.severity}</span>
                    <ArrowUpRight className="w-3 h-3 text-muted-foreground/20" />
                    <span className={`text-sm font-bold uppercase tracking-tight ${sevImproved ? 'text-accent-success' : sevWorsened ? 'text-accent-high' : 'text-foreground/60'}`}>
                      {analysis.severity}
                    </span>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${sevImproved ? 'bg-accent-success/5 border-accent-success/10 text-accent-success' : sevWorsened ? 'bg-accent-high/5 border-accent-high/10 text-accent-high' : 'bg-border/5 border-border/10 text-muted-foreground/40'}`}>
                  {sevImproved ? <ArrowDownRight className="w-3.5 h-3.5" /> : sevWorsened ? <ArrowUpRight className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                  <span className="text-[10px] font-black uppercase">
                    {sevImproved ? 'Reduced' : sevWorsened ? 'Increased' : 'Stable'}
                  </span>
                </div>
              </div>

              {/* Confidence Delta */}
              <div className="p-3 bg-secondary/10 rounded-lg border border-border/10 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1.5">Confidence Delta</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground/40">{previousAnalysis.confidence}%</span>
                    <ArrowUpRight className="w-3 h-3 text-muted-foreground/20" />
                    <span className={`text-sm font-bold ${confImproved ? 'text-accent-success' : confWorsened ? 'text-accent-high' : 'text-foreground/60'}`}>
                      {analysis.confidence}%
                    </span>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${confImproved ? 'bg-accent-success/5 border-accent-success/10 text-accent-success' : confWorsened ? 'bg-accent-high/5 border-accent-high/10 text-accent-high' : 'bg-border/5 border-border/10 text-muted-foreground/40'}`}>
                  {confImproved ? <ArrowUpRight className="w-3.5 h-3.5" /> : confWorsened ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                  <span className="text-[10px] font-black uppercase">
                    {confImproved ? 'Gained' : confWorsened ? 'Lost' : 'Flat'}
                  </span>
                </div>
              </div>
            </div>

            {/* CI/CD Style Status Label */}
            <div className="flex items-center gap-3 pt-1">
              <div className={`h-1.5 w-1.5 rounded-full ${sevImproved ? 'bg-accent-success shadow-[0_0_8px_rgba(16,185,129,0.5)]' : sevWorsened ? 'bg-accent-high shadow-[0_0_8px_rgba(188,66,66,0.5)]' : 'bg-muted-foreground/30'}`} />
              <p className={`text-[11px] font-bold uppercase tracking-[0.15em] ${sevImproved ? 'text-accent-success/80' : sevWorsened ? 'text-accent-high/80' : 'text-muted-foreground/60'}`}>
                {sevImproved ? 'Production Risk Reduced' : sevWorsened ? 'Security Posture Degraded' : 'Risk Profile Unchanged'}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Technical Metadata Bar */}
      <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-border/20">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-card/40 border border-border/40 rounded-lg">
          <Terminal className="w-3.5 h-3.5 text-primary/70" />
          <span className="text-label lowercase font-mono opacity-80">
            {analysis.language_detected}
          </span>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 ${severityColors.bg} border ${severityColors.border} rounded-lg`}>
          <AlertTriangle className={`w-3.5 h-3.5 ${severityColors.text}`} />
          <span className={`text-label ${severityColors.text}`}>
            {analysis.severity}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-card/40 border border-border/40 rounded-lg">
          <Zap className="w-3.5 h-3.5 text-accent-moderate/70" />
          <span className="text-label opacity-80">
            {analysis.bug_type}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-card/60 border border-border/40 rounded-lg ml-auto animate-micro-pulse">
          <Gauge className="w-3.5 h-3.5 text-accent-success" />
          <span className="text-label text-accent-success">
            {analysis.confidence}% CONFIDENCE
          </span>
        </div>
      </div>

      {/* Risk Delta Section */}
      {renderRiskDelta()}

      {/* Primary Issue Card */}
      <div className="premium-card hover-lift overflow-hidden group">
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${severityColors.indicator}`} />
        <div
          className="flex items-center justify-between p-6 cursor-pointer select-none"
          onClick={() => toggleSection('issue')}
        >
          <div className="flex items-center gap-3">
            <h3 className="text-label text-foreground/80">Primary Diagnostic Finding</h3>
          </div>
          {expandedSections.issue ? <ChevronDown className="w-4 h-4 text-muted-foreground/30" /> : <ChevronRight className="w-4 h-4 text-muted-foreground/30" />}
        </div>
        {expandedSections.issue && (
          <div className="px-6 pb-6 animate-in fade-in duration-200">
            <p className="text-[15px] text-muted-foreground leading-relaxed font-medium">
              {analysis.issue}
            </p>
          </div>
        )}
      </div>

      {/* Risk Assessment Section */}
      <div className="premium-card hover-lift overflow-hidden border-accent-high/10 bg-accent-high/[0.02]">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-high/40" />
        <div
          className="flex items-center justify-between p-6 cursor-pointer select-none"
          onClick={() => toggleSection('risk')}
        >
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-4 h-4 text-accent-high/70" />
            <h3 className="text-label text-foreground/80">Production Risk Analysis</h3>
          </div>
          {expandedSections.risk ? <ChevronDown className="w-4 h-4 text-muted-foreground/30" /> : <ChevronRight className="w-4 h-4 text-muted-foreground/30" />}
        </div>
        {expandedSections.risk && (
          <div className="px-6 pb-6 animate-in fade-in duration-200">
            <p className="text-[14px] text-accent-high/80 leading-relaxed italic font-medium">
              "{analysis.risk_assessment}"
            </p>
          </div>
        )}
      </div>

      {/* Root Cause Analysis */}
      <div className="premium-card hover-lift overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-moderate/40" />
        <div
          className="flex items-center justify-between p-6 cursor-pointer select-none"
          onClick={() => toggleSection('rootCause')}
        >
          <div className="flex items-center gap-3">
            <CornerDownRight className="w-4 h-4 text-accent-moderate/70" />
            <h3 className="text-label text-foreground/80">Technical Root Cause</h3>
          </div>
          {expandedSections.rootCause ? <ChevronDown className="w-4 h-4 text-muted-foreground/30" /> : <ChevronRight className="w-4 h-4 text-muted-foreground/30" />}
        </div>
        {expandedSections.rootCause && (
          <div className="px-6 pb-6 animate-in fade-in duration-200">
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              {analysis.root_cause}
            </p>
          </div>
        )}
      </div>

      {/* Structural Changes */}
      <div className="premium-card hover-lift overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40" />
        <div
          className="flex items-center justify-between p-6 cursor-pointer select-none"
          onClick={() => toggleSection('changes')}
        >
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-primary/70" />
            <h3 className="text-label text-foreground/80">Structural Impact</h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-bold text-primary/50 uppercase tracking-widest px-2 py-0.5 bg-primary/5 rounded border border-primary/10">
              {analysis.diff_summary.structural_change} modification
            </span>
            {expandedSections.changes ? <ChevronDown className="w-4 h-4 text-muted-foreground/30" /> : <ChevronRight className="w-4 h-4 text-muted-foreground/30" />}
          </div>
        </div>
        {expandedSections.changes && (
          <div className="px-6 pb-6 space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-success/5 border border-accent-success/10 rounded-lg">
                <span className="text-accent-success font-bold text-xs">+{analysis.diff_summary.lines_added}</span>
                <span className="text-[9px] font-bold text-accent-success/40 uppercase">Add</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-lg">
                <span className="text-primary font-bold text-xs">~{analysis.diff_summary.lines_modified}</span>
                <span className="text-[9px] font-bold text-primary/40 uppercase">Mod</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-high/5 border border-accent-high/10 rounded-lg">
                <span className="text-accent-high font-bold text-xs">-{analysis.diff_summary.lines_removed}</span>
                <span className="text-[9px] font-bold text-accent-high/40 uppercase">Rem</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Key Structural Adjustments</p>
              <ul className="space-y-3">
                {analysis.diff_summary.key_changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-4 group/item">
                    <div className="mt-1.5 w-1 h-1 rounded-full bg-border group-hover/item:bg-primary transition-colors" />
                    <span className="text-[13px] text-muted-foreground leading-snug group-hover/item:text-foreground/80 transition-colors">
                      {change}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Minimal Fix */}
      <div className="premium-card hover-lift overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-success/40" />
        <div
          className="flex items-center justify-between p-6 cursor-pointer select-none"
          onClick={() => toggleSection('fix')}
        >
          <div className="flex items-center gap-3">
            <Code2 className="w-4 h-4 text-accent-success/70" />
            <h3 className="text-label text-foreground/80">Targeted Minimal Repair</h3>
          </div>
          {expandedSections.fix ? <ChevronDown className="w-4 h-4 text-muted-foreground/30" /> : <ChevronRight className="w-4 h-4 text-muted-foreground/30" />}
        </div>
        {expandedSections.fix && (
          <div className="px-6 pb-6 animate-in fade-in duration-200">
            <pre className="bg-[#0c0d10] rounded-xl border border-border/40 p-5 overflow-x-auto text-[12px] leading-relaxed font-mono text-foreground/80">
              <code>{analysis.minimal_fix}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Improved Version */}
      <div className="premium-card hover-lift overflow-hidden border-primary/20">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
        <div
          className="flex items-center justify-between p-6 cursor-pointer select-none"
          onClick={() => toggleSection('improved')}
        >
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <h3 className="text-label text-foreground transition-colors group-hover:text-primary">Production Improved Code</h3>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(analysis.improved_version);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground bg-border/20 hover:bg-border/40 transition-all border border-border/40"
            >
              {isCopied ? <Check className="w-3 h-3 text-accent-success" /> : <Copy className="w-3 h-3" />}
              {isCopied ? 'Copy Source' : 'Copy Source'}
            </button>
            {expandedSections.improved ? <ChevronDown className="w-4 h-4 text-muted-foreground/30" /> : <ChevronRight className="w-4 h-4 text-muted-foreground/30" />}
          </div>
        </div>
        {expandedSections.improved && (
          <div className="px-6 pb-6 animate-in fade-in duration-200">
            <pre className="bg-[#0c0d10] rounded-xl border border-border/60 p-6 overflow-x-auto text-[12px] leading-relaxed font-mono text-foreground shadow-inner">
              <code className="block">
                {analysis.improved_version}
              </code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
