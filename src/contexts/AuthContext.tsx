import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

export interface User {
    id: string;
    name: string;
    email: string;
    mobile?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    logout: () => void;

    // Modal & Guard logic
    isAuthModalOpen: boolean;
    openAuthModal: () => void;
    closeAuthModal: () => void;
    requireAuth: (action: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    // Sync state with localStorage
    const syncAuth = useCallback(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        } else {
            setUser(null);
            setToken(null);
        }
    }, []);

    // Initial load
    useEffect(() => {
        syncAuth();

        // Listen for internal auth changes (e.g. from AuthModal)
        const handleAuthChange = () => {
            syncAuth();
        };

        window.addEventListener('auth-change', handleAuthChange);
        return () => window.removeEventListener('auth-change', handleAuthChange);
    }, [syncAuth]);

    // Handle pending action after login
    useEffect(() => {
        if (token && user && pendingAction) {
            // User just logged in and we have a pending action
            pendingAction();
            setPendingAction(null);
        }
    }, [token, user, pendingAction]);

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Sync other tabs/components
        window.dispatchEvent(new Event('auth-change'));

        toast({
            title: "Logged Out",
            description: "You have been logged out successfully.",
        });
    };

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    /**
     * Guards an action. If logged in, runs it immediately.
     * Otherwise, opens login modal and queues the action.
     */
    const requireAuth = (action: () => void) => {
        if (token && user) {
            action();
        } else {
            setPendingAction(() => action);
            openAuthModal();
        }
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated: !!token,
            user,
            token,
            logout,
            isAuthModalOpen,
            openAuthModal,
            closeAuthModal,
            requireAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

