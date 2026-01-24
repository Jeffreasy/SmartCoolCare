import { TIME_RANGES } from "./ChartConfig";
import type { TimeRange, ViewMode } from "./ChartConfig";
import { Plug, Radio } from "lucide-react";

interface ChartControlsProps {
    timeRange: TimeRange;
    onTimeRangeChange: (range: TimeRange) => void;
    showCustomPicker: boolean;
    onToggleCustomPicker: () => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    liveMode: boolean;
    onLiveModeToggle: () => void;
    onExportCSV: () => void;
    onExportJSON: () => void;
    onExportPNG: () => void;
    onCustomStartTimeChange: (time: number) => void;
    compact?: boolean;
}

export default function ChartControls({
    timeRange,
    onTimeRangeChange,
    showCustomPicker,
    onToggleCustomPicker,
    viewMode,
    onViewModeChange,
    liveMode,
    onLiveModeToggle,
    onExportCSV,
    onExportJSON,
    onExportPNG,
    onCustomStartTimeChange,
    compact = false
}: ChartControlsProps) {
    if (compact) return null;

    return (
        <div className="flex flex-col gap-3">
            {/* 1. Time Range Selector (Clean Horizontal Scroll) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1 mask-linear-fade">
                {TIME_RANGES.map(range => (
                    <button
                        key={range}
                        onClick={() => onTimeRangeChange(range)}
                        className={`flex-none min-w-[3rem] py-1.5 px-4 rounded-full font-bold text-xs transition-all whitespace-nowrap border ${timeRange === range
                            ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20'
                            : 'bg-transparent border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                            }`}
                    >
                        {range}
                    </button>
                ))}
                <div className="w-px h-6 bg-border mx-1" />
                <button
                    onClick={onToggleCustomPicker}
                    className={`flex-none py-1.5 px-4 rounded-full font-bold text-xs transition-all whitespace-nowrap border ${timeRange === 'CUSTOM'
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-transparent border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        }`}
                >
                    Custom
                </button>
            </div>

            {/* 2. Action Toolbar (Minimalist) */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/50">
                <div className="flex gap-2">
                    {/* View Mode */}
                    <button
                        onClick={() => onViewModeChange(viewMode === 'chart' ? 'table' : 'chart')}
                        className="p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent hover:border-border transition-all"
                        title={viewMode === 'chart' ? 'View Table' : 'View Chart'}
                    >
                        {viewMode === 'chart' ? <Plug className="w-4 h-4 rotate-90" /> : <Plug className="w-4 h-4" />}
                    </button>

                    {/* Live Mode */}
                    <button
                        onClick={onLiveModeToggle}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${liveMode
                            ? 'bg-status-success/10 border-status-success text-status-success shadow-lg shadow-status-success/10'
                            : 'bg-transparent border-border text-muted-foreground hover:border-foreground'
                            }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${liveMode ? 'bg-status-success animate-pulse' : 'bg-muted-foreground'}`} />
                        {liveMode ? 'LIVE' : 'PAUSED'}
                    </button>
                </div>

                {/* Export (Icon only on mobile) */}
                <div className="relative group">
                    <button className="p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent hover:border-border transition-all">
                        <span className="text-xl leading-none">↓</span>
                    </button>
                    {/* Compact Dropdown - Align Right */}
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-popover/95 backdrop-blur-xl border border-border rounded-xl shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-20">
                        <button onClick={onExportCSV} className="w-full px-4 py-2 text-left text-xs font-medium text-foreground hover:bg-accent first:rounded-t-xl hover:text-primary transition-colors">CSV</button>
                        <button onClick={onExportJSON} className="w-full px-4 py-2 text-left text-xs font-medium text-foreground hover:bg-accent hover:text-primary transition-colors">JSON</button>
                        <button onClick={onExportPNG} className="w-full px-4 py-2 text-left text-xs font-medium text-foreground hover:bg-accent last:rounded-b-xl hover:text-primary transition-colors">PNG (Image)</button>
                    </div>
                </div>
            </div>

            {/* Custom Date Picker */}
            {showCustomPicker && (
                <div className="bg-card p-4 rounded-lg border border-border">
                    <label className="text-sm text-muted-foreground mb-2 block">Start Time</label>
                    <input
                        type="datetime-local"
                        onChange={(e) => {
                            onCustomStartTimeChange(new Date(e.target.value).getTime());
                            onTimeRangeChange('CUSTOM');
                        }}
                        className="bg-input border border-border rounded-lg px-4 py-2 text-foreground w-full"
                    />
                </div>
            )}
        </div>
    );
}
