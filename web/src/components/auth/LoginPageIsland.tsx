import CustomSignIn from "./CustomSignIn";
import { AuthIslandWrapper } from "@/components/providers/AuthIslandWrapper";

export default function LoginPageIsland() {
    return (
        <AuthIslandWrapper>
            <div className="flex justify-center items-center w-full">
                <CustomSignIn />
            </div>
        </AuthIslandWrapper>
    );
}
