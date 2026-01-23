import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
    return (
        <div className="flex justify-center items-center w-full p-4">
            <SignUp signInUrl="/login" forceRedirectUrl="/dashboard" />
        </div>
    );
}
