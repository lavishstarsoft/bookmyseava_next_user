import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { getFavorites, toggleFavoriteInDB } from '@/services/api';

export interface FavoriteItem {
    id: string;
    type: 'pooja' | 'kit';
    title: string;
    image: string;
    price: number;
    rating?: number;
    reviewCount?: number;
}

interface FavoritesContextType {
    favorites: FavoriteItem[];
    addFavorite: (item: FavoriteItem) => void;
    removeFavorite: (id: string) => void;
    isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const queryClient = useQueryClient();

    // ----------------------------------------------------------------------
    // 1. Guest Local State (Stores full objects so we can render them in UI)
    // ----------------------------------------------------------------------
    const [localFavorites, setLocalFavorites] = useState<FavoriteItem[]>([]);

    // ----------------------------------------------------------------------
    // 2. Authenticated DB State (Stores only IDs for simplicity in this mock)
    // ----------------------------------------------------------------------
    const { data: dbFavoriteIds = [], isLoading: isDBFavoritesLoading } = useQuery({
        queryKey: ['favorites', user?.id],
        queryFn: () => getFavorites(user!.id),
        enabled: isAuthenticated && !!user,
    });

    // ----------------------------------------------------------------------
    // 3. Persistence for Guest State Only
    // ----------------------------------------------------------------------
    useEffect(() => {
        const storedFavorites = localStorage.getItem('bms_favorites');
        if (storedFavorites) {
            try {
                setLocalFavorites(JSON.parse(storedFavorites));
            } catch (error) {
                console.error('Failed to parse favorites from local storage', error);
            }
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem('bms_favorites', JSON.stringify(localFavorites));
        }
    }, [localFavorites, isAuthenticated]);


    // ----------------------------------------------------------------------
    // 4. Active Favorites Resolution (Bridging the full object array with the DB array of IDs)
    // NOTE: In a real app, getting the DB favorites would return full objects or we would fetch them.
    // For this mock, we assume the UI provides the full object first when toggling, so we keep a local memory
    // of the objects even if they come from the DB ID list.
    // ----------------------------------------------------------------------

    // We maintain a master dictionary of all previously seen favorite items globally in memory
    // so we can reconstruct the full UI objects when the DB only returns IDs.
    const [favoriteObjectMemory, setFavoriteObjectMemory] = useState<Record<string, FavoriteItem>>({});

    useEffect(() => {
        // Collect local objects into memory
        const mem = { ...favoriteObjectMemory };
        localFavorites.forEach(fav => mem[fav.id] = fav);
        setFavoriteObjectMemory(mem);
    }, [localFavorites]);

    // Active full objects to provide to UI
    const activeFavorites = isAuthenticated
        ? dbFavoriteIds.map(id => favoriteObjectMemory[id]).filter(Boolean) as FavoriteItem[]
        : localFavorites;


    // ----------------------------------------------------------------------
    // 5. Action Mutations (Optimistic UI)
    // ----------------------------------------------------------------------

    const toggleFavoriteMutation = useMutation({
        mutationFn: (targetId: string) => toggleFavoriteInDB(user!.id, targetId),
        onMutate: async (targetId: string) => {
            await queryClient.cancelQueries({ queryKey: ['favorites', user?.id] });
            const previousFavorites = queryClient.getQueryData<string[]>(['favorites', user?.id]) || [];

            // Optimistically update the list of strings
            let newFavorites;
            if (previousFavorites.includes(targetId)) {
                newFavorites = previousFavorites.filter(id => id !== targetId);
            } else {
                newFavorites = [...previousFavorites, targetId];
            }

            queryClient.setQueryData<string[]>(['favorites', user?.id], newFavorites);
            return { previousFavorites };
        },
        onError: (err, targetId, context) => {
            // Revert back if network fails
            queryClient.setQueryData(['favorites', user?.id], context?.previousFavorites);
            toast({ title: "Error", description: "Failed to sync favorite status.", variant: "destructive" });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
        }
    });

    const addFavorite = (item: FavoriteItem) => {
        // Save to Dictionary
        setFavoriteObjectMemory(prev => ({ ...prev, [item.id]: item }));

        if (isAuthenticated) {
            // Since our toggle method adds if missing and removes if present, verify it's missing first
            if (!dbFavoriteIds.includes(item.id)) {
                toggleFavoriteMutation.mutate(item.id);
            }
        } else {
            setLocalFavorites((prev) => {
                if (!prev.find((fav) => fav.id === item.id)) {
                    return [...prev, item];
                }
                return prev;
            });
        }
    };

    const removeFavorite = (id: string) => {
        if (isAuthenticated) {
            if (dbFavoriteIds.includes(id)) {
                toggleFavoriteMutation.mutate(id);
            }
        } else {
            setLocalFavorites((prev) => prev.filter((fav) => fav.id !== id));
        }
    };

    const isFavorite = (id: string) => {
        if (isAuthenticated) {
            return dbFavoriteIds.includes(id);
        }
        return localFavorites.some((fav) => fav.id === id);
    };

    return (
        <FavoritesContext.Provider value={{ favorites: activeFavorites, addFavorite, removeFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
