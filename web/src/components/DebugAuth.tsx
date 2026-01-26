import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useCustomAuth } from "@/hooks/useCustomAuth";
import React, { useState } from "react";
import { api } from "../../convex/_generated/api";

export default function DebugAuth() {
    const { isLoading: convexLoading, isAuthenticated: convexAuth } = useConvexAuth();
    const { isAuthenticated, isLoading, user, token } = useCustomAuth();
    const convexUser = useQuery(api.users.getCurrentUser);
    const [isRepairing, setIsRepairing] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const createAdmin = useMutation(api.admin.createAdminUser);

    const handleRepair = async () => {
        if (!token) return;
        setIsRepairing(true);
        try {
            // 1. Decode token to get UUID
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.sub; // This is the UUID!

            // 2. Create proper identifier
            const identifier = `https://laventecareauthsystems.onrender.com|${userId}`;

            console.log("Repairing user with identifier:", identifier);

            await createAdmin({
                email: payload.email || user?.email || "unknown@email.com",
                name: payload.full_name || user?.fullName || "User",
                tokenIdentifier: identifier
            });

            alert(`✅ User repaired!\nUUID: ${userId}\nIdentifier: ${identifier}\n\nReloading page in 3s...`);
            setTimeout(() => window.location.reload(), 3000);
        } catch (e) {
            alert(`❌ Repair failed: ${e}`);
        } finally {
            setIsRepairing(false);
        }
    };

    return (
        <div className="fixed bottom-2 right-2 z-[9999] glass-panel bg-slate-900/90 p-4 text-xs text-left font-mono pointer-events-auto min-w-[200px]">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="text-slate-400">Convex:</div>
                <div className={convexAuth ? "text-success" : convexLoading ? "text-warning" : "text-danger"}>
                    {convexLoading ? "⏳ Loading..." : convexAuth ? "✅ IN" : "❌ OUT"}
                </div>

                <div className="text-slate-400">LaventeCare:</div>
                <div className={isAuthenticated ? "text-success" : isLoading ? "text-warning" : "text-danger"}>
                    {isLoading ? "⏳ Loading..." : isAuthenticated ? "✅ IN" : "❌ OUT"}
                </div>

                <div className="text-slate-400">Token:</div>
                <div className={token ? "text-success" : "text-danger"}>
                    {token ? "✅ Present" : "❌ Missing"}
                </div>

                <div className="text-slate-400">Convex User:</div>
                <div className={convexUser ? "text-success" : "text-warning"}>
                    {convexUser ? "✅ Synced" : "⚠️ Not Synced"}
                </div>

                {user && (
                    <>
                        <div className="text-slate-400">User:</div>
                        <div className="truncate max-w-[150px]">{user.email}</div>
                    </>
                )}

                {/* Repair Button - Only show if authenticated but not synced in Convex */}
                {isAuthenticated && !convexUser && !convexLoading && (
                    <div className="col-span-2 mt-2 pt-2 border-t border-slate-700">
                        <button
                            onClick={handleRepair}
                            disabled={isRepairing}
                            className="w-full px-2 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/50 rounded flex items-center justify-center gap-2 transition-all"
                        >
                            {isRepairing ? (
                                <span>🛠️ Fixing...</span>
                            ) : (
                                <>
                                    <span>🔧 Fix User Identity</span>
                                    <span className="animate-pulse">⚠️</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {token && (
                    <div className="col-span-2 mt-2 pt-2 border-t border-slate-700">
                        <button
                            onClick={() => setShowToken(!showToken)}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            {showToken ? "🔒 Hide" : "🔓 Show"} Token
                        </button>
                        {showToken && (
                            <div className="mt-2 p-2 bg-black/30 rounded text-[9px] break-all max-w-[300px]">
                                {token}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
