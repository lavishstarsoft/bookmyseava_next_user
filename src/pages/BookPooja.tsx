import { useState, useEffect } from "react";
import { Search, Sparkles, ArrowRight, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock Data for Poojas
const poojaList = [
    {
        id: 1,
        title: "Abhishekam",
        description: "A sacred ritual of bathing the deity with holy substances like milk, yogurt, honey, and water.",
        image: "/images/poojas/abhishekam.png",
        price: "₹1,500",
        duration: "45 mins"
    },
    {
        id: 2,
        title: "Archana",
        description: "Chanting of the deity's holy names with offering of flowers, invoking divine blessings.",
        image: "/images/poojas/archana.png",
        price: "₹500",
        duration: "20 mins"
    },
    {
        id: 3,
        title: "Chandi Homam",
        description: "A supreme fire ritual dedicated to Goddess Chandi for eliminating negativity and attaining victory.",
        image: "/images/poojas/chandi_homam.png",
        price: "₹15,000",
        duration: "4 hours"
    },
    {
        id: 4,
        title: "Deeparadhana",
        description: "Lighting of lamps to dispel darkness and ignorance, inviting knowledge and divine presence.",
        image: "/images/poojas/deeparadhana.png",
        price: "₹200",
        duration: "15 mins"
    },
    {
        id: 5,
        title: "Ganapathi Homam",
        description: "A powerful fire ritual dedicated to Lord Ganesha to remove obstacles and ensure success.",
        image: "/images/poojas/ganapathi_homam.png",
        price: "₹3,500",
        duration: "2 hours"
    },
    {
        id: 6,
        title: "Kumkum Archana",
        description: "Worship of the Divine Mother with vermilion (kumkum), bestowing long life and well-being.",
        image: "/images/poojas/kumkum_archana.png",
        price: "₹800",
        duration: "30 mins"
    },
    {
        id: 7,
        title: "Navagraha Shanti",
        description: "Ritual to appease the nine planetary deities and reduce the negative effects of planetary positions.",
        image: "/images/poojas/navagraha_shanti.png",
        price: "₹2,500",
        duration: "1.5 hours"
    },
    {
        id: 8,
        title: "Rudra Abhishekam",
        description: "Powerful abhishek to Lord Shiva with Rudram chanting for health and removal of bad karma.",
        image: "/images/poojas/rudra_abhishekam.png",
        price: "₹2,100",
        duration: "1 hour"
    },
    {
        id: 9,
        title: "Satyanarayana Swamy Vratam",
        description: "A traditional ritual performed to express gratitude to Lord Vishnu, bringing abundance.",
        image: "/images/poojas/satyanarayana_vratam.png",
        price: "₹4,000",
        duration: "2.5 hours"
    },
    {
        id: 10,
        title: "Vahan Pooja",
        description: "Blessing ceremony for new vehicles to ensure safety and protection from accidents.",
        image: "/images/poojas/vahan_pooja.png",
        price: "₹500",
        duration: "30 mins"
    }
];

const alphabets = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

const BookPooja = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLetter, setSelectedLetter] = useState("All");
    const [sortedPoojas, setSortedPoojas] = useState(poojaList);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        let filtered = poojaList;

        if (searchTerm) {
            filtered = filtered.filter(pooja =>
                pooja.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedLetter !== "All") {
            filtered = filtered.filter(pooja =>
                pooja.title.toUpperCase().startsWith(selectedLetter)
            );
        }

        filtered.sort((a, b) => a.title.localeCompare(b.title));
        setSortedPoojas(filtered);
    }, [searchTerm, selectedLetter]);

    const handleLetterClick = (letter: string) => {
        setSelectedLetter(letter);
        setSearchTerm("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-background"> {/* Matches Home Page Background */}

            {/* Sticky Header Section */}
            <div className="mt-6 pt-2 pb-4 bg-background/95 backdrop-blur-lg border-b border-border/40 sticky top-20 md:top-[108px] z-40 transition-all duration-300">
                <div className="container px-4">

                    {/* Top Row: Title & Search */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-marool/5 flex items-center justify-center border border-maroon/10">
                                <Sparkles className="w-5 h-5 text-marigold fill-marigold" />
                            </div>
                            <div>
                                <h1 className="font-heading text-3xl font-bold text-maroon-dark leading-none">
                                    Divine Offerings
                                </h1>
                                <p className="text-xs text-muted-foreground font-medium mt-1">
                                    {sortedPoojas.length} sacred rituals available
                                </p>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className={`relative transition-all duration-300 ${isSearchFocused ? 'w-full md:w-80 shadow-lg' : 'w-full md:w-64'}`}>
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isSearchFocused ? 'text-marigold' : 'text-muted-foreground'}`} />
                            <input
                                type="text"
                                placeholder="Find your pooja..."
                                value={searchTerm}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setSelectedLetter("All");
                                }}
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

                    {/* Bottom Row: Elegant Alphabet Filter */}
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
                        {/* Decorative gradient lines to indicate scrolling */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none md:hidden" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <main className="container px-4 py-8 min-h-[60vh]">
                {sortedPoojas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sortedPoojas.map((pooja, index) => (
                            <div
                                key={pooja.id}
                                className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-border/30 hover:border-marigold/30 flex flex-col h-full animate-fade-in-up hover:-translate-y-1"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Image Container */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                    <img
                                        src={pooja.image}
                                        alt={pooja.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Floating Price Tag */}
                                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-maroon-dark shadow-sm ring-1 ring-black/5">
                                        {pooja.price}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="font-heading text-xl font-bold text-maroon-dark mb-1 group-hover:text-marigold transition-colors line-clamp-1">
                                        {pooja.title}
                                    </h3>

                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                                            <Sparkles className="w-3 h-3 text-marigold" />
                                            {pooja.duration}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                                            <Star className="w-3 h-3 text-marigold fill-marigold" />
                                            4.9
                                        </div>
                                    </div>

                                    <p className="text-muted-foreground text-sm leading-relaxed mb-5 font-body flex-1 line-clamp-2">
                                        {pooja.description}
                                    </p>

                                    {/* Action Button - Updated to match Home Page 'spiritual-green' style */}
                                    <Button className="w-full bg-spiritual-green hover:bg-spiritual-green/90 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 h-10 text-xs tracking-wide uppercase group/btn">
                                        <span className="mr-2">Book Now</span>
                                        <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
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
                            No rituals found
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                            We couldn't find any poojas matching "{searchTerm}". Try checking the spelling or browse all rituals.
                        </p>
                        <Button
                            onClick={() => { setSearchTerm(""); setSelectedLetter("All"); }}
                            variant="outline"
                            className="text-maroon hover:text-maroon-dark border-maroon/20 hover:bg-maroon/5"
                        >
                            View All Poojas
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BookPooja;
