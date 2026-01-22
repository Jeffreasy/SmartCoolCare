import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
    return (
        <div className="flex justify-center items-center w-full">
            <SignIn signUpUrl="/signup" forceRedirectUrl="/dashboard" />
        </div>
    );
}
