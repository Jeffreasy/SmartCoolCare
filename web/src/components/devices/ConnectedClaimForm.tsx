import ClaimForm from "../devices/ClaimForm";
import DebugAuth from "../DebugAuth";
import ConvexAuthProvider from "../ConvexAuthProvider";

export default function ConnectedClaimForm() {
    return (
        <ConvexAuthProvider>
            <ClaimForm />
            <DebugAuth />
        </ConvexAuthProvider>
    );
}
