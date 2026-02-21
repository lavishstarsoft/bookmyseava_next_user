import { Heart, ArrowRight, Sparkles, HandHeart, Package, Trash2, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/contexts/FavoritesContext";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Button } from "@/components/ui/button";

const Favorites = () => {
    const { favorites } = useFavorites();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-12 font-body selection:bg-marigold/30">

            {/* Sticky Compact Header — matches BookPooja style */}
            <div className="mt-6 pt-2 pb-4 bg-background/95 backdrop-blur-lg border-b border-border/40 sticky top-20 md:top-[108px] z-40">
                <div className="container px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                                <Heart className="w-5 h-5 text-red-400 fill-red-400" />
                            </div>
                            <div>
                                <h1 className="font-heading text-2xl md:text-3xl font-bold text-maroon-dark leading-none">
                                    Your Favorites
                                </h1>
                                <p className="text-xs text-muted-foreground font-medium mt-1">
                                    {favorites.length > 0
                                        ? `${favorites.length} saved item${favorites.length > 1 ? 's' : ''}`
                                        : 'No saved items yet'}
                                </p>
                            </div>
                        </div>

                        {favorites.length > 0 && (
                            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                                <Sparkles className="w-3.5 h-3.5 text-marigold" />
                                Saved for Later
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="container px-4 py-8 min-h-[60vh]">

                {/* Empty State */}
                {favorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="relative w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50">
                            <Heart className="w-10 h-10 text-red-300 animate-pulse" />
                            <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center border border-red-100">
                                <HandHeart className="w-4.5 h-4.5 text-marigold" />
                            </div>
                        </div>

                        <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            Your sacred list is empty
                        </h2>
                        <p className="text-muted-foreground max-w-md mb-8 text-sm leading-relaxed">
                            Explore our divine collection of Poojas and complete Kits. Tap the heart icon on any service to save it here.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <Button
                                onClick={() => navigate('/book-pooja')}
                                className="bg-maroon-dark hover:bg-maroon-dark/90 text-white rounded-full px-8 h-11 text-sm font-semibold shadow-lg shadow-maroon-dark/20 transition-all hover:-translate-y-0.5"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Browse Poojas
                            </Button>
                            <Button
                                onClick={() => navigate('/pooja-kits')}
                                variant="outline"
                                className="rounded-full px-8 h-11 text-sm font-semibold border-border hover:border-marigold hover:text-marigold-dark hover:bg-marigold/5 transition-all"
                            >
                                <Package className="w-4 h-4 mr-2" />
                                View Samagri Kits
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Favorites Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((item, index) => (
                            <div
                                key={item.id}
                                className="group relative bg-white rounded-2xl overflow-hidden border border-border/30 hover:border-marigold/30 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 animate-fade-in-up"
                                style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
                                onClick={() => navigate(item.type === 'pooja' ? `/pooja/${item.id}` : `/pooja-kit/${item.id}`)}
                            >
                                {/* Image */}
                                <div className="relative aspect-[4/3] bg-muted w-full overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                    />

                                    {/* Type Badge */}
                                    <div className="absolute top-3 left-3 z-20">
                                        <div className="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase text-gray-900 shadow-sm ring-1 ring-black/5 flex items-center gap-1.5">
                                            {item.type === 'pooja' ? (
                                                <><Sparkles className="w-3 h-3 text-marigold" /> Pooja</>
                                            ) : (
                                                <><Package className="w-3 h-3 text-marigold" /> Kit</>
                                            )}
                                        </div>
                                    </div>

                                    {/* Favorite Toggle */}
                                    <div className="absolute top-3 right-3 z-20" onClick={(e) => e.stopPropagation()}>
                                        <FavoriteButton
                                            item={item}
                                            className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-md ring-1 ring-black/5 transition-transform hover:scale-110"
                                            iconSize={16}
                                        />
                                    </div>

                                    {/* Price on hover overlay */}
                                    <div className="absolute bottom-3 left-3 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                        <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-maroon-dark shadow-sm ring-1 ring-black/5">
                                            ₹{item.price.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="font-heading text-lg font-bold text-maroon-dark group-hover:text-marigold transition-colors line-clamp-2 leading-snug mb-2">
                                        {item.title}
                                    </h3>

                                    <div className="mt-auto pt-4 flex items-end justify-between border-t border-border/40">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Starting at</span>
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-xl font-black text-gray-900">
                                                    ₹{item.price.toLocaleString('en-IN')}
                                                </span>
                                                {item.rating && (
                                                    <div className="flex items-center gap-1 pl-2.5 border-l border-border/60">
                                                        <Star className="w-3.5 h-3.5 text-marigold fill-marigold" />
                                                        <span className="text-xs font-bold text-gray-700">{item.rating}</span>
                                                        {item.reviewCount && (
                                                            <span className="text-[11px] text-muted-foreground">({item.reviewCount})</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-9 h-9 rounded-full bg-spiritual-green/10 flex items-center justify-center text-spiritual-green group-hover:bg-spiritual-green group-hover:text-white group-hover:shadow-md transition-all duration-300">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Favorites;
