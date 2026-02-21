import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

    // Load favorites from local storage on initial mount
    useEffect(() => {
        const storedFavorites = localStorage.getItem('bms_favorites');
        if (storedFavorites) {
            try {
                setFavorites(JSON.parse(storedFavorites));
            } catch (error) {
                console.error('Failed to parse favorites from local storage', error);
            }
        }
    }, []);

    // Save favorites to local storage whenever they change
    useEffect(() => {
        localStorage.setItem('bms_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const addFavorite = (item: FavoriteItem) => {
        setFavorites((prev) => {
            if (!prev.find((fav) => fav.id === item.id)) {
                return [...prev, item];
            }
            return prev;
        });
    };

    const removeFavorite = (id: string) => {
        setFavorites((prev) => prev.filter((fav) => fav.id !== id));
    };

    const isFavorite = (id: string) => {
        return favorites.some((fav) => fav.id === id);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
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
