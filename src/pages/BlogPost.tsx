import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { Calendar, User, ArrowLeft, Share2, MessageCircle, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { format } from "date-fns";
import ReadOnlyEditor from "@/components/editor/ReadOnlyEditor";
import { API_URL } from "@/config";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const BlogPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isShareOpen, setIsShareOpen] = useState(false);
    const { toast } = useToast();
    const footerRef = useRef<HTMLDivElement>(null);
    const [isFooterVisible, setIsFooterVisible] = useState(false);

    interface BlogPost {
        _id: string;
        title: string;
        content?: string | object;
        excerpt?: string;
        image?: string;
        category?: string;
        publishedAt?: string;
        createdAt?: string;
        slug?: string;
        author?: string;
    }

    // Dynamic Data State
    const [post, setPost] = useState<BlogPost | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPost = async () => {
            try {
                if (!id) return;
                const res = await axios.get(`${API_URL}/blogs/${id}`);
                setPost(res.data);

                // Fetch related (all published for now, filter client side)
                const allRes = await axios.get(`${API_URL}/blogs?status=published`);
                const others = allRes.data.filter((p: BlogPost) => p._id !== res.data._id && p.category === res.data.category);
                setRelatedPosts(others);

            } catch (err) {
                console.error(err);
                setError("Failed to load article");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
        // Scroll to top
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsFooterVisible(entry.isIntersecting);
            },
            {
                root: null,
                threshold: 0.1, // Trigger when 10% of footer is visible
            }
        );

        if (footerRef.current) {
            observer.observe(footerRef.current);
        }

        return () => {
            if (footerRef.current) {
                observer.unobserve(footerRef.current);
            }
        };
    }, []);


    const handleShare = (platform: string) => {
        const url = window.location.href;
        const text = `Read this amazing article: ${post?.title}`;

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
                    .then(() => {
                        toast({
                            title: "Link Copied",
                            description: "The article link has been copied to your clipboard.",
                        });
                    })
                    .catch((err) => {
                        console.error('Failed to copy: ', err);
                        toast({
                            variant: "destructive",
                            title: "Failed to copy link",
                            description: "Please copy the link manually from your browser address bar.",
                        });
                    });
                break;
        }
        setIsShareOpen(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-marigold" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-maroon mb-4">Article Not Found</h1>
                <button
                    onClick={() => navigate("/blog")}
                    className="text-marigold font-medium hover:underline flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Blog
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">


            <div className="container px-4 md:px-8 pt-8 pb-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
                    {/* Main Content (70%) */}
                    <main className="flex-1 min-w-0">
                        {/* Header Content */}
                        <div className="mb-8 animate-fade-in-up">

                            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                                {post.title}
                            </h1>

                            {/* Main Article Image */}
                            {post.image && (
                                <div className="rounded-2xl overflow-hidden shadow-xl aspect-video mb-6 border border-border/50">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-4 mb-8">
                                <div className="flex-1 min-w-0 flex items-center gap-4 overflow-x-auto pb-2 -mb-2 hide-scrollbar md:flex-wrap md:overflow-visible md:pb-0 md:mb-0 mask-linear-fade">
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                        <div className="w-8 h-8 rounded-full bg-maroon/10 flex items-center justify-center text-maroon font-bold border border-maroon/20 shrink-0">
                                            {(post.author || "A").charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium text-foreground/80">{post.author || "Admin"}</span>
                                    </div>

                                    <div className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-foreground/80">
                                        <Calendar className="w-4 h-4 text-marigold shrink-0" />
                                        <span>
                                            {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : (post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy') : '-')}
                                        </span>
                                    </div>

                                    {/* <div className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-foreground/80">
                                        <Clock className="w-4 h-4 text-marigold shrink-0" />
                                        <span>5 min read</span>
                                    </div> */}
                                    <span className="inline-block bg-marigold text-maroon-dark px-3 py-1 rounded-full text-xs font-bold shadow-sm whitespace-nowrap">
                                        {post.category}
                                    </span>
                                    {/* Spacer to prevent mask from hiding last item */}
                                    <div className="w-8 shrink-0 md:hidden" />
                                </div>





                                <div className="relative shrink-0">
                                    <Popover open={isShareOpen} onOpenChange={setIsShareOpen}>
                                        <PopoverTrigger asChild>
                                            <button
                                                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all relative z-10"
                                            >
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-48 p-2"
                                            align="end"
                                            side="bottom"
                                            sideOffset={8}
                                            collisionPadding={20}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => handleShare('whatsapp')}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 text-sm font-medium transition-colors text-left"
                                                >
                                                    <span className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                    </span>
                                                    WhatsApp
                                                </button>
                                                <button
                                                    onClick={() => handleShare('facebook')}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 text-sm font-medium transition-colors text-left"
                                                >
                                                    <span className="w-6 h-6 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600">
                                                        <Share2 className="w-3.5 h-3.5" />
                                                    </span>
                                                    Facebook
                                                </button>
                                                <button
                                                    onClick={() => handleShare('twitter')}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 text-sm font-medium transition-colors text-left"
                                                >
                                                    <span className="w-6 h-6 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
                                                        <Share2 className="w-3.5 h-3.5" />
                                                    </span>
                                                    Twitter
                                                </button>
                                                <div className="h-px bg-border my-1" />
                                                <button
                                                    onClick={() => handleShare('copy')}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 text-sm font-medium transition-colors text-left"
                                                >
                                                    <span className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                                                        <Share2 className="w-3.5 h-3.5" />
                                                    </span>
                                                    Copy Link
                                                </button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>


                        {/* Render Content */}
                        <div className="blog-content mb-12">
                            {post.content ? (
                                <ReadOnlyEditor content={post.content} />
                            ) : (
                                <p className="text-lg text-muted-foreground">{post.excerpt}</p>
                            )}
                        </div>

                        {/* Related Posts Section */}
                        <div className="mt-12 pt-8 border-t border-border">
                            <h3 className="font-heading text-2xl font-bold text-foreground mb-6">Related Articles</h3>

                            <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar items-stretch md:grid md:grid-cols-3 md:overflow-visible">
                                {relatedPosts
                                    .slice(0, 3)
                                    .map(relatedPost => (
                                        <div
                                            key={relatedPost._id}
                                            className="min-w-[85%] sm:min-w-[300px] md:min-w-0 snap-center bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full"
                                            onClick={() => navigate(`/blog/${relatedPost.slug || relatedPost._id}`)}
                                        >
                                            <div className="aspect-video w-full overflow-hidden">
                                                {relatedPost.image ? (
                                                    <img
                                                        src={relatedPost.image}
                                                        alt={relatedPost.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                                        <Sparkles className="h-8 w-8 text-muted-foreground opacity-30" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 md:p-4 flex flex-col flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-semibold text-maroon bg-maroon/5 px-2 py-0.5 rounded-full">
                                                        {relatedPost.category}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {relatedPost.publishedAt ? format(new Date(relatedPost.publishedAt), 'MMM d') : '-'}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-lg text-foreground leading-tight mb-2 group-hover:text-maroon transition-colors line-clamp-2 md:min-h-[3.5rem]">
                                                    {relatedPost.title}
                                                </h4>
                                                <div className="flex items-center gap-1 text-sm font-medium text-marigold">
                                                    Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            {relatedPosts.length === 0 && (
                                <p className="text-muted-foreground italic">No related articles found for this category.</p>
                            )}
                        </div>

                        {/* Engagement Actions */}

                    </main >

                    {/* Sidebar (30%) */}
                    < aside className="hidden lg:block lg:flex-[0.3] min-w-[300px]" >
                        <div className="sticky top-24">
                            <Sidebar />
                        </div>
                    </aside >
                </div >
            </div >

            {/* Floating Back Button - Android Native Feel */}
            {/* Floating Back Button - Android Native Feel */}
            {/* Floating Back Button - Android Native Feel */}
            <Link
                to="/blog"
                className={`fixed bottom-24 left-6 md:bottom-8 md:left-8 z-50 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] text-maroon rounded-full hover:scale-105 active:scale-95 transition-all duration-300 group hover:bg-white/20 hover:border-marigold/30 ${isFooterVisible ? 'opacity-0 scale-50 pointer-events-none translate-y-10' : 'opacity-100 scale-100 translate-y-0 animate-slide-in-left'}`}
                aria-label="Back to Blog"
            >
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform text-white md:text-maroon drop-shadow-md md:drop-shadow-none" />
            </Link>

            <div ref={footerRef} />
        </div >
    );
};

export default BlogPost;
