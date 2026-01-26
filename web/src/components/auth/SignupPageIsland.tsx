import CustomSignUp from "./CustomSignUp";
import { AuthProvider } from "./AuthContext";

export default function SignupPageIsland() {
    return (
        <AuthProvider>
            <div className="flex justify-center items-center w-full">
                <CustomSignUp />
            </div>
        </AuthProvider>
    );
}
