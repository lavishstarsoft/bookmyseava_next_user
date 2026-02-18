import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import Sidebar from "@/components/Sidebar";
import { Calendar, User, ArrowLeft, Share2, MessageCircle, ArrowRight, Loader2, Sparkles, X } from "lucide-react";
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
    const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
    const shareButtonRef = useRef<HTMLButtonElement>(null);
    const { toast } = useToast();
    const footerRef = useRef<HTMLDivElement>(null);
    const [isFooterVisible, setIsFooterVisible] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Calculate dropdown position based on available space
    const handleShareClick = () => {
        if (shareButtonRef.current) {
            const rect = shareButtonRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const dropdownHeight = 220; // Approximate dropdown height

            // If not enough space below, show above
            if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
                setDropdownPosition('top');
            } else {
                setDropdownPosition('bottom');
            }
        }
        setIsShareOpen(true);
    };

    // Handle initial share click - use native share on mobile if available
    const onShareButtonClick = async () => {
        // Check if Web Share API is available (mostly mobile)
        if (navigator.share && window.innerWidth < 768) {
            try {
                await navigator.share({
                    title: post?.title || 'Book My Seva Blog',
                    text: post?.excerpt || `Read this amazing article: ${post?.title}`,
                    url: window.location.href,
                });
                // Successfully shared
            } catch (error) {
                console.log('Error sharing:', error);
                // If user cancels or error, fall back to dropdown if needed, 
                // but usually we just handle the error silently or show a toast
            }
        } else {
            // Desktop or API not supported - show custom dropdown
            handleShareClick();
        }
    };

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

    // Set Open Graph meta tags for social sharing (WhatsApp, Facebook, Twitter)
    useEffect(() => {
        if (!post) return;

        const pageUrl = window.location.href;
        const siteName = "Book My Seva";

        // Helper function to update or create meta tag
        const setMetaTag = (property: string, content: string, isName = false) => {
            const attr = isName ? 'name' : 'property';
            let element = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement;
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attr, property);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // Update page title
        document.title = `${post.title} | ${siteName}`;

        // Open Graph tags (Facebook, WhatsApp, LinkedIn)
        setMetaTag('og:type', 'article');
        setMetaTag('og:url', pageUrl);
        setMetaTag('og:title', post.title);
        setMetaTag('og:description', post.excerpt || `Read about ${post.title} on ${siteName}`);
        setMetaTag('og:site_name', siteName);
        if (post.image) {
            setMetaTag('og:image', post.image);
            setMetaTag('og:image:width', '1200');
            setMetaTag('og:image:height', '630');
        }

        // Twitter Card tags
        setMetaTag('twitter:card', 'summary_large_image', true);
        setMetaTag('twitter:title', post.title, true);
        setMetaTag('twitter:description', post.excerpt || `Read about ${post.title} on ${siteName}`, true);
        if (post.image) {
            setMetaTag('twitter:image', post.image, true);
        }

        // Cleanup function - reset to defaults when leaving page
        return () => {
            document.title = siteName;
        };
    }, [post]);

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
            <Helmet>
                <title>{post.title} | Book My Seva</title>
                <meta name="description" content={post.excerpt || `Read about ${post.title} on Book My Seva`} />
                <link rel="canonical" href={window.location.href} />

                {/* Open Graph / Facebook / WhatsApp */}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.excerpt || `Read about ${post.title} on Book My Seva`} />
                <meta property="og:site_name" content="Book My Seva" />
                {post.image && <meta property="og:image" content={post.image} />}
                {post.image && <meta property="og:image:width" content="1200" />}
                {post.image && <meta property="og:image:height" content="630" />}

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={post.title} />
                <meta name="twitter:description" content={post.excerpt || `Read about ${post.title} on Book My Seva`} />
                {post.image && <meta name="twitter:image" content={post.image} />}
            </Helmet>


            <div className="container px-4 md:px-8 pt-8 pb-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
                    {/* Main Content (70%) */}
                    <main className="flex-1 min-w-0">
                        {/* Header Content */}
                        <div className="mb-8 animate-fade-in-up">

                            <h1 className="font-teluguHeading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                                {post.title}
                            </h1>

                            {/* Main Article Image */}
                            {post.image && (
                                <div
                                    className="relative mb-6 group cursor-zoom-in md:float-right md:ml-8 md:mb-4 md:max-w-[400px] w-full"
                                    onClick={() => setIsLightboxOpen(true)}
                                >
                                    <div className="rounded-2xl overflow-hidden shadow-lg border border-border/50 transition-transform duration-300 group-hover:scale-[1.02]">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-auto object-cover max-h-[300px] md:max-h-[400px]"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                                            <Sparkles className="text-white opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 drop-shadow-lg" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-2 text-center italic md:text-right px-2">
                                        Click to enlarge image
                                    </p>
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
                                    {/* Share Button */}
                                    <button
                                        ref={shareButtonRef}
                                        onClick={onShareButtonClick}
                                        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all relative z-10"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>

                                    {/* Share Dropdown - Only for Desktop (md and above) since mobile uses native share */}
                                    {isShareOpen && (
                                        <>
                                            {/* Click outside overlay */}
                                            <div
                                                className="fixed inset-0 z-40 hidden md:block"
                                                onClick={() => setIsShareOpen(false)}
                                            />
                                            {/* Dropdown - Desktop Only */}
                                            <div
                                                className={`hidden md:block absolute right-0 w-48 bg-background border border-border rounded-xl shadow-lg p-2 z-50 animate-in fade-in duration-200 ${dropdownPosition === 'top'
                                                    ? 'bottom-full mb-2 slide-in-from-bottom-2'
                                                    : 'top-full mt-2 slide-in-from-top-2'
                                                    }`}
                                            >
                                                <div className="flex flex-col gap-1">
                                                    {/* WhatsApp */}
                                                    <button
                                                        onClick={() => handleShare('whatsapp')}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 text-sm font-medium transition-colors text-left"
                                                    >
                                                        <span className="w-6 h-6 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#25D366">
                                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                            </svg>
                                                        </span>
                                                        WhatsApp
                                                    </button>
                                                    {/* Facebook */}
                                                    <button
                                                        onClick={() => handleShare('facebook')}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 text-sm font-medium transition-colors text-left"
                                                    >
                                                        <span className="w-6 h-6 rounded-full bg-[#1877F2]/10 flex items-center justify-center">
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                            </svg>
                                                        </span>
                                                        Facebook
                                                    </button>
                                                    {/* X (Twitter) */}
                                                    <button
                                                        onClick={() => handleShare('twitter')}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 text-sm font-medium transition-colors text-left"
                                                    >
                                                        <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                            </svg>
                                                        </span>
                                                        X (Twitter)
                                                    </button>
                                                    <div className="h-px bg-border my-1" />
                                                    {/* Copy Link */}
                                                    <button
                                                        onClick={() => handleShare('copy')}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 text-sm font-medium transition-colors text-left"
                                                    >
                                                        <span className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                                            </svg>
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


                        {/* Render Content */}
                        <div className="blog-content mb-12 font-teluguBody">
                            {post.content ? (
                                <ReadOnlyEditor content={post.content} />
                            ) : (
                                <p className="text-muted-foreground">{post.excerpt}</p>
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
                                                <h4 className="font-teluguHeading font-bold text-lg text-foreground leading-tight mb-2 group-hover:text-maroon transition-colors line-clamp-2 md:min-h-[3.5rem]">
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

            {/* Image Lightbox */}
            {isLightboxOpen && post.image && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full bg-white/10 transition-colors"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={post.image}
                        alt={post.title}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                    />
                </div>
            )}

            <div ref={footerRef} />
        </div >
    );
};

export default BlogPost;
