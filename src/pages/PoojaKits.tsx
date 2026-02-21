import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles, ArrowRight, Star, X, Package, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock Pooja Kits Data
const POOJA_KITS = [
    {
        id: 1, slug: "ganapati-pooja-kit",
        name: "Ganapati Pooja Kit",
        image: "/images/poojas/ganapathi_homam.png",
        description: "Complete kit with modak mould, durva grass, red flowers, coconut, and all items for Ganesh worship.",
        rating: 4.9, reviewCount: 238,
        pricing: { weekly: 299, monthly: 899, quarterly: 2399, yearly: 7999 }
    },
    {
        id: 2, slug: "shiva-abhishekam-kit",
        name: "Abhishekam Kit",
        image: "/images/poojas/abhishekam.png",
        description: "Milk, curd, honey, ghee, sugar, vibhuti, bilva leaves and all essentials for Lord Shiva Abhishekam.",
        rating: 4.8, reviewCount: 186,
        pricing: { weekly: 349, monthly: 999, quarterly: 2699, yearly: 8999 }
    },
    {
        id: 3, slug: "daily-pooja-kit",
        name: "Daily Pooja Kit",
        image: "/images/poojas/deeparadhana.png",
        description: "Agarbatti, camphor, cotton wicks, kumkum, turmeric, flowers, and essentials for daily home worship.",
        rating: 4.7, reviewCount: 412,
        pricing: { weekly: 199, monthly: 599, quarterly: 1599, yearly: 4999 }
    },
    {
        id: 4, slug: "lakshmi-pooja-kit",
        name: "Lakshmi Pooja Kit",
        image: "/images/poojas/lakshmi_pooja.png",
        description: "Lotus flowers, kumkum, turmeric, coins, red cloth, and special items for Goddess Lakshmi worship.",
        rating: 4.9, reviewCount: 167,
        pricing: { weekly: 399, monthly: 1099, quarterly: 2999, yearly: 9999 }
    },
    {
        id: 5, slug: "navagraha-pooja-kit",
        name: "Navagraha Pooja Kit",
        image: "/images/poojas/navagraha_shanti.png",
        description: "Nine types of grains, flowers, navadhanyas, and pooja items for planetary blessings and peace.",
        rating: 4.6, reviewCount: 98,
        pricing: { weekly: 449, monthly: 1299, quarterly: 3499, yearly: 11999 }
    },
    {
        id: 6, slug: "rudra-abhishekam-kit",
        name: "Rudra Abhishekam Kit",
        image: "/images/poojas/rudra_abhishekam.png",
        description: "Premium silver items, panchamritam ingredients, bilva, rudraksha, and sacred materials for Rudra pooja.",
        rating: 4.8, reviewCount: 134,
        pricing: { weekly: 599, monthly: 1699, quarterly: 4599, yearly: 14999 }
    },
    {
        id: 7, slug: "satyanarayana-kit",
        name: "Satyanarayana Pooja Kit",
        image: "/images/poojas/satyanarayana.png",
        description: "Banana, jaggery, wheat flour, ghee, tulsi, and all materials for Satyanarayana Swamy Vratam.",
        rating: 4.9, reviewCount: 298,
        pricing: { weekly: 349, monthly: 999, quarterly: 2699, yearly: 8999 }
    },
    {
        id: 8, slug: "vastu-pooja-kit",
        name: "Vastu Pooja Kit",
        image: "/images/poojas/vastu_shanti.png",
        description: "Navadhanyas, kalash, mango leaves, sacred threads, and items for Vastu Shanti ceremony.",
        rating: 4.5, reviewCount: 76,
        pricing: { weekly: 499, monthly: 1399, quarterly: 3799, yearly: 12999 }
    },
];

const alphabets = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

const PoojaKits = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLetter, setSelectedLetter] = useState("All");
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const filteredKits = useMemo(() => {
        let kits = [...POOJA_KITS];
        if (searchTerm) {
            kits = kits.filter(kit =>
                kit.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedLetter !== "All") {
            kits = kits.filter(kit =>
                kit.name.toUpperCase().startsWith(selectedLetter)
            );
        }
        kits.sort((a, b) => a.name.localeCompare(b.name));
        return kits;
    }, [searchTerm, selectedLetter]);

    const handleLetterClick = (letter: string) => {
        setSelectedLetter(letter);
        setSearchTerm("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
                                    {filteredKits.length} kits available · Delivered to your doorstep
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
                {filteredKits.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredKits.map((kit, index) => (
                            <div
                                key={kit.id}
                                className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-border/30 hover:border-marigold/30 flex flex-col h-full animate-fade-in-up hover:-translate-y-1"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Image Container */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                    <img
                                        src={kit.image}
                                        alt={kit.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Floating Price Tag */}
                                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-maroon-dark shadow-sm ring-1 ring-black/5">
                                        ₹{kit.pricing.monthly}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="font-heading text-xl font-bold text-maroon-dark mb-1 group-hover:text-marigold transition-colors line-clamp-1">
                                        {kit.name}
                                    </h3>

                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                                            <Star className="w-3 h-3 text-marigold fill-marigold" />
                                            {kit.rating}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                                            {kit.reviewCount} reviews
                                        </div>
                                    </div>

                                    <p className="text-muted-foreground text-sm leading-relaxed mb-5 font-body flex-1 line-clamp-2">
                                        {kit.description}
                                    </p>

                                    {/* Price & CTA */}
                                    <div className="flex items-center justify-between mt-auto">
                                        <div>
                                            <div className="text-xl font-black text-maroon-dark">₹{kit.pricing.monthly}</div>
                                            <div className="text-[10px] text-muted-foreground font-medium">Starting price</div>
                                        </div>
                                        <Link to={`/pooja-kit/${kit.slug}`}>
                                            <Button className="bg-spiritual-green hover:bg-spiritual-green/90 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 h-10 text-xs tracking-wide uppercase group/btn px-5">
                                                <span className="mr-1">View Kit</span>
                                                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <Search className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="font-heading text-2xl font-bold text-maroon-dark mb-2">
                            No kits found
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                            We couldn't find any pooja kits matching "{searchTerm}". Try a different search term.
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
