import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';

export interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    // Initial load to see if they were logged in before
    useEffect(() => {
        const storedUser = localStorage.getItem('bms_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = () => {
        // Mock a login process. In a real app, this would be an API call
        const mockUser: User = {
            id: 'usr_12345',
            name: 'Sai Sudhakar',
            email: 'sai@example.com'
        };
        setUser(mockUser);
        localStorage.setItem('bms_user', JSON.stringify(mockUser));

        toast({
            title: "Logged In Successfully",
            description: "Welcome back to BookMySeva!",
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('bms_user');

        toast({
            title: "Logged Out",
            description: "You have been logged out successfully.",
        });
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
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
