import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles, ArrowRight, Star, X, Package, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { API_URL, getImageUrl } from "@/config";

// Kit type matching backend schema
interface PricingPlan {
    id: string;
    label: string;
    price: number | string;
    active: boolean;
    badge: string;
}

interface Kit {
    _id: string;
    title: string;
    shortDescription: string;
    category: string;
    image?: string;
    defaultRating?: number;
    reviewCount?: number;
    itemsIncluded: { id: number; text: string }[];
    pricingPlans?: PricingPlan[];
    marketPrice?: number | string;
    offerPrice?: number | string;
}

const alphabets = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

// Helper to get display price from a kit
const getKitPrice = (kit: Kit): number => {
    if (kit.category === 'daily' && kit.pricingPlans?.length) {
        const activePlans = kit.pricingPlans.filter(p => p.active && Number(p.price) > 0);
        if (activePlans.length > 0) {
            return Math.min(...activePlans.map(p => Number(p.price)));
        }
    }
    if (kit.offerPrice && Number(kit.offerPrice) > 0) return Number(kit.offerPrice);
    if (kit.marketPrice && Number(kit.marketPrice) > 0) return Number(kit.marketPrice);
    return 0;
};

const PoojaKits = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLetter, setSelectedLetter] = useState("All");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [kits, setKits] = useState<Kit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch kits from backend
    useEffect(() => {
        const fetchKits = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${API_URL.replace('/api', '/api/v1')}/kits`);
                const data = Array.isArray(response.data) ? response.data : [];
                setKits(data);
            } catch (err) {
                console.error("Failed to fetch pooja kits:", err);
                setError("Failed to load pooja kits. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchKits();
        window.scrollTo(0, 0);
    }, []);

    const filteredKits = useMemo(() => {
        let filtered = [...kits];
        if (searchTerm) {
            filtered = filtered.filter(kit =>
                kit.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedLetter !== "All") {
            filtered = filtered.filter(kit =>
                kit.title.toUpperCase().startsWith(selectedLetter)
            );
        }
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        return filtered;
    }, [searchTerm, selectedLetter, kits]);

    const handleLetterClick = (letter: string) => {
        setSelectedLetter(letter);
        setSearchTerm("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-background">

            {/* Sticky Header Section */}
            <div className="mt-6 pt-2 pb-4 bg-background/95 backdrop-blur-lg border-b border-border/40 sticky top-20 md:top-[108px] z-40 transition-all duration-300">
                <div className="container px-4">

                    {/* Top Row: Title & Search */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-marigold/10 flex items-center justify-center border border-marigold/20">
                                <Package className="w-5 h-5 text-marigold" />
                            </div>
                            <div>
                                <h1 className="font-heading text-3xl font-bold text-maroon-dark leading-none">
                                    Pooja Kits
                                </h1>
                                <p className="text-xs text-muted-foreground font-medium mt-1">
                                    {loading ? "Loading..." : `${filteredKits.length} kits available`} · Delivered to your doorstep
                                </p>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className={`relative transition-all duration-300 ${isSearchFocused ? 'w-full md:w-80 shadow-lg' : 'w-full md:w-64'}`}>
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isSearchFocused ? 'text-marigold' : 'text-muted-foreground'}`} />
                            <input
                                type="text"
                                placeholder="Search pooja kits..."
                                value={searchTerm}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-white border border-border/60 rounded-full focus:outline-none focus:ring-1 focus:ring-marigold/50 focus:border-marigold text-sm font-medium transition-all shadow-sm"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-maroon transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Alphabet Filter */}
                    <div className="relative">
                        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-2 px-1 mask-linear-fade">
                            {alphabets.map((letter) => (
                                <button
                                    key={letter}
                                    onClick={() => handleLetterClick(letter)}
                                    className={`
                                        min-w-[40px] h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 flex-shrink-0
                                        ${selectedLetter === letter
                                            ? "bg-maroon-dark text-white shadow-md scale-105 font-serif ring-2 ring-maroon-dark/20"
                                            : "bg-white text-muted-foreground hover:bg-maroon/5 hover:text-maroon-dark hover:scale-105 border border-transparent hover:border-maroon/10"
                                        }
                                    `}
                                >
                                    {letter}
                                </button>
                            ))}
                        </div>
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none md:hidden" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <main className="container px-4 py-8 min-h-[60vh]">
                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Loader2 className="w-10 h-10 text-marigold animate-spin mb-4" />
                        <p className="text-muted-foreground font-medium">Loading pooja kits...</p>
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                            <X className="w-8 h-8 text-red-400" />
                        </div>
                        <h3 className="font-heading text-2xl font-bold text-maroon-dark mb-2">
                            Something went wrong
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                            {error}
                        </p>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="text-maroon hover:text-maroon-dark border-maroon/20 hover:bg-maroon/5"
                        >
                            Try Again
                        </Button>
                    </div>
                )}

                {/* Kits Grid */}
                {!loading && !error && filteredKits.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredKits.map((kit, index) => {
                            const displayPrice = getKitPrice(kit);
                            const imageUrl = getImageUrl(kit.image);

                            return (
                                <div
                                    key={kit._id}
                                    className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-border/30 hover:border-marigold/30 flex flex-col h-full animate-fade-in-up hover:-translate-y-1"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                        <img
                                            src={imageUrl || "/images/poojas/deeparadhana.png"}
                                            alt={kit.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Floating Price Tag */}
                                        {displayPrice > 0 && (
                                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-maroon-dark shadow-sm ring-1 ring-black/5">
                                                ₹{displayPrice}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="font-heading text-xl font-bold text-maroon-dark mb-1 group-hover:text-marigold transition-colors line-clamp-1">
                                            {kit.title}
                                        </h3>

                                        <div className="flex items-center gap-2 mb-3">
                                            {kit.defaultRating && (
                                                <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                                                    <Star className="w-3 h-3 text-marigold fill-marigold" />
                                                    {kit.defaultRating}
                                                </div>
                                            )}
                                            {kit.reviewCount !== undefined && kit.reviewCount > 0 && (
                                                <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                                                    {kit.reviewCount} reviews
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-muted-foreground text-sm leading-relaxed mb-5 font-body flex-1 line-clamp-2">
                                            {kit.shortDescription || "Complete pooja kit with all essential items."}
                                        </p>

                                        {/* Price & CTA */}
                                        <div className="flex items-center justify-between mt-auto">
                                            <div>
                                                {displayPrice > 0 && (
                                                    <>
                                                        <div className="text-xl font-black text-maroon-dark">₹{displayPrice}</div>
                                                        <div className="text-[10px] text-muted-foreground font-medium">Starting price</div>
                                                    </>
                                                )}
                                            </div>
                                            <Link to={`/pooja-kit/${kit._id}`}>
                                                <Button className="bg-spiritual-green hover:bg-spiritual-green/90 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 h-10 text-xs tracking-wide uppercase group/btn px-5">
                                                    <span className="mr-1">View Kit</span>
                                                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredKits.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <Search className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="font-heading text-2xl font-bold text-maroon-dark mb-2">
                            No kits found
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                            {searchTerm
                                ? `We couldn't find any pooja kits matching "${searchTerm}". Try a different search term.`
                                : "No pooja kits available at the moment. Please check back later."}
                        </p>
                        <Button
                            onClick={() => { setSearchTerm(""); setSelectedLetter("All"); }}
                            variant="outline"
                            className="text-maroon hover:text-maroon-dark border-maroon/20 hover:bg-maroon/5"
                        >
                            View All Kits
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PoojaKits;
