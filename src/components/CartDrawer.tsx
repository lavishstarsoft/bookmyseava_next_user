import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, X, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { getImageUrl } from '@/config';

const CartDrawer = () => {
    const {
        cartItems,
        isCartOpen,
        setIsCartOpen,
        updateQuantity,
        removeFromCart,
        cartTotal,
    } = useCart();
    const navigate = useNavigate();

    const handleProceed = () => {
        setIsCartOpen(false);
        navigate('/cart');
    };

    return (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l border-marigold/20 bg-card/95 backdrop-blur-xl">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-marigold/10 bg-gradient-to-b from-marigold/5 to-transparent">
                    <SheetHeader className="flex flex-row items-center justify-between space-y-0">
                        <SheetTitle className="flex items-center gap-2 font-teluguHeading text-2xl font-bold text-marigold-dark">
                            <ShoppingCart className="w-6 h-6 text-marigold" />
                            Your Cart
                            {cartItems.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-maroon text-white text-xs font-bold">
                                    {cartItems.length}
                                </span>
                            )}
                        </SheetTitle>
                    </SheetHeader>
                </div>

                {/* Content */}
                {cartItems.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                        <div className="w-24 h-24 mb-6 rounded-full bg-marigold/10 flex items-center justify-center">
                            <ShoppingCart className="w-12 h-12 text-marigold/40" />
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</p>
                        <p className="text-sm">Looks like you haven't added anything yet.</p>
                        <Button
                            className="mt-6 bg-maroon hover:bg-maroon-dark text-white rounded-full px-8"
                            onClick={() => setIsCartOpen(false)}
                        >
                            Continue Browsing
                        </Button>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        {/* Image */}
                                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-marigold/20 bg-white relative">
                                            <img
                                                src={getImageUrl(item.image)}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            {item.type === 'pooja-kit' && (
                                                <div className="absolute top-0 left-0 right-0 bg-marigold text-maroon-dark text-[8px] font-bold text-center py-0.5 uppercase tracking-wider">
                                                    Kit
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-snug mb-1">
                                                    {item.title}
                                                </h4>
                                                {item.selectedVersion && (
                                                    <div className="text-xs text-muted-foreground font-medium mb-1">
                                                        {item.selectedVersion.title}
                                                    </div>
                                                )}
                                                <div className="font-bold text-maroon text-sm">₹{item.price}</div>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-3 bg-gray-100 rounded-full px-2 py-1 shadow-inner">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-sm font-bold min-w-[20px] text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-50 shadow-sm transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>

                                                {/* Remove */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Footer */}
                        <div className="p-6 bg-gray-50 border-t border-marigold/20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-600 font-medium">Subtotal</span>
                                <span className="text-2xl font-black text-maroon-dark">₹{cartTotal}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-6 text-center">
                                Taxes and shipping calculated at checkout
                            </p>
                            <Button
                                className="w-full h-14 bg-spiritual-green hover:bg-spiritual-green/90 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg uppercase tracking-wide group"
                                onClick={handleProceed}
                            >
                                Proceed to Checkout
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default CartDrawer;
