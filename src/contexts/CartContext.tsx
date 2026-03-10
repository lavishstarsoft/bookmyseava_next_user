import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { getCart, saveCart, syncUserData, clearBackendCart } from '@/services/api';

export type CartItemType = 'pooja' | 'pooja-kit';

export interface CartItem {
    id: string; // The selected option ID or product ID
    productId: string; // The base product slug or ID
    title: string;
    image: string;
    price: number;
    quantity: number;
    type: CartItemType;
    selectedVersion?: {
        id: string;
        title: string;
        desc?: string;
    }; // Specific to Poojas and Kits (like "daily", "monthly")
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, newQuantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
    checkoutItems: CartItem[];
    setCheckoutItems: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, user } = useAuth();
    const queryClient = useQueryClient();

    // ----------------------------------------------------------------------
    // 1. Guest Local State
    // ----------------------------------------------------------------------
    const [localCartItems, setLocalCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);

    // ----------------------------------------------------------------------
    // 2. Authenticated DB State (React Query)
    // ----------------------------------------------------------------------
    const { data: dbCartItems = [], isLoading: isDBCartLoading } = useQuery({
        queryKey: ['cart', user?.id],
        queryFn: () => getCart(user!.id),
        enabled: isAuthenticated && !!user,
    });

    // ----------------------------------------------------------------------
    // 3. Sync Logic (Guest -> Authenticated)
    // ----------------------------------------------------------------------
    useEffect(() => {
        const syncOnLogin = async () => {
            if (isAuthenticated && user) {
                // If there are guest items, sync them to the DB
                if (localCartItems.length > 0) {
                    try {
                        await syncUserData(user.id, localCartItems, []);
                        toast({ title: "Cart Synced", description: "Your guest cart has been merged with your account." });
                        // Clear local storage completely now that DB is source of truth
                        setLocalCartItems([]);
                        localStorage.removeItem('bms_cart');
                        // Invalidate query to pull the newly merged DB state
                        queryClient.invalidateQueries({ queryKey: ['cart', user.id] });
                    } catch (e) {
                        console.error("Failed to sync cart", e);
                    }
                }
            }
        };
        syncOnLogin();
    }, [isAuthenticated, user]);

    // ----------------------------------------------------------------------
    // 4. Persistence for Guest State Only
    // ----------------------------------------------------------------------
    // Load from local storage on mount (only for guest data)
    useEffect(() => {
        try {
            const storedCart = localStorage.getItem('bms_cart');
            if (storedCart) {
                setLocalCartItems(JSON.parse(storedCart));
            }
        } catch (e) {
            console.error('Failed to parse cart from local storage', e);
        }
    }, []);

    // Save to local storage on change (only if NOT logged in)
    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem('bms_cart', JSON.stringify(localCartItems));
        }
    }, [localCartItems, isAuthenticated]);

    // ----------------------------------------------------------------------
    // 5. Active Cart Resolution
    // ----------------------------------------------------------------------
    const activeCartItems = isAuthenticated ? dbCartItems : localCartItems;

    // ----------------------------------------------------------------------
    // 6. Action Mutations 
    // ----------------------------------------------------------------------

    // Optimistic Save Mutation
    const saveCartMutation = useMutation({
        mutationFn: (newCart: CartItem[]) => saveCart(user!.id, newCart),
        onMutate: async (newCart) => {
            await queryClient.cancelQueries({ queryKey: ['cart', user?.id] });
            const previousCart = queryClient.getQueryData(['cart', user?.id]);
            queryClient.setQueryData(['cart', user?.id], newCart);
            return { previousCart };
        },
        onError: (err, newCart, context) => {
            queryClient.setQueryData(['cart', user?.id], context?.previousCart);
            toast({ title: "Error", description: "Failed to save cart. Restoring state.", variant: "destructive" });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
        }
    });

    const clearCartMutation = useMutation({
        mutationFn: () => clearBackendCart(user!.id),
        onSuccess: () => {
            queryClient.setQueryData(['cart', user?.id], []);
            queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
        }
    });

    const addToCart = (item: CartItem) => {
        const currentCart = isAuthenticated ? dbCartItems : localCartItems;
        const existingItemIndex = currentCart.findIndex((i) => i.id === item.id);

        let updatedItems: CartItem[];
        let message = '';

        if (existingItemIndex >= 0) {
            updatedItems = [...currentCart];
            updatedItems[existingItemIndex] = {
                ...updatedItems[existingItemIndex],
                quantity: updatedItems[existingItemIndex].quantity + item.quantity
            };
            message = `Increased quantity of ${item.title} in your cart.`;
        } else {
            updatedItems = [...currentCart, item];
            message = `${item.title} added to your cart.`;
        }

        if (isAuthenticated) {
            saveCartMutation.mutate(updatedItems);
        } else {
            setLocalCartItems(updatedItems);
        }

        toast({
            title: existingItemIndex >= 0 ? "Cart Updated 🛒" : "Added to Cart 🛒",
            description: message,
        });
    };

    const removeFromCart = (itemId: string) => {
        const currentCart = isAuthenticated ? dbCartItems : localCartItems;
        const updatedItems = currentCart.filter((item) => item.id !== itemId);

        if (isAuthenticated) {
            saveCartMutation.mutate(updatedItems);
        } else {
            setLocalCartItems(updatedItems);
        }

        toast({
            title: "Item Removed",
            description: "Item removed from your cart.",
            variant: "destructive"
        });
    };

    const updateQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        const currentCart = isAuthenticated ? dbCartItems : localCartItems;
        const updatedItems = currentCart.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
        );

        if (isAuthenticated) {
            saveCartMutation.mutate(updatedItems);
        } else {
            setLocalCartItems(updatedItems);
        }
    };

    const clearCart = () => {
        if (isAuthenticated) {
            clearCartMutation.mutate();
        } else {
            setLocalCartItems([]);
            localStorage.removeItem('bms_cart');
        }
    };

    const cartTotal = activeCartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const cartCount = activeCartItems.reduce(
        (count, item) => count + item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cartItems: activeCartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                cartCount,
                isCartOpen,
                setIsCartOpen,
                checkoutItems,
                setCheckoutItems
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
