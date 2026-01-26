import { useAuth } from "@/components/auth/AuthContext";
import React, { useState } from "react";

export default function DebugAuth() {
    const { isAuthenticated, isLoading, user, token } = useAuth();
    const [showToken, setShowToken] = useState(false);

    return (
        <div className="fixed bottom-2 right-2 z-[9999] glass-panel bg-slate-900/90 p-4 text-xs text-left font-mono pointer-events-auto min-w-[200px]">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="text-slate-400">LaventeCare:</div>
                <div className={isAuthenticated ? "text-success" : isLoading ? "text-warning" : "text-danger"}>
                    {isLoading ? "⏳ Loading..." : isAuthenticated ? "✅ IN" : "❌ OUT"}
                </div>

                <div className="text-slate-400">Token:</div>
                <div className={token ? "text-success" : "text-danger"}>
                    {token ? "✅ Present" : "❌ Missing"}
                </div>

                {user && (
                    <>
                        <div className="text-slate-400">User:</div>
                        <div className="truncate max-w-[150px]">{user.email}</div>
                    </>
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
