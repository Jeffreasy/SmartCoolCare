import { SignIn } from "@clerk/clerk-react";
import ConvexAuthProvider from "../ConvexAuthProvider";
import { clerkDeepGlassTheme } from "../../lib/clerkTheme";

export default function LoginPageIsland() {
    return (
        <ConvexAuthProvider>
            <div className="flex justify-center items-center w-full">
                <SignIn
                    // No public signup link
                    forceRedirectUrl="/dashboard"
                    appearance={clerkDeepGlassTheme}
                />
            </div>
        </ConvexAuthProvider>
    );
}
