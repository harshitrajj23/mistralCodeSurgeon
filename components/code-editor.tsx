'use client';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({ value, onChange }: CodeEditorProps) {
  return (
    <div className="relative group border border-border rounded-lg overflow-hidden bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border/80 hover:bg-card/80">
      {/* Editor wrapper */}
      <div className="relative">
        {/* Line numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-secondary/30 border-r border-border flex flex-col items-center pt-4 select-none transition-colors duration-300 group-hover:bg-secondary/50">
          {value.split('\n').map((_, i) => (
            <div
              key={i}
              className="h-6 flex items-center justify-center text-xs text-muted-foreground font-mono transition-colors duration-300 group-hover:text-foreground/70"
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-16 pr-4 py-4 bg-transparent text-foreground font-mono text-sm leading-6 resize-none focus:outline-none border-0 placeholder-muted-foreground transition-colors duration-300 group-hover:placeholder-foreground/40"
          rows={12}
          placeholder="// Paste your code here..."
          spellCheck="false"
        />
      </div>

      {/* Shadow effect with smooth transition */}
      <div className="absolute inset-0 rounded-lg pointer-events-none shadow-lg shadow-black/20 transition-shadow duration-300 group-hover:shadow-lg group-hover:shadow-black/40" />
    </div>
  );
}
