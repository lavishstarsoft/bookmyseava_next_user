import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Star, ShieldCheck, CheckCircle2, Package, ShoppingCart, ChevronRight, MapPin, CreditCard, Check, Sparkles, Heart, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FavoriteButton } from "@/components/FavoriteButton";

// Mock Kit Data
const KITS_DATA: Record<string, {
    name: string; image: string; images: string[]; description: string; longDescription: string;
    rating: number; reviewCount: number;
    pricing: { weekly: number; monthly: number; quarterly: number; yearly: number };
    items: string[];
}> = {
    "ganapati-pooja-kit": {
        name: "Ganapati Pooja Kit",
        image: "/images/poojas/ganapathi_homam.png",
        images: ["/images/poojas/ganapathi_homam.png", "/images/poojas/abhishekam.png", "/images/poojas/deeparadhana.png"],
        description: "Complete kit with all items for Ganesh worship and homam.",
        longDescription: "This premium Ganapati Pooja Kit contains everything you need for a complete and authentic Ganesh worship at home. Each item is carefully selected according to Vedic traditions and sourced from trusted suppliers. The kit ensures you have the freshest flowers, purest ingredients, and all necessary accessories for a devotionally satisfying experience.",
        rating: 4.9, reviewCount: 238,
        pricing: { weekly: 299, monthly: 899, quarterly: 2399, yearly: 7999 },
        items: [
            "Modak mould (reusable)",
            "Durva grass (fresh bunch)",
            "Red hibiscus flowers",
            "Coconut (whole)",
            "Kumkum & Turmeric (haldi)",
            "Agarbatti (premium sandalwood)",
            "Camphor tablets",
            "Ghee (pure cow, 50ml)",
            "Cotton wicks (pack of 20)",
            "Betel leaves & nuts",
            "Banana (offering)",
            "Jaggery (gud)",
            "Sacred thread (moli)",
            "Decorated pooja thali",
        ]
    },
    "shiva-abhishekam-kit": {
        name: "Abhishekam Kit",
        image: "/images/poojas/abhishekam.png",
        images: ["/images/poojas/abhishekam.png", "/images/poojas/ganapathi_homam.png", "/images/poojas/deeparadhana.png", "/images/poojas/deeparadhana.png"],
        description: "Complete Abhishekam materials for Lord Shiva worship.",
        longDescription: "A comprehensive Abhishekam Kit that includes all the sacred offerings for performing Shiva Abhishekam. From Panchamritam ingredients (milk, curd, honey, ghee, sugar) to bilva leaves and vibhuti, this kit has been curated by experienced pandits to ensure an authentic and fulfilling worship experience.",
        rating: 4.8, reviewCount: 186,
        pricing: { weekly: 349, monthly: 999, quarterly: 2699, yearly: 8999 },
        items: [
            "Fresh milk (500ml)",
            "Curd (200ml)",
            "Honey (100ml, pure)",
            "Ghee (pure cow, 100ml)",
            "Sugar (200g)",
            "Bilva leaves (fresh)",
            "Vibhuti (sacred ash)",
            "Sandalwood paste",
            "Rose water (100ml)",
            "Rudraksha mala",
            "Agarbatti & camphor",
            "Cotton wicks",
            "Sacred thread",
            "Coconut",
        ]
    },
    "daily-pooja-kit": {
        name: "Daily Pooja Kit",
        image: "/images/poojas/deeparadhana.png",
        images: ["/images/poojas/deeparadhana.png", "/images/poojas/ganapathi_homam.png", "/images/poojas/abhishekam.png"],
        description: "Essentials for daily home worship and deeparadhana.",
        longDescription: "The perfect daily worship companion! This kit provides all the essentials you need for your everyday pooja routine. Designed for convenience and authenticity, it includes fresh flowers, premium agarbatti, pure camphor, and all traditional items to make your daily worship complete and spiritually fulfilling.",
        rating: 4.7, reviewCount: 412,
        pricing: { weekly: 199, monthly: 599, quarterly: 1599, yearly: 4999 },
        items: [
            "Fresh flowers (mixed)",
            "Agarbatti (premium, 20 sticks)",
            "Camphor tablets (10 pcs)",
            "Cotton wicks (pack of 30)",
            "Kumkum (50g)",
            "Turmeric powder (50g)",
            "Sandalwood powder (25g)",
            "Coconut oil (100ml)",
            "Ghee (50ml)",
            "Betel leaves (10 pcs)",
            "Banana (2 pcs)",
            "Match box",
        ]
    },
};

