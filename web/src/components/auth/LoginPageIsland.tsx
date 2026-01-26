import CustomSignIn from "./CustomSignIn";
import { AuthProvider } from "./AuthContext";

export default function LoginPageIsland() {
    return (
        <AuthProvider>
            <div className="flex justify-center items-center w-full">
                <CustomSignIn />
            </div>
        </AuthProvider>
    );
}
