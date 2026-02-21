import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useFavorites, FavoriteItem } from '@/contexts/FavoritesContext';
import { toast } from '@/hooks/use-toast';

interface FavoriteButtonProps {
    item: FavoriteItem;
    className?: string;
    iconSize?: number;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ item, className = "", iconSize = 20 }) => {
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const [isAnimating, setIsAnimating] = useState(false);
    const favorited = isFavorite(item.id);

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (favorited) {
            removeFavorite(item.id);
            toast({
                title: "Removed from Favorites",
                description: `${item.title} removed from your favorites list.`,
            });
        } else {
            addFavorite(item);
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 300); // Reset animation state
            toast({
                title: "Added to Favorites \u2764\ufe0f",
                description: `${item.title} added to your favorites list.`,
            });
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            className={`relative p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
            <Heart
                size={iconSize}
                className={`transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${favorited ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'
                    } ${isAnimating ? 'scale-125' : 'scale-100'}`}
            />
        </button>
    );
};
