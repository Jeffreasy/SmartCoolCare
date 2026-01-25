import CustomSignIn from "./CustomSignIn";
import ConvexAuthProvider from "../ConvexAuthProvider";

export default function LoginPageIsland() {
    return (
        <ConvexAuthProvider>
            <div className="flex justify-center items-center w-full">
                <CustomSignIn />
            </div>
        </ConvexAuthProvider>
    );
}