// Default fallback for kits not in the map
const DEFAULT_KIT = {
    name: "Pooja Kit",
    image: "/images/poojas/deeparadhana.png",
    images: ["/images/poojas/deeparadhana.png", "/images/poojas/ganapathi_homam.png", "/images/poojas/abhishekam.png"],
    description: "Complete pooja kit with all essential items.",
    longDescription: "A comprehensive pooja kit curated with care, containing all the essential items you need for an authentic and devotionally satisfying worship experience at home.",
    rating: 4.7, reviewCount: 100,
    pricing: { weekly: 299, monthly: 899, quarterly: 2399, yearly: 7999 },
    items: ["Agarbatti", "Camphor", "Cotton wicks", "Kumkum", "Turmeric", "Flowers", "Coconut", "Ghee", "Betel leaves"]
};

type SubscriptionPlan = 'one_time' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

const SUBSCRIPTION_OPTIONS: { id: SubscriptionPlan; label: string; desc: string; badge?: string }[] = [
    { id: 'one_time', label: 'One-Time Purchase', desc: 'Single delivery, no commitment' },
    { id: 'weekly', label: 'Weekly Subscription', desc: 'Fresh items delivered every week' },
    { id: 'monthly', label: 'Monthly Subscription', desc: 'Best for regular home worship', badge: 'Popular' },
    { id: 'quarterly', label: 'Quarterly Subscription', desc: 'Save 10% on 3-month plan', badge: 'Save 10%' },
    { id: 'yearly', label: 'Annual Subscription', desc: 'Best value — save 25%', badge: 'Best Value' },
];

const MOCK_ADDRESSES = [
    { id: 1, name: "Home", address: "Flat 302, Sri Lakshmi Residency, Kukatpally, Hyderabad - 500072", isDefault: true },
    { id: 2, name: "Office", address: "Tech Park, Floor 5, HITEC City, Hyderabad - 500081", isDefault: false },
];

const MOCK_REVIEWS = [
    { id: 1, user: "Srinivas Rao", rating: 5, date: "12 Oct 2023", text: "Very authentic and fresh items. The pandit curated selection perfectly matched our needs. Saved a lot of time searching for individual items in the market." },
    { id: 2, user: "Lakshmi K", rating: 4, date: "28 Sep 2023", text: "Good quality products. The packaging was neat and delivery was on time. The monthly subscription is very helpful." },
    { id: 3, user: "Rahul Reddy", rating: 5, date: "15 Sep 2023", text: "Excellent service! We opted for the yearly plan and the items are consistently good every month. Highly recommended." },
];

const PoojaKitDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const kit = KITS_DATA[slug || ''] || DEFAULT_KIT;

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('monthly');
    const [selectedAddress, setSelectedAddress] = useState(1);
    const [activeImage, setActiveImage] = useState(0);

    // Mobile Accordion State
    // true = expanded. By default all are closed on mobile (false). We'll handle this in the render logic.
    const [expandedSections, setExpandedSections] = useState({
        about: false,
        items: false,
        savings: false,
        reviews: false
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        // On mount, if it's a large screen, expand all by default
        if (window.innerWidth >= 1024) {
            setExpandedSections({ about: true, items: true, savings: true, reviews: true });
        }
    }, []);

    const getPrice = () => {
        if (selectedPlan === 'one_time') return kit.pricing.monthly;
        return kit.pricing[selectedPlan];
    };

    const getPlanLabel = () => {
        const opt = SUBSCRIPTION_OPTIONS.find(o => o.id === selectedPlan);
        return opt?.label || '';
    };

    // Removed STEPS array as we are moving to a single-view layout

    // Removed handleNext and handleBack

    const handlePlaceOrder = () => {
        navigate(`/checkout/kit/${slug}`, {
            state: {
                title: kit.name,
                image: kit.images[0] || kit.image,
                price: getPrice(),
                planLabel: getPlanLabel()
            }
        });
    };

    const renderAccordions = () => (
        <>
            {/* About Kit Section */}
            <div className="bg-white rounded-2xl border border-border shadow-sm mb-4 overflow-hidden">
                <button
                    onClick={() => toggleSection('about')}
                    className="w-full flex items-center justify-between p-6 bg-white hover:bg-muted/30 transition-colors"
                >
                    <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
                        <Package className="w-5 h-5 text-maroon" /> About This Kit
                    </h2>
                    <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform duration-200 lg:hidden ${expandedSections.about ? 'rotate-90' : ''}`} />
                </button>

                {expandedSections.about && (
                    <div className="px-6 pb-6 pt-0 border-t border-border/50 lg:border-t-0 lg:pt-0">
                        <p className="text-gray-600 leading-relaxed text-sm mb-6 mt-4 lg:mt-0">{kit.longDescription}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-marigold/5 rounded-xl p-4 border border-marigold/20 text-center">
                                <div className="text-2xl mb-1">🪔</div>
                                <div className="text-xs font-bold text-gray-900">Premium Quality</div>
                            </div>
                            <div className="bg-spiritual-green/5 rounded-xl p-4 border border-spiritual-green/20 text-center">
                                <div className="text-2xl mb-1">📦</div>
                                <div className="text-xs font-bold text-gray-900">Doorstep Delivery</div>
                            </div>
                            <div className="bg-maroon/5 rounded-xl p-4 border border-maroon/20 text-center">
                                <div className="text-2xl mb-1">👨‍🦳</div>
                                <div className="text-xs font-bold text-gray-900">Pandit Curated</div>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 text-center">
                                <div className="text-2xl mb-1">🔄</div>
                                <div className="text-xs font-bold text-gray-900">Easy Cancel</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Items Included Section */}
            <div className="bg-white rounded-2xl border border-border shadow-sm mb-4 overflow-hidden">
                <button
                    onClick={() => toggleSection('items')}
                    className="w-full flex items-center justify-between p-6 bg-white hover:bg-muted/30 transition-colors"
                >
                    <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-spiritual-green" /> Items Included ({kit.items.length})
                    </h2>
                    <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform duration-200 lg:hidden ${expandedSections.items ? 'rotate-90' : ''}`} />
                </button>

                {expandedSections.items && (
                    <div className="px-6 pb-6 pt-0 border-t border-border/50 lg:border-t-0 lg:pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 lg:mt-0">
                            {kit.items.map((item, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                                    <div className="w-6 h-6 mt-0.5 rounded-full bg-spiritual-green/10 flex items-center justify-center shrink-0">
                                        <Check className="w-3.5 h-3.5 text-spiritual-green" />
                                    </div>
                                    <span className="text-sm text-gray-700 font-medium leading-tight">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Savings Table Upsell */}
            <div className="bg-white rounded-2xl border border-border shadow-sm mb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-marigold/10 rounded-bl-full -z-0 pointer-events-none" />
                <button
                    onClick={() => toggleSection('savings')}
                    className="w-full flex items-center justify-between p-6 bg-transparent hover:bg-muted/10 transition-colors relative z-10"
                >
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-marigold fill-marigold" /> Unlock Bigger Savings
                    </h3>
                    <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform duration-200 lg:hidden ${expandedSections.savings ? 'rotate-90' : ''}`} />
                </button>

                {expandedSections.savings && (
                    <div className="px-6 pb-6 pt-0 border-t border-border/50 lg:border-t-0 lg:pt-0 relative z-10">
                        <div className="overflow-hidden rounded-xl border border-border bg-white mt-4 lg:mt-0">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/30 text-[10px] text-muted-foreground uppercase tracking-wider">
                                    <tr>
                                        <th className="p-3 font-extrabold border-b border-border text-gray-600">Plan</th>
                                        <th className="p-3 font-extrabold border-b border-border text-gray-600 whitespace-nowrap">Price</th>
                                        <th className="p-3 font-extrabold border-b border-border text-right text-gray-600">Savings*</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    <tr className="hover:bg-muted/10 transition-colors">
                                        <td className="p-3 font-semibold text-gray-800">Weekly</td>
                                        <td className="p-3 font-medium">₹{kit.pricing.weekly}<span className="text-[10px] text-muted-foreground">/wk</span></td>
                                        <td className="p-3 text-right text-muted-foreground font-medium">-</td>
                                    </tr>
                                    <tr className="hover:bg-muted/10 transition-colors">
                                        <td className="p-3 font-semibold text-gray-800">Monthly</td>
                                        <td className="p-3 font-medium">₹{kit.pricing.monthly}<span className="text-[10px] text-muted-foreground">/mo</span></td>
                                        <td className="p-3 text-right font-black text-spiritual-green">
                                            {Math.round((1 - (kit.pricing.monthly / (kit.pricing.weekly * 4))) * 100)}% Off
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-muted/10 transition-colors">
                                        <td className="p-3 font-semibold text-gray-800">Quarterly</td>
                                        <td className="p-3 font-medium">₹{kit.pricing.quarterly}<span className="text-[10px] text-muted-foreground">/qtr</span></td>
                                        <td className="p-3 text-right font-black text-spiritual-green">
                                            {Math.round((1 - (kit.pricing.quarterly / (kit.pricing.weekly * 12))) * 100)}% Off
                                        </td>
                                    </tr>
                                    <tr className="bg-gradient-to-r from-marigold/10 to-marigold/5 hover:from-marigold/20 hover:to-marigold/10 transition-colors border-l-4 border-l-marigold">
                                        <td className="p-3 font-black text-maroon-dark">
                                            Yearly
                                            <span className="block mt-0.5 text-[8px] bg-maroon text-white px-1.5 py-0.5 rounded uppercase tracking-widest w-fit">Best Value</span>
                                        </td>
                                        <td className="p-3 font-black text-maroon-dark">₹{kit.pricing.yearly}<span className="text-[10px] text-maroon/70">/yr</span></td>
                                        <td className="p-3 text-right font-black text-green-700 text-base">
                                            {Math.round((1 - (kit.pricing.yearly / (kit.pricing.weekly * 52))) * 100)}% Off
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-3 text-center uppercase tracking-wide font-medium">* Savings calculated vs standard weekly plan</p>
                    </div>
                )}
            </div>

            {/* Customer Reviews Section */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mb-6 lg:mb-0">
                <button
                    onClick={() => toggleSection('reviews')}
                    className="w-full flex items-center justify-between p-6 bg-white hover:bg-muted/30 transition-colors"
                >
                    <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
                        <Star className="w-5 h-5 text-marigold fill-marigold" /> Customer Reviews
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-maroon-dark hidden md:block">{kit.rating} out of 5 ({kit.reviewCount} Reviews)</div>
                        <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform duration-200 lg:hidden ${expandedSections.reviews ? 'rotate-90' : ''}`} />
                    </div>
                </button>

                {expandedSections.reviews && (
                    <div className="px-6 pb-6 pt-0 border-t border-border/50 lg:border-t-0 lg:pt-0">
                        <div className="text-sm font-semibold text-maroon-dark mb-4 block md:hidden mt-4">{kit.rating} out of 5 ({kit.reviewCount} Reviews)</div>
                        <div className="space-y-4 lg:mt-0 mt-4">
                            {MOCK_REVIEWS.map(review => (
                                <div key={review.id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-gray-600 text-xs">
                                                {review.user.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 leading-none">{review.user}</div>
                                                <div className="text-[10px] text-muted-foreground mt-0.5">{review.date}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-marigold fill-marigold' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4 text-maroon border-maroon/20 hover:bg-maroon/5 font-semibold">
                            View All Reviews
                        </Button>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-muted/20 pb-20 font-body">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-border shadow-sm mb-6 sticky top-[80px] md:top-[108px] z-30">
                <div className="container px-2 md:px-8 py-3 flex items-center text-sm font-medium text-muted-foreground">
                    <button onClick={() => navigate('/pooja-kits')} className="hover:text-maroon-dark flex items-center transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" /> All Kits
                    </button>
                    <ChevronRight className="w-4 h-4 mx-2 text-border" />
                    <span className="text-maroon-dark font-semibold truncate">{kit.name}</span>
                </div>
            </div>

            <div className="container px-2 md:px-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* LEFT: Image + Info */}
                    <div className="w-full lg:w-[40%]">
                        <div className="sticky top-40">
                            {/* Kit Image Gallery */}
                            <div className="mb-4">
                                {/* Desktop View: Vertical thumbnails + main image */}
                                <div className="hidden lg:flex gap-3">
                                    <div className="flex flex-col gap-2 shrink-0">
                                        {kit.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onMouseEnter={() => setActiveImage(idx)}
                                                onClick={() => setActiveImage(idx)}
                                                className={`w-[58px] h-[58px] rounded-md overflow-hidden border-2 transition-all duration-200 bg-white p-1 ${activeImage === idx ? 'border-maroon-dark shadow-sm' : 'border-border/60 hover:border-maroon-dark opacity-75 hover:opacity-100'}`}
                                            >
                                                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative flex-1">
                                        <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-border flex items-center justify-center">
                                            <img
                                                src={kit.images[activeImage]}
                                                alt={kit.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <button className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full text-muted-foreground hover:text-blue-600 shadow-sm border border-border/40 transition-colors z-10">
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                        <div className="absolute top-3 right-14 z-10">
                                            <FavoriteButton
                                                item={{
                                                    id: slug || 'kit',
                                                    type: 'kit',
                                                    title: kit.name,
                                                    image: kit.images[0],
                                                    price: kit.pricing.yearly,
                                                    rating: kit.rating,
                                                    reviewCount: kit.reviewCount
                                                }}
                                                className="bg-white/90 hover:bg-white shadow-sm border border-border/40"
                                                iconSize={20}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile View: Full-width image + dots */}
                                <div className="lg:hidden bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
                                    <div
                                        className="relative w-full aspect-square bg-white border-b border-border/50"
                                        onTouchStart={(e) => {
                                            const touch = e.touches[0];
                                            (e.currentTarget as any)._touchStartX = touch.clientX;
                                        }}
                                        onTouchEnd={(e) => {
                                            const startX = (e.currentTarget as any)._touchStartX;
                                            const endX = e.changedTouches[0].clientX;
                                            const diff = startX - endX;
                                            if (Math.abs(diff) > 50) {
                                                if (diff > 0 && activeImage < kit.images.length - 1) {
                                                    setActiveImage(prev => prev + 1);
                                                } else if (diff < 0 && activeImage > 0) {
                                                    setActiveImage(prev => prev - 1);
                                                }
                                            }
                                        }}
                                    >
                                        <img
                                            src={kit.images[activeImage]}
                                            alt={kit.name}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3 bg-muted/10">
                                        <div className="flex-1" />
                                        <div className="flex items-center gap-2">
                                            {kit.images.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setActiveImage(idx)}
                                                    className={`rounded-full transition-all duration-300 ${activeImage === idx ? 'w-2.5 h-2.5 bg-maroon-dark' : 'w-2 h-2 bg-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex-1 flex items-center justify-end gap-3">
                                            <FavoriteButton
                                                item={{
                                                    id: slug || 'kit',
                                                    type: 'kit',
                                                    title: kit.name,
                                                    image: kit.images[0],
                                                    price: kit.pricing.yearly,
                                                    rating: kit.rating,
                                                    reviewCount: kit.reviewCount
                                                }}
                                                iconSize={20}
                                            />
                                            <button className="text-gray-500 hover:text-blue-600 transition-colors">
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Render Accordions on Desktop ONLY */}
                            <div className="hidden lg:block">
                                {renderAccordions()}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Buy Box & Subscription Upsell */}
                    <div className="w-full lg:w-[60%]">
                        <div className="sticky top-40">
                            {/* Product Header Card */}
                            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm mb-6 lg:mb-6">
                                <h1 className="text-3xl font-heading font-black text-gray-900 mb-3">{kit.name}</h1>

                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    <div className="flex items-center gap-1.5 text-sm bg-muted/50 px-3 py-1 rounded-full border border-border/50">
                                        <Star className="w-4 h-4 text-marigold fill-marigold" />
                                        <span className="font-bold text-gray-900">{kit.rating}</span>
                                        <span className="text-muted-foreground text-xs">({kit.reviewCount} reviews)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-green-700 font-bold bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                        <ShieldCheck className="w-4 h-4" /> Verified Quality
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                        <Package className="w-4 h-4" /> Free Delivery
                                    </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium">{kit.description}</p>
                            </div>

                            {/* Subscription Selection Box */}
                            <div className="bg-white rounded-2xl p-6 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
                                <h2 className="text-xl font-heading font-bold text-gray-900 mb-1 flex items-center gap-2">
                                    Choose Your Plan
                                </h2>
                                <p className="text-sm text-gray-500 mb-5">Subscribe & save up to 49% with longer plans.</p>

                                <div className="space-y-3 mb-6">
                                    {SUBSCRIPTION_OPTIONS.map(option => {
                                        const isSelected = selectedPlan === option.id;
                                        const currentPrice = option.id === 'one_time' ? kit.pricing.monthly : kit.pricing[option.id];

                                        // Calculate savings vs weekly base
                                        let savingsPercent = 0;
                                        if (option.id === 'monthly') savingsPercent = Math.round((1 - (currentPrice / (kit.pricing.weekly * 4))) * 100);
                                        if (option.id === 'quarterly') savingsPercent = Math.round((1 - (currentPrice / (kit.pricing.weekly * 12))) * 100);
                                        if (option.id === 'yearly') savingsPercent = Math.round((1 - (currentPrice / (kit.pricing.weekly * 52))) * 100);

                                        return (
                                            <label
                                                key={option.id}
                                                className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden ${isSelected
                                                    ? 'border-maroon bg-maroon/5 shadow-md'
                                                    : 'border-border hover:border-maroon/30 hover:bg-muted/20 hover:shadow-sm'
                                                    }`}
                                                onClick={() => setSelectedPlan(option.id)}
                                            >
                                                {/* Best Value Highlight Background */}
                                                {option.id === 'yearly' && isSelected && (
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-marigold/10 rounded-bl-full -z-0 pointer-events-none" />
                                                )}

                                                <div className="flex items-start gap-4 relative z-10 w-full">
                                                    <div className={`w-6 h-6 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-maroon bg-maroon' : 'border-gray-300'
                                                        }`}>
                                                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center flex-wrap gap-2 mb-1">
                                                            <span className={`font-bold text-base ${isSelected ? 'text-maroon-dark' : 'text-gray-900'}`}>
                                                                {option.label}
                                                            </span>
                                                            {option.badge && (
                                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${option.id === 'yearly'
                                                                    ? 'bg-marigold text-maroon-dark animate-pulse shadow-sm'
                                                                    : 'bg-marigold/20 text-maroon-dark'
                                                                    }`}>
                                                                    {option.badge}
                                                                </span>
                                                            )}
                                                            {savingsPercent > 0 && (
                                                                <span className="text-[10px] font-black bg-spiritual-green/10 text-spiritual-green px-2 py-0.5 rounded uppercase tracking-wider">
                                                                    Save {savingsPercent}%
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={`text-sm tracking-wide ${isSelected ? 'text-maroon/80 font-medium' : 'text-muted-foreground'}`}>
                                                            {option.desc}
                                                        </span>
                                                    </div>

                                                    <div className="text-right shrink-0">
                                                        <div className={`text-xl font-black ${isSelected ? 'text-maroon-dark' : 'text-gray-900'}`}>
                                                            ₹{currentPrice}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                                                            {option.id === 'one_time' ? 'total' : `/${option.id}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>

                                <Separator className="my-6" />

                                {/* Total & Buy Action */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Total Price</div>
                                        <div className="text-4xl font-black text-maroon-dark">₹{getPrice()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-spiritual-green flex items-center justify-end gap-1">
                                            <Package className="w-4 h-4" /> Free Shipping
                                        </div>
                                        <div className="text-xs text-muted-foreground font-medium">Delivery in 2-3 days</div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePlaceOrder}
                                    className="w-full h-14 bg-spiritual-green hover:bg-spiritual-green/90 text-white font-black rounded-xl shadow-[0_8px_20px_rgba(0,189,64,0.25)] hover:shadow-[0_12px_25px_rgba(0,189,64,0.35)] transition-all duration-300 text-lg uppercase tracking-wide group"
                                >
                                    Proceed to Checkout
                                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>

                                <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5 font-medium">
                                    <ShieldCheck className="w-4 h-4" />
                                    Secure 256-bit encrypted checkout
                                </p>
                            </div>

                            {/* Render Accordions on Mobile ONLY below the checkout */}
                            <div className="block lg:hidden mt-6">
                                {renderAccordions()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PoojaKitDetail;
