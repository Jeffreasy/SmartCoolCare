import CustomSignUp from "./CustomSignUp";
import ConvexAuthProvider from "../ConvexAuthProvider";

export default function SignupPageIsland() {
    return (
        <ConvexAuthProvider>
            <div className="flex justify-center items-center w-full">
                <CustomSignUp />
            </div>
        </ConvexAuthProvider>
    );
}
