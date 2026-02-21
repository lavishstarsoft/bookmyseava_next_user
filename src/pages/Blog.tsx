
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Calendar, Clock, ArrowRight, Search, Sparkles, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import axios from "axios";
import { format } from "date-fns";
import { API_URL } from "@/config";
import { isTeluguText } from "@/utils/languageUtils";

const Blog = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const resultsRef = useRef<HTMLDivElement>(null);

    // Dynamic Data State
    interface BlogPost {
        _id: string;
        title: string;
        excerpt?: string;
        image?: string;
        category?: string;
        publishedAt?: string;
        createdAt?: string;
        slug?: string;
        author?: string;
    }

    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<string[]>(["All"]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Categories
                const catRes = await axios.get(`${API_URL}/categories`);
                const catNames = catRes.data.map((c: { name: string }) => c.name);
                setCategories(["All", ...catNames]);

                // Fetch Blogs
                const blogRes = await axios.get(`${API_URL}/blogs?status=published`);
                setPosts(blogRes.data);
            } catch (err) {
                console.error("Failed to fetch blog data", err);
                setError("Failed to load content. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredPosts = posts.filter((post) => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Calculate pagination logic
    const indexOfLastPost = currentPage * itemsPerPage;
    const indexOfFirstPost = indexOfLastPost - itemsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

    // Scroll to results when page changes (but not on initial load)
    useEffect(() => {
        if (currentPage > 1) {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [currentPage]);

    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-marigold" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative pt-20 pb-8 md:pt-20 md:pb-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-marigold/10 to-transparent" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-maroon/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-spiritual-green/5 rounded-full blur-2xl -translate-x-1/3 translate-y-1/3" />

                <div className="container px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="inline-flex items-center gap-2 text-maroon font-bold text-sm tracking-wider uppercase mb-4 px-4 py-2 bg-maroon/5 rounded-full border border-maroon/10">
                            <Sparkles className="w-4 h-4 text-marigold animate-pulse" />
                            Sacred Knowledge
                        </span>
                        <h1 className="font-teluguHeading text-4xl md:text-6xl font-bold text-maroon-dark mb-6 leading-tight">
                            Divine Knowledge Center
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                            Explore our collection of articles on spiritual wisdom, festival traditions, and sacred rituals to enrich your devotional journey.
                        </p>
                    </div>

                    {/* Search & Filter */}
                    <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-lg border border-border/50 p-4 md:p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-marigold/50 focus:border-marigold transition-all"
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar mask-linear-fade pr-16">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-300 ${selectedCategory === cat
                                            ? "bg-maroon text-white shadow-lg shadow-maroon/20"
                                            : "bg-muted/50 text-muted-foreground hover:bg-marigold/10 hover:text-maroon"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>



                    {/* All Posts Grid */}
                    <div className="mb-8" ref={resultsRef}>
                        <h3 className="font-teluguHeading text-2xl md:text-3xl font-bold text-foreground mb-8 text-center md:text-left pt-2">
                            {searchTerm || selectedCategory !== "All" ? "Search Results" : "Latest Articles"}
                        </h3>

                        {currentPosts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {currentPosts.map((post, index) => (
                                    <article
                                        key={post._id}
                                        onClick={() => window.open(`/blog/${post.slug || post._id}`, '_blank')}
                                        className="group bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-border h-full flex flex-col hover:-translate-y-1 cursor-pointer"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {/* Image */}
                                        <div className="relative h-56 overflow-hidden bg-muted">
                                            {post.image ? (
                                                <img
                                                    src={post.image}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    <Sparkles className="h-10 w-10 opacity-20" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                            {post.category && (
                                                <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-maroon px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                    {post.category}
                                                </span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 flex flex-col flex-1 relative">
                                            {/* Decorative Border Bottom */}
                                            <div className="absolute bottom-0 left-0 h-1 w-0 bg-marigold group-hover:w-full transition-all duration-500" />

                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : (post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy') : '-')}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> 5 min read
                                                </span>
                                            </div>

                                            <h3 className={`font-teluguHeading font-bold text-foreground mb-3 group-hover:text-maroon transition-colors line-clamp-2 overflow-hidden ${isTeluguText(post.title) ? 'text-[20px] leading-[1.6] h-[calc(2*1.6em)]' : 'text-[18px] leading-[1.5] h-[calc(2*1.5em)]'}`}>
                                                {post.title}
                                            </h3>

                                            <p
                                                className={`font-teluguBody text-muted-foreground line-clamp-3 mb-6 flex-1 overflow-hidden ${isTeluguText(post.excerpt) ? 'text-[14px] leading-[1.8] h-[calc(3*1.8em)]' : 'text-[12px] leading-[1.7] h-[calc(3*1.7em)]'}`}
                                            >
                                                {post.excerpt || "No summary available."}
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                                                <span className="text-xs font-medium text-foreground/80">
                                                    By {post.author || "Admin"}
                                                </span>
                                                <span className="text-sm font-bold text-marigold flex items-center group-hover:underline">
                                                    Read More <ArrowRight className="h-3 w-3 ml-1" />
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">No articles found</h3>
                                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                                <button
                                    onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}
                                    className="mt-4 text-marigold font-medium hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        {/* Enhanced Pagination Controls */}
                        {totalPages > 1 && (
                            <nav className="flex justify-center items-center gap-3 mt-16 mb-12 animate-fade-in-up" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="group flex items-center gap-2 px-4 py-2 rounded-full border border-marigold/30 bg-card hover:bg-marigold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-maroon font-medium shadow-sm hover:shadow-md active:scale-95"
                                >
                                    <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                    <span>Previous</span>
                                </button>

                                <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-full">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-full font-bold text-sm transition-all flex items-center justify-center relative overflow-hidden ${currentPage === page
                                                ? "bg-marigold text-maroon shadow-lg scale-105"
                                                : "hover:bg-marigold/20 text-muted-foreground hover:text-maroon"
                                                }`}
                                        >
                                            {page}
                                            {currentPage === page && (
                                                <span className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="group flex items-center gap-2 px-4 py-2 rounded-full border border-marigold/30 bg-card hover:bg-marigold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-maroon font-medium shadow-sm hover:shadow-md active:scale-95"
                                >
                                    <span>Next</span>
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </nav>
                        )}
                    </div>

                    {/* Newsletter Section */}
                    <div className="bg-gradient-to-br from-maroon to-maroon-dark rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-marigold/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-spiritual-green/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <BookOpen className="w-12 h-12 text-marigold mx-auto mb-6 opacity-90" />
                            <h2 className="font-teluguHeading text-3xl md:text-4xl font-bold mb-4">Stay Connected to the Divine</h2>
                            <p className="text-white/80 mb-8 text-lg">
                                Subscribe to our newsletter for weekly spiritual insights, festival changes, and sacred stories delivered to your inbox.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 transition-all backdrop-blur-sm"
                                />
                                <button className="bg-marigold text-maroon-dark font-bold px-8 py-3 rounded-xl hover:bg-white hover:scale-105 transition-all shadow-lg active:scale-95">
                                    Subscribe
                                </button>
                            </div>
                            <p className="text-xs text-white/40 mt-4">No spam, just blessings. Unsubscribe anytime.</p>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default Blog;
