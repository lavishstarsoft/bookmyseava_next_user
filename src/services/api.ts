import { CartItem } from "@/contexts/CartContext";

// Types
type FavoritesDB = string[]; // Array of product/pooja IDs
type CartDB = CartItem[];

interface UserDatabase {
    [userId: string]: {
        cart: CartDB;
        favorites: FavoritesDB;
    }
}

// Simulated Network Delay
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 800));

// Internal DB Helper
const getMockDB = (): UserDatabase => {
    const db = localStorage.getItem('mock_backend_db');
    return db ? JSON.parse(db) : {};
};

const saveMockDB = (db: UserDatabase) => {
    localStorage.setItem('mock_backend_db', JSON.stringify(db));
};

// Ensure User Document Exists
const ensureUserDocs = (db: UserDatabase, userId: string) => {
    if (!db[userId]) {
        db[userId] = { cart: [], favorites: [] };
    }
};

/**
 * Syncs local (Guest) data with the User's Database Document upon Login
 */
export const syncUserData = async (userId: string, localCart: CartItem[], localFavorites: string[]) => {
    await simulateNetworkDelay();

    const db = getMockDB();
    ensureUserDocs(db, userId);

    const userDocs = db[userId];

    // Merge Carts: If item exists, sum quantity. If new, push.
    const mergedCart = [...userDocs.cart];
    localCart.forEach(localItem => {
        const existingDBItemIndex = mergedCart.findIndex(dbItem => dbItem.id === localItem.id);
        if (existingDBItemIndex >= 0) {
            mergedCart[existingDBItemIndex].quantity += localItem.quantity;
        } else {
            mergedCart.push(localItem);
        }
    });
    userDocs.cart = mergedCart;

    // Merge Favorites: Set ensures uniqueness
    userDocs.favorites = Array.from(new Set([...userDocs.favorites, ...localFavorites]));

    saveMockDB(db);
    return userDocs;
};

/**
 * Cart API
 */
export const getCart = async (userId: string): Promise<CartItem[]> => {
    await simulateNetworkDelay();
    const db = getMockDB();
    return db[userId]?.cart || [];
};

export const saveCart = async (userId: string, cartItems: CartItem[]): Promise<void> => {
    await simulateNetworkDelay();
    const db = getMockDB();
    ensureUserDocs(db, userId);
    db[userId].cart = cartItems;
    saveMockDB(db);
};

export const clearBackendCart = async (userId: string): Promise<void> => {
    await simulateNetworkDelay();
    const db = getMockDB();
    ensureUserDocs(db, userId);
    db[userId].cart = [];
    saveMockDB(db);
};

/**
 * Favorites API
 */
export const getFavorites = async (userId: string): Promise<string[]> => {
    await simulateNetworkDelay();
    const db = getMockDB();
    return db[userId]?.favorites || [];
};

export const toggleFavoriteInDB = async (userId: string, targetId: string): Promise<string[]> => {
    await simulateNetworkDelay();
    const db = getMockDB();
    ensureUserDocs(db, userId);

    const favorites = db[userId].favorites;
    const isCurrentlyFavorited = favorites.includes(targetId);

    if (isCurrentlyFavorited) {
        db[userId].favorites = favorites.filter(id => id !== targetId);
    } else {
        db[userId].favorites = [...favorites, targetId];
    }

    saveMockDB(db);
    return db[userId].favorites;
};
