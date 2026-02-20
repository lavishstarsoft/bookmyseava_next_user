import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Star, Heart, Share2, ShieldCheck,
    ChevronRight, CheckCircle2, ChevronLeft, SlidersHorizontal, X, Info, Package, Clock, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Mock Data for a single Pooja (Ideally fetched by ID)
const poojaDetails = {
    id: 1,
    title: "Abhishekam to Lord Shiva",
    description: "A sacred ritual of bathing the deity with holy substances like milk, yogurt, honey, and water to seek divine blessings and purity of mind.",
    longDescription: "Abhishekam is a revered Hindu ritual where deities are bathed in sacred offerings like milk, ghee, honey, yogurt, and rose water. This act of devotion is believed to cleanse the soul, bring inner peace, and attract positive energies. Performing Abhishekam regularly is highly auspicious and brings health, wealth, and prosperity to the family.",
    images: [
        "/images/poojas/abhishekam.png",
        "/images/poojas/rudra_abhishekam.png", // Reusing existing mock images as extra variants
        "/images/poojas/deeparadhana.png"
    ],
    rating: 4.8,
    reviewsCount: 124,
    basePrice: 1500,
    duration: "45 mins"
};

// Pricing & Add-ons configuration
const VERSIONS = [
    {
        id: 'basic', title: 'Basic Version', price: 1500, rating: 4,
        desc: 'Includes all essential pooja items and a certified pandit.',
        includes: [
            { icon: '🪔', text: 'Basic Pooja Samagri (kumkum, turmeric, agarbatti)' },
            { icon: '👨‍🦳', text: '1 Certified Pandit' },
            { icon: '⏱️', text: '45 minutes duration' },
            { icon: '🥥', text: 'Coconut, camphor & flowers' },
        ]
    },
    {
        id: 'premium', title: 'Premium Version', price: 2500, rating: 4,
        desc: 'Includes extra floral decorations and special vastram for deity.',
        includes: [
            { icon: '🪔', text: 'Full Pooja Samagri Kit' },
            { icon: '👨‍🦳', text: '1 Senior Certified Pandit' },
            { icon: '⏱️', text: '1 hour duration' },
            { icon: '💐', text: 'Fresh flower decorations & garlands' },
            { icon: '👗', text: 'Special Vastram (silk cloth) for deity' },
            { icon: '🍚', text: 'Prasadam ingredients included' },
        ]
    },
    {
        id: 'super_premium', title: 'Super Premium', price: 5000, rating: 5,
        desc: 'All-inclusive VIP arrangement with extended rituals and silver items.',
        includes: [
            { icon: '🪔', text: 'Premium silver Pooja items' },
            { icon: '👨‍🦳', text: '2 Senior Pandits' },
            { icon: '⏱️', text: '1.5 hours extended rituals' },
            { icon: '💐', text: 'Grand floral mandap decoration' },
            { icon: '👗', text: 'Premium silk Vastram & ornaments' },
            { icon: '🍚', text: 'Full Prasadam + Laddu Box' },
            { icon: '🎥', text: 'Pooja video recording' },
            { icon: '📿', text: 'Blessed Rudraksha gift' },
        ]
    }
];

const ADD_ONS = [
    {
        id: 'none', label: 'Only Pooja', price: 0,
        includes: [
            { icon: '🪔', text: 'Core pooja ritual by certified pandit' },
            { icon: '🙏', text: 'Mantras and prayers as per tradition' },
        ]
    },
    {
        id: 'kit', label: 'Pooja + Pooja Kit', price: 1500,
        includes: [
            { icon: '🪔', text: 'Core pooja ritual included' },
            { icon: '📦', text: 'Complete Pooja Kit delivered to your home' },
            { icon: '🥥', text: 'Coconut, betel leaves, flowers, kumkum' },
            { icon: '🕯️', text: 'Agarbatti, camphor, ghee, cotton wicks' },
        ]
    },
    {
        id: 'prasadam', label: 'Pooja + Kit + Prasadam', price: 2000,
        includes: [
            { icon: '🪔', text: 'Core pooja ritual included' },
            { icon: '📦', text: 'Complete Pooja Kit delivered' },
            { icon: '🍚', text: 'Freshly prepared Prasadam (Pulihora, Laddu)' },
            { icon: '🎁', text: 'Blessed items and Theertha' },
        ]
    }
];

