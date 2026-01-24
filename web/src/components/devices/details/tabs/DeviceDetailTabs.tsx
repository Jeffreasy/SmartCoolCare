// import { motion } from "framer-motion"; // Removed to avoid dependency issue

export type TabType = 'overview' | 'history' | 'settings';

interface DeviceDetailTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export default function DeviceDetailTabs({ activeTab, onTabChange }: DeviceDetailTabsProps) {
    return (
        <div className="flex w-full mb-6 shrink-0 z-10">
            <div className="flex w-full bg-secondary/30 backdrop-blur-md p-1 rounded-2xl border border-white/5 relative">
                {(['overview', 'history', 'settings'] as const).map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => onTabChange(tab)}
                            className={`flex-1 relative py-2.5 px-2 rounded-xl text-sm md:text-base font-semibold transition-all cursor-pointer select-none touch-manipulation z-10 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {/* Animated Background for Active Tab */}
                            {isActive && (
                                <span className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20 -z-10 animate-in fade-in zoom-in-95 duration-200" />
                            )}

                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
