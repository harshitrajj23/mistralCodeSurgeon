'use client';

export default function AnalysisSkeleton() {
    return (
        <div className="space-y-6 animate-shimmer scale-[1.005] opacity-50">
            {/* Skeleton Header */}
            <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-border/20">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-24 bg-card/40 border border-border/40 rounded-lg" />
                ))}
            </div>

            {/* Main Issue Skeleton */}
            <div className="premium-card h-32 relative overflow-hidden bg-card/40">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-border/20" />
                <div className="p-6 space-y-3">
                    <div className="h-3 w-1/4 bg-border/20 rounded" />
                    <div className="h-4 w-full bg-border/10 rounded" />
                    <div className="h-4 w-2/3 bg-border/10 rounded" />
                </div>
            </div>

            {/* Severity Cards Skeleton */}
            <div className="premium-card h-28 relative overflow-hidden bg-accent-high/[0.01] border-accent-high/5">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-high/10" />
                <div className="p-6 space-y-4">
                    <div className="h-4 w-1/4 bg-accent-high/10 rounded" />
                    <div className="h-3 w-3/4 bg-accent-high/5 rounded italic" />
                </div>
            </div>

            {/* Structural Stats Skeleton */}
            <div className="premium-card h-40 relative overflow-hidden bg-card/40">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20" />
                <div className="p-6 space-y-6">
                    <div className="h-3 w-1/5 bg-border/20 rounded" />
                    <div className="flex gap-4">
                        <div className="h-7 w-16 bg-accent-success/5 rounded border border-accent-success/10" />
                        <div className="h-7 w-16 bg-primary/5 rounded border border-primary/10" />
                        <div className="h-7 w-16 bg-accent-high/5 rounded border border-accent-high/10" />
                    </div>
                </div>
            </div>

            {/* Code Blocks Skeleton */}
            {[1, 2].map((i) => (
                <div key={i} className="premium-card h-48 bg-card/20 relative overflow-hidden border-border/20">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${i === 1 ? 'bg-accent-success/20' : 'bg-primary/20'}`} />
                    <div className="p-6 flex flex-col gap-4">
                        <div className="h-3 w-1/4 bg-border/20 rounded" />
                        <div className="flex-1 bg-border/5 rounded-xl border border-border/20" />
                    </div>
                </div>
            ))}
        </div>
    );
}
