import DeviceCard from "./DeviceCard";
import DebugAuth from "./DebugAuth";
import ConvexAuthProvider from "./ConvexAuthProvider";

export default function ConnectedDashboard() {
    return (
        <ConvexAuthProvider>
            <DeviceCard />
            <DebugAuth />
        </ConvexAuthProvider>
    );
}