// Mock Reviews
const MOCK_REVIEWS = [
    { id: 1, user: "Ramesh Sharma", rating: 5, date: "12 Oct 2023", text: "Excellent pandit ji. The entire pooja was conducted with utmost devotion and authenticity. Highly recommended!" },
    { id: 2, user: "Kavya Reddy", rating: 4, date: "05 Nov 2023", text: "Very good experience. The items provided in the kit were of premium quality. Just wish the pandit arrived a little earlier." },
    { id: 3, user: "Anil Kumar", rating: 5, date: "22 Jan 2024", text: "Superb service. Everything was arranged seamlessly. We chose the Super Premium and the decorations were magnificent." },
];

const PoojaDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [activeImage, setActiveImage] = useState(0);
    const [selectedVersion, setSelectedVersion] = useState(VERSIONS[0]);
    const [selectedAddon, setSelectedAddon] = useState(ADD_ONS[0]);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [infoSheet, setInfoSheet] = useState<{ title: string; includes: { icon: string; text: string }[] } | null>(null);
    const shareButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const subTotal = selectedVersion.price + selectedAddon.price;

    const handleProceed = () => {
        navigate(`/checkout/${slug}`, {
            state: { version: selectedVersion, addon: selectedAddon, total: subTotal }
        });
    };

    // Share: mobile = native, desktop = popup
    const onShareClick = async () => {
        if (navigator.share && window.innerWidth < 768) {
            try {
                await navigator.share({
                    title: poojaDetails.title,
                    text: `Book ${poojaDetails.title} on Book My Seva`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            setIsShareOpen(true);
        }
    };

    const handleShare = (platform: string) => {
        const url = window.location.href;
        const text = `Book ${poojaDetails.title} on Book My Seva`;
        switch (platform) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(url)
                    .then(() => toast({ title: "Link Copied", description: "Pooja link copied to clipboard." }))
                    .catch(() => toast({ variant: "destructive", title: "Failed", description: "Please copy the link manually." }));
                break;
        }
        setIsShareOpen(false);
    };

    return (
        <div className="min-h-screen bg-muted/20 pb-20 font-body">
            {/* Breadcrumb / Top Bar */}
            <div className="bg-white border-b border-border shadow-sm mb-6 sticky top-[80px] md:top-[108px] z-30">
                <div className="container px-2 md:px-8 py-3 flex items-center text-sm font-medium text-muted-foreground">
                    <button onClick={() => navigate('/book-pooja')} className="hover:text-maroon-dark flex items-center transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" /> All Poojas
                    </button>
                    <span className="mx-2">›</span>
                    <span className="text-maroon-dark line-clamp-1">{poojaDetails.title}</span>
                </div>
            </div>

            <div className="container px-2 md:px-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* LEFT COLUMN: Images */}
                    <div className="w-full lg:w-[45%] shrink-0">
                        <div className="lg:sticky lg:top-40">

                            {/* === MOBILE VIEW: Full-width image + dots + icons === */}
                            <div className="lg:hidden">
                                <div
                                    className="relative w-full aspect-square bg-white overflow-hidden border-b border-border"
                                    onTouchStart={(e) => {
                                        const touch = e.touches[0];
                                        (e.currentTarget as any)._touchStartX = touch.clientX;
                                    }}
                                    onTouchEnd={(e) => {
                                        const startX = (e.currentTarget as any)._touchStartX;
                                        const endX = e.changedTouches[0].clientX;
                                        const diff = startX - endX;
                                        if (Math.abs(diff) > 50) {
                                            if (diff > 0 && activeImage < poojaDetails.images.length - 1) {
                                                setActiveImage(activeImage + 1);
                                            } else if (diff < 0 && activeImage > 0) {
                                                setActiveImage(activeImage - 1);
                                            }
                                        }
                                    }}
                                >
                                    <img
                                        src={poojaDetails.images[activeImage]}
                                        alt={poojaDetails.title}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                {/* Bottom bar: dots + icons */}
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="flex-1" />
                                    {/* Dot indicators */}
                                    <div className="flex items-center gap-2">
                                        {poojaDetails.images.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveImage(idx)}
                                                className={`rounded-full transition-all duration-300 ${activeImage === idx ? 'w-2.5 h-2.5 bg-gray-800' : 'w-2 h-2 bg-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    {/* Heart + Share */}
                                    <div className="flex-1 flex items-center justify-end gap-4">
                                        <button className="text-gray-500 hover:text-red-500 transition-colors">
                                            <Heart className="w-6 h-6" />
                                        </button>
                                        <button onClick={onShareClick} className="text-gray-500 hover:text-blue-600 transition-colors">
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* === DESKTOP VIEW: Vertical thumbnails + main image === */}
                            <div className="hidden lg:flex gap-3">
                                {/* Vertical Thumbnails - Left Strip */}
                                <div className="flex flex-col gap-2 shrink-0">
                                    {poojaDetails.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onMouseEnter={() => setActiveImage(idx)}
                                            onClick={() => setActiveImage(idx)}
                                            className={`w-[58px] h-[58px] rounded-md overflow-hidden border-2 transition-all duration-200 bg-white p-1 ${activeImage === idx ? 'border-[#007185] shadow-sm' : 'border-border/60 hover:border-[#007185] opacity-75 hover:opacity-100'}`}
                                        >
                                            <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                                        </button>
                                    ))}
                                </div>

                                {/* Main Image */}
                                <div className="relative flex-1">
                                    <div className="aspect-square bg-white rounded-lg overflow-hidden border border-border flex items-center justify-center">
                                        <img
                                            src={poojaDetails.images[activeImage]}
                                            alt={poojaDetails.title}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    {/* Share + Heart buttons (outside overflow-hidden) */}
                                    <button ref={shareButtonRef} onClick={onShareClick} className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full text-muted-foreground hover:text-blue-600 shadow-sm border border-border/40 transition-colors z-10">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    <button className="absolute top-3 right-12 p-2 bg-white/90 hover:bg-white rounded-full text-muted-foreground hover:text-red-500 shadow-sm border border-border/40 transition-colors z-10">
                                        <Heart className="w-4 h-4" />
                                    </button>

                                    {/* Desktop Share Popup */}
                                    {isShareOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsShareOpen(false)} />
                                            <div className="absolute right-0 top-12 w-52 bg-white border border-border rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="flex items-center justify-between px-3 py-2 mb-1">
                                                    <span className="text-sm font-bold text-gray-900">Share via</span>
                                                    <button onClick={() => setIsShareOpen(false)} className="text-gray-400 hover:text-gray-600">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <button onClick={() => handleShare('whatsapp')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#25D366]/10 text-sm font-medium transition-colors">
                                                        <span className="w-7 h-7 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                                        </span>
                                                        WhatsApp
                                                    </button>
                                                    <button onClick={() => handleShare('facebook')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1877F2]/10 text-sm font-medium transition-colors">
                                                        <span className="w-7 h-7 rounded-full bg-[#1877F2]/10 flex items-center justify-center">
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                                        </span>
                                                        Facebook
                                                    </button>
                                                    <button onClick={() => handleShare('twitter')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-black/5 text-sm font-medium transition-colors">
                                                        <span className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center">
                                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                                        </span>
                                                        X (Twitter)
                                                    </button>
                                                    <div className="h-px bg-border mx-2 my-1" />
                                                    <button onClick={() => handleShare('copy')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 text-sm font-medium transition-colors">
                                                        <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                                        </span>
                                                        Copy Link
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* MIDDLE COLUMN: Details & Options */}
                    <div className="w-full lg:w-[35%] flex flex-col pt-2">
                        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2 leading-tight">
                            {poojaDetails.title}
                        </h1>

                        <a href="#reviews" className="flex items-center gap-2 mb-4 hover:underline cursor-pointer group w-fit">
                            <div className="flex items-center">
                                {"★".repeat(Math.floor(poojaDetails.rating))}
                                <span className="text-gray-300">{"★".repeat(5 - Math.floor(poojaDetails.rating))}</span>
                            </div>
                            <span className="text-sm font-semibold text-spiritual-green group-hover:text-green-700">
                                {poojaDetails.rating} ({poojaDetails.reviewsCount} verified reviews)
                            </span>
                        </a>

                        <div className="flex items-baseline gap-2 mb-6 cursor-pointer hover:bg-muted/30 p-2 -ml-2 rounded-lg transition-colors w-fit">
                            <span className="text-3xl font-black text-maroon-dark">₹{subTotal}</span>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inclusive of taxes</span>
                        </div>

                        <Separator className="mb-6" />

                        {/* Variants Selection */}
                        <div className="mb-8">
                            <h3 className="font-bold text-base text-gray-900 mb-3">1. Select Pooja Version</h3>
                            <div className="space-y-3">
                                {VERSIONS.map(version => (
                                    <label
                                        key={version.id}
                                        className={`
                                            flex items-start p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200
                                            ${selectedVersion.id === version.id ? 'border-maroon bg-maroon/5' : 'border-border hover:border-maroon/30 hover:bg-muted/20'}
                                        `}
                                        onClick={() => setSelectedVersion(version)}
                                    >
                                        <div className={`mt-0.5 w-5 h-5 shrink-0 rounded-full border flex items-center justify-center mr-3 ${selectedVersion.id === version.id ? 'border-maroon bg-maroon' : 'border-muted-foreground'}`}>
                                            {selectedVersion.id === version.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{version.title}</span>
                                                    {/* Info icon - Desktop: hover tooltip, Mobile: tap bottom sheet */}
                                                    <div className="relative group">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (window.innerWidth < 1024) {
                                                                    setInfoSheet({ title: version.title, includes: version.includes });
                                                                }
                                                            }}
                                                            className="p-0.5 text-muted-foreground hover:text-maroon transition-colors"
                                                        >
                                                            <Info className="w-4 h-4" />
                                                        </button>
                                                        {/* Desktop hover tooltip */}
                                                        <div className="hidden lg:block absolute left-full ml-2 top-1/2 -translate-y-1/2 w-72 bg-white border border-border rounded-xl shadow-xl p-4 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                                                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-white" />
                                                            <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                                                                <Package className="w-4 h-4 text-maroon" /> What's included
                                                            </h4>
                                                            <ul className="space-y-2">
                                                                {version.includes.map((item, i) => (
                                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                                        <span className="shrink-0 text-base">{item.icon}</span>
                                                                        <span>{item.text}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-maroon">₹{version.price}</span>
                                            </div>
                                            <span className="flex text-yellow-500 text-xs mb-1">
                                                {"★".repeat(version.rating)}{"☆".repeat(5 - version.rating)}
                                            </span>
                                            <p className="text-xs text-muted-foreground">{version.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Add-ons Selection */}
                        <div className="mb-6">
                            <h3 className="font-bold text-base text-gray-900 mb-3">2. Additional Offerings</h3>
                            <div className="space-y-3">
                                {ADD_ONS.map(addon => (
                                    <label
                                        key={addon.id}
                                        className={`
                                            flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200
                                            ${selectedAddon.id === addon.id ? 'border-marigold bg-marigold/5' : 'border-border hover:border-marigold/30 hover:bg-muted/20'}
                                        `}
                                        onClick={() => setSelectedAddon(addon)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedAddon.id === addon.id ? 'border-marigold bg-marigold' : 'border-muted-foreground'}`}>
                                                {selectedAddon.id === addon.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            <span className="font-bold text-gray-800">{addon.label}</span>
                                            {/* Info icon */}
                                            <div className="relative group">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.innerWidth < 1024) {
                                                            setInfoSheet({ title: addon.label, includes: addon.includes });
                                                        }
                                                    }}
                                                    className="p-0.5 text-muted-foreground hover:text-marigold transition-colors"
                                                >
                                                    <Info className="w-4 h-4" />
                                                </button>
                                                {/* Desktop hover tooltip */}
                                                <div className="hidden lg:block absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 bg-white border border-border rounded-xl shadow-xl p-4 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-white" />
                                                    <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                                                        <Package className="w-4 h-4 text-marigold" /> What's included
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {addon.includes.map((item, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                                <span className="shrink-0 text-base">{item.icon}</span>
                                                                <span>{item.text}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="font-bold text-sm text-gray-900">{addon.price === 0 ? 'Included' : `+ ₹${addon.price}`}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div>
                            <h3 className="font-bold text-lg mb-2">Description</h3>
                            <p className="text-sm text-gray-600 leading-relaxed text-justify">
                                {poojaDetails.longDescription}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Buy Box (Sticky) */}
                    <div className="w-full lg:w-[20%] shrink-0">
                        <div className="sticky top-40 bg-white rounded-2xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-border">
                            <div className="text-2xl font-black text-maroon-dark mb-1">₹{subTotal}</div>
                            <div className="text-xs text-green-700 font-bold mb-4 flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Services</div>

                            <div className="flex gap-2 items-start mb-6 text-sm text-gray-600">
                                <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-marigold" /></div>
                                <span>Free cancellation up to 24 hours before the pooja</span>
                            </div>

                            <Button
                                onClick={handleProceed}
                                className="w-full h-12 text-sm bg-spiritual-green hover:bg-spiritual-green/90 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 mb-3 tracking-wide uppercase"
                            >
                                Buy Now
                            </Button>

                            <div className="text-center text-[10px] text-muted-foreground font-medium">
                                Secure checkout · Pay after scheduling
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION: Reviews */}
                <div id="reviews" className="mt-16 pt-10 border-t border-border">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-gray-900">Customer Reviews</h2>
                            <p className="text-sm text-muted-foreground mt-1">Hear from devotees who have experienced this pooja</p>
                        </div>
                        <Button variant="outline" className="hidden md:flex border-maroon/20 text-maroon hover:bg-maroon/5 hover:text-maroon-dark rounded-lg font-semibold text-sm">
                            Write a Review
                        </Button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Rating Summary Card */}
                        <div className="w-full lg:w-[340px] shrink-0">
                            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                                {/* Score */}
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-marigold/20 to-marigold/5 flex items-center justify-center border border-marigold/20">
                                        <span className="text-4xl font-black text-gray-900">{poojaDetails.rating}</span>
                                    </div>
                                    <div>
                                        <div className="flex text-marigold text-xl mb-1">★★★★★</div>
                                        <span className="text-sm text-muted-foreground font-medium">{poojaDetails.reviewsCount} verified ratings</span>
                                    </div>
                                </div>

                                <Separator className="mb-5" />

                                {/* Rating Breakdown */}
                                <div className="space-y-3">
                                    {[
                                        { stars: 5, percent: 80 },
                                        { stars: 4, percent: 15 },
                                        { stars: 3, percent: 4 },
                                        { stars: 2, percent: 1 },
                                        { stars: 1, percent: 0 }
                                    ].map((bar) => (
                                        <button key={bar.stars} className="w-full flex items-center gap-3 group hover:bg-muted/30 rounded-lg px-2 py-1 -mx-2 transition-colors">
                                            <span className="w-8 text-sm font-semibold text-gray-700 flex items-center gap-0.5">
                                                {bar.stars} <Star className="w-3 h-3 text-marigold fill-marigold" />
                                            </span>
                                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-marigold to-amber-400 rounded-full transition-all duration-500"
                                                    style={{ width: `${bar.percent}%` }}
                                                />
                                            </div>
                                            <span className="w-10 text-right text-xs font-semibold text-gray-500">{bar.percent}%</span>
                                        </button>
                                    ))}
                                </div>

                                <Separator className="my-5" />

                                {/* CTA */}
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground mb-3">Share your experience with others</p>
                                    <Button variant="outline" className="w-full border-marigold/30 text-maroon-dark hover:bg-marigold/10 font-semibold rounded-lg text-sm">
                                        Rate this Pooja
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Review Feed */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg text-gray-900">Top Reviews from India</h3>
                                <Select defaultValue="recent">
                                    <SelectTrigger className="hidden md:flex w-[180px] h-9 border-border bg-white rounded-lg text-sm font-semibold text-gray-700 shadow-sm hover:shadow-md hover:border-marigold/40 transition-all focus:ring-1 focus:ring-marigold/50 gap-2">
                                        <SlidersHorizontal className="w-3.5 h-3.5 text-marigold" />
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-border shadow-xl rounded-xl">
                                        <SelectItem value="recent" className="text-sm font-medium cursor-pointer focus:bg-marigold/10 focus:text-maroon-dark rounded-lg">Most Recent</SelectItem>
                                        <SelectItem value="highest" className="text-sm font-medium cursor-pointer focus:bg-marigold/10 focus:text-maroon-dark rounded-lg">Highest Rated</SelectItem>
                                        <SelectItem value="helpful" className="text-sm font-medium cursor-pointer focus:bg-marigold/10 focus:text-maroon-dark rounded-lg">Most Helpful</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-5">
                                {MOCK_REVIEWS.map(review => (
                                    <div key={review.id} className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-maroon to-maroon-dark flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                    {review.user.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm text-gray-900">{review.user}</div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <CheckCircle2 className="w-3 h-3 text-spiritual-green" />
                                                        <span className="text-[11px] text-spiritual-green font-semibold">Verified Devotee</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium">{review.date}</span>
                                        </div>

                                        {/* Stars */}
                                        <div className="flex items-center gap-1 mb-3">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating ? 'text-marigold fill-marigold' : 'text-gray-200 fill-gray-200'}`}
                                                />
                                            ))}
                                        </div>

                                        {/* Text */}
                                        <p className="text-sm text-gray-700 leading-relaxed mb-4">{review.text}</p>

                                        {/* Footer */}
                                        <div className="flex items-center gap-4 pt-3 border-t border-border/50">
                                            <button className="text-xs font-semibold text-gray-500 hover:text-maroon transition-colors flex items-center gap-1.5">
                                                👍 Helpful
                                            </button>
                                            <button className="text-xs font-semibold text-gray-500 hover:text-maroon transition-colors">
                                                Report
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Load More */}
                            <div className="mt-8 text-center">
                                <Button variant="outline" className="px-8 border-border hover:border-maroon/20 text-gray-700 hover:text-maroon-dark font-semibold rounded-lg">
                                    See All {poojaDetails.reviewsCount} Reviews
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Android-style Bottom Sheet (Mobile only) */}
            {infoSheet && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                        onClick={() => setInfoSheet(null)}
                    />
                    {/* Sheet */}
                    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
                        <div className="bg-white rounded-t-2xl shadow-2xl max-h-[70vh] overflow-y-auto">
                            {/* Drag handle */}
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 rounded-full bg-gray-300" />
                            </div>

                            <div className="px-5 pb-24 pt-2">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-maroon" />
                                        {infoSheet.title}
                                    </h3>
                                    <button
                                        onClick={() => setInfoSheet(null)}
                                        className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* What's included */}
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">What's included</p>
                                <ul className="space-y-3">
                                    {infoSheet.includes.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-800">
                                            <span className="shrink-0 text-lg mt-0.5">{item.icon}</span>
                                            <span className="leading-relaxed">{item.text}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Dismiss button */}
                                <Button
                                    onClick={() => setInfoSheet(null)}
                                    className="w-full mt-6 h-11 bg-spiritual-green hover:bg-spiritual-green/90 text-white font-semibold rounded-lg"
                                >
                                    Got it
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div >
    );
};

export default PoojaDetail;
