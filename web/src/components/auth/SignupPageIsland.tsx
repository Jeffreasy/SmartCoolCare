import CustomSignUp from "./CustomSignUp";
import { AuthIslandWrapper } from "@/components/providers/AuthIslandWrapper";

export default function SignupPageIsland() {
    return (
        <AuthIslandWrapper>
            <div className="flex justify-center items-center w-full">
                <CustomSignUp />
            </div>
        </AuthIslandWrapper>
    );
}
