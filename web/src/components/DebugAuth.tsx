import { useConvexAuth } from "convex/react";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import React from "react";

export default function DebugAuth() {
    const { isLoading: convexLoading, isAuthenticated: convexAuth } = useConvexAuth();
    const { isLoaded: clerkLoaded, isSignedIn: clerkSignedIn, userId } = useClerkAuth();
    const { user } = useUser();

    const { getToken } = useClerkAuth();
    const [tokenStatus, setTokenStatus] = React.useState<string>("Checking...");

    React.useEffect(() => {
        async function checkToken() {
            if (!clerkSignedIn) {
                setTokenStatus("No User");
                return;
            }
            try {
                const token = await getToken({ template: "convex" });
                if (token) {
                    setTokenStatus("✅ Minted");
                } else {
                    setTokenStatus("❌ Empty (Check Clerk Template!)");
                }
            } catch (e) {
                console.error(e);
                setTokenStatus("❌ Error (Check Console)");
            }
        }
        checkToken();
    }, [clerkSignedIn, getToken]);

    return (
        <div className="fixed bottom-2 right-2 z-[9999] bg-slate-900/90 text-white p-4 rounded text-xs opacity-90 text-left backdrop-blur-sm border border-slate-700 shadow-lg font-mono pointer-events-auto">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="text-slate-400">Convex:</div>
                <div className={convexAuth ? "text-success" : "text-danger"}>
                    {convexLoading ? "..." : convexAuth ? "✅ IN" : "❌ OUT"}
                </div>

                <div className="text-slate-400">Clerk:</div>
                <div className={clerkSignedIn ? "text-success" : "text-danger"}>
                    {!clerkLoaded ? "..." : clerkSignedIn ? "✅ IN" : "❌ OUT"}
                </div>

                <div className="text-slate-400">Token:</div>
                <div className={tokenStatus.startsWith("✅") ? "text-success" : "text-danger"}>
                    {tokenStatus}
                </div>

                {userId && (
                    <>
                        <div className="text-slate-400">User:</div>
                        <div className="truncate max-w-[150px]">{user?.primaryEmailAddress?.emailAddress}</div>
                    </>
                )}
            </div>
        </div>
    );
}
