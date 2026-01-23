import { SignUp } from "@clerk/clerk-react";
import ConvexAuthProvider from "../ConvexAuthProvider";
import { clerkDeepGlassTheme } from "../../lib/clerkTheme";

export default function SignupPageIsland() {
    return (
        <ConvexAuthProvider>
            <div className="flex justify-center items-center w-full p-4">
                <SignUp
                    signInUrl="/login"
                    forceRedirectUrl="/dashboard"
                    appearance={clerkDeepGlassTheme}
                />
            </div>
        </ConvexAuthProvider>
    );
}
