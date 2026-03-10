import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Check, Trash2, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getImageUrl } from '@/config';
import { Separator } from '@/components/ui/separator';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, setCheckoutItems } = useCart();
    const navigate = useNavigate();

    // Local state to track which items are selected for checkout
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Initialize all items as selected when the component mounts or cart changes
    useEffect(() => {
        const allIds = new Set(cartItems.map(item => item.id));
        setSelectedIds(allIds);
    }, [cartItems]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(cartItems.map(item => item.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectItem = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
    };

    // Calculate subtotal only for selected items
    const selectedItems = cartItems.filter(item => selectedIds.has(item.id));
    const selectedCount = selectedItems.reduce((acc, item) => acc + item.quantity, 0);
    const selectedTotal = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const isAllSelected = cartItems.length > 0 && selectedIds.size === cartItems.length;

    const { isAuthenticated, requireAuth } = useAuth();

    const handleProceedToBuy = () => {
        if (selectedCount === 0) return;

        requireAuth(() => {
            // Store the selected items in the global checkout context
            setCheckoutItems(selectedItems);

            // Navigate to the unified checkout flow
            navigate(`/checkout/secure`);
        });
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] bg-white mt-8 rounded-xl shadow-sm border border-border">
                <div className="w-48 h-48 mb-6 relative">
                    <img
                        src="https://m.media-amazon.com/images/G/31/cart/empty/kettle-desaturated._CB424694257_.svg"
                        alt="Empty Cart"
                        className="w-full h-full object-contain opacity-70"
                    />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 font-heading">Your Book My Seva Cart is empty</h2>
                <Link to="/">
                    <Button className="mt-6 bg-maroon hover:bg-maroon-dark text-white font-bold rounded-xl px-8 py-6 shadow-md transition-all uppercase tracking-wide">
                        Continue Shopping
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* LEFT COLUMN: Cart Items */}
                    <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-end justify-between border-b pb-4 mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">Shopping Cart</h1>
                                <button
                                    onClick={() => handleSelectAll(!isAllSelected)}
                                    className="text-sm font-semibold text-maroon hover:text-maroon-dark hover:underline"
                                >
                                    {isAllSelected ? "Deselect all items" : "Select all items"}
                                </button>
                            </div>
                            <span className="text-gray-500 text-sm font-medium hidden sm:block">Price</span>
                        </div>

                        <div className="space-y-6">
                            {cartItems.map((item, index) => (
                                <div key={item.id}>
                                    <div className="flex gap-4 sm:gap-6 relative group">
                                        {/* Checkbox */}
                                        <div className="pt-8 pl-1">
                                            <Checkbox
                                                checked={selectedIds.has(item.id)}
                                                onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                                                className="w-5 h-5 rounded border-gray-400 data-[state=checked]:bg-maroon data-[state=checked]:border-maroon"
                                            />
                                        </div>

                                        {/* Image */}
                                        <div className="w-28 h-28 sm:w-48 sm:h-48 shrink-0 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden p-2 flex items-center justify-center">
                                            <img
                                                src={getImageUrl(item.image)}
                                                alt={item.title}
                                                className="max-w-full max-h-full object-contain cursor-pointer transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col pt-1">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 hover:text-maroon cursor-pointer line-clamp-2">
                                                        {item.title}
                                                    </h3>
                                                    {item.selectedVersion && (
                                                        <div className="text-sm text-gray-700 font-medium mb-2 border-l-2 border-marigold pl-2">
                                                            <span className="text-gray-500 mr-1">Selection:</span> {item.selectedVersion.desc || item.selectedVersion.title}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center text-sm font-bold text-spiritual-green mb-1">
                                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                                        In stock
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 mb-3 flex items-center gap-1 font-medium">
                                                        <span className="px-1.5 py-0.5 bg-maroon text-white font-bold rounded-sm tracking-wider uppercase">
                                                            Fulfilled
                                                        </span>
                                                        by Book My Seva
                                                    </div>
                                                </div>

                                                {/* Price - Desktop */}
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-xl font-black text-maroon">
                                                        <span className="text-sm font-medium align-top mr-0.5">₹</span>
                                                        {item.price.toLocaleString('en-IN')}<span className="text-sm align-top">.00</span>
                                                    </div>
                                                    <div className="text-xs text-green-700 font-medium mt-1">
                                                        Get 3% back with<br />BMS Coin
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price - Mobile */}
                                            <div className="text-left sm:hidden mb-3">
                                                <div className="text-xl font-black text-maroon">
                                                    <span className="text-sm font-medium align-top mr-0.5">₹</span>
                                                    {item.price.toLocaleString('en-IN')}<span className="text-sm align-top">.00</span>
                                                </div>
                                            </div>

                                            {/* Actions Container */}
                                            <div className="flex flex-wrap items-center gap-4 mt-auto">
                                                {/* Quantity Dropdown Mock */}
                                                <div className="flex items-center border border-marigold/30 rounded-lg shadow-sm bg-white overflow-hidden">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="h-8 w-8 p-0 rounded-none hover:bg-marigold/10 text-gray-600"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <span className="px-3 font-bold text-sm min-w-[32px] text-center bg-gray-50 h-8 flex items-center justify-center border-x border-marigold/30">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="h-8 w-8 p-0 rounded-none hover:bg-marigold/10 text-gray-600 text-lg"
                                                    >
                                                        +
                                                    </Button>
                                                </div>

                                                <Separator orientation="vertical" className="h-4 bg-gray-300 hidden sm:block" />

                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-xs font-bold text-maroon hover:text-maroon-dark hover:underline"
                                                >
                                                    Delete
                                                </button>

                                                <Separator orientation="vertical" className="h-4 bg-gray-300 hidden sm:block" />

                                                <button className="text-xs font-bold text-maroon hover:text-maroon-dark hover:underline">
                                                    Save for later
                                                </button>

                                                <Separator orientation="vertical" className="h-4 bg-gray-300 hidden sm:block" />

                                                <button className="text-xs font-bold text-maroon hover:text-maroon-dark hover:underline hidden sm:block">
                                                    See more like this
                                                </button>

                                                <Separator orientation="vertical" className="h-4 bg-gray-300 hidden sm:block" />

                                                <button className="text-xs font-bold text-maroon hover:text-maroon-dark hover:underline hidden sm:block">
                                                    Share
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {index < cartItems.length - 1 && (
                                        <Separator className="my-6 bg-gray-200" />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <div className="text-right">
                                <span className="text-lg text-gray-700">Subtotal ({selectedCount} items): </span>
                                <span className="text-xl font-black text-maroon">₹{selectedTotal.toLocaleString('en-IN')}.00</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Subtotal Card */}
                    <div className="w-full lg:w-[340px] shrink-0">
                        {/* Summary Card - Sticks to bottom on mobile! */}
                        <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 z-40 bg-white p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.08)] border-t border-marigold/20 lg:static lg:p-6 lg:rounded-2xl lg:shadow-md lg:border lg:border-border lg:mb-4 lg:bg-gradient-to-b lg:from-marigold/5 lg:to-transparent">
                            <div className="hidden lg:flex items-start gap-2 mb-4 text-sm">
                                <CheckCircle2 className="w-5 h-5 text-spiritual-green shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-spiritual-green font-bold">Part of your order qualifies for FREE delivery.</span>
                                    <span className="text-gray-600 ml-1 block mt-1">Select this option at checkout.</span>
                                </div>
                            </div>

                            <div className="mb-4 flex lg:block justify-between items-center">
                                <span className="text-lg lg:text-[19px] text-gray-700">Subtotal ({selectedCount} items): </span>
                                <span className="text-xl lg:text-2xl font-black text-maroon">₹{selectedTotal.toLocaleString('en-IN')}.00</span>
                            </div>

                            <div className="hidden lg:flex items-center gap-2 mb-6">
                                <Checkbox id="gift" className="w-4 h-4 rounded-sm border-gray-400 data-[state=checked]:bg-maroon data-[state=checked]:border-maroon" />
                                <label htmlFor="gift" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    This order contains a gift
                                </label>
                            </div>

                            <Button
                                onClick={handleProceedToBuy}
                                disabled={selectedCount === 0}
                                className="w-full h-14 bg-spiritual-green hover:bg-spiritual-green/90 text-white font-black rounded-xl shadow-[0_8px_20px_rgba(0,189,64,0.25)] hover:shadow-[0_12px_25px_rgba(0,189,64,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wide text-lg"
                            >
                                Proceed to Checkout
                            </Button>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <button className="w-full flex items-center justify-between text-sm text-gray-700 font-medium hover:text-gray-900 group">
                                    EMI Available
                                    <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-800 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Related Items Card (Placeholder) */}
                        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-sm font-bold text-gray-900 mb-1">Products related to items in your cart</h3>
                            <span className="text-xs text-gray-500 mb-4 block">Sponsored ⓘ</span>

                            <div className="flex gap-3">
                                <div className="w-20 h-20 bg-white rounded-lg border border-marigold/30 p-1 shrink-0 flex items-center justify-center shadow-sm">
                                    <img src="/images/poojas/deeparadhana.png" alt="Related" className="max-w-full max-h-full object-contain" />
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <a href="#" className="text-sm text-gray-900 hover:text-maroon font-semibold line-clamp-2 leading-tight">
                                        Premium Brass Diya for Daily Deeparadhana
                                    </a>
                                    <div className="text-xs text-marigold my-1 font-bold">★★★★☆ <span className="text-gray-500 font-normal ml-1">128</span></div>
                                    <div className="text-sm font-black text-maroon">₹499.00</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Extra padding to prevent footer from hiding behind sticky bar on mobile */}
            <div className="h-40 lg:hidden"></div>
        </div>
    );
};

export default Cart;
