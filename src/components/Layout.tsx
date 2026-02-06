import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";
import LiveStreamCard from "@/components/LiveStreamCard";
import ChatbotWidget from "@/components/ChatbotWidget";
import { useLiveCardState } from "@/hooks/useLiveCardState";
import { useLocation } from "react-router-dom";

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const [isLiveCardDismissed, setIsLiveCardDismissed] = useLiveCardState();
    const location = useLocation();

    // Hide header on 404 page potentially? Or specific pages?
    // consistently show for now as requested.

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Global Header */}
            <Header
                isLiveCardDismissed={isLiveCardDismissed}
                onLiveButtonClick={() => setIsLiveCardDismissed(false)}
            />

            {/* Main Content */}
            <div className="flex-1">
                {children}
            </div>

            {/* Global Footer */}
            <Footer />

            {/* Floating Elements - Consistently present */}
            <LiveStreamCard
                isDismissed={isLiveCardDismissed}
                onDismissedChange={setIsLiveCardDismissed}
            />
            <ChatbotWidget />

            {/* Bottom Navigation (Mobile Only) */}
            <BottomNavigation />

            {/* Safe Area Padding for Mobile */}
            <div className="h-16 md:hidden" />
        </div>
    );
};

export default Layout;
