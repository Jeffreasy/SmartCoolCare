import { useMediaQuery } from "../../../hooks/useMediaQuery";
import DesktopModal from "./DesktopModal";
import MobileDrawer from "./MobileDrawer";
import { useEffect, useState } from "react";

interface ResponsiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: React.ReactNode;
    desktopMaxWidth?: string;
}

export default function ResponsiveModal(props: ResponsiveModalProps) {
    // Default to false (mobile) to prevent hydration errors if mismatch, 
    // but ultimately we want to match user's device.
    // Ideally we use a 'useIsMobile' hook that is hydration safe.
    // The useMediaQuery we built handles client-side only.
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null; // Prevent hydration mismatch

    if (isDesktop) {
        return <DesktopModal {...props} maxWidth={props.desktopMaxWidth} />;
    }

    return <MobileDrawer {...props} />;
}
