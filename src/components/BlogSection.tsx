import { Calendar, ArrowRight, Clock, User, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "@/config";
import { isTeluguText } from "@/utils/languageUtils";

interface BlogPost {
  _id: string;
  title: string;
  excerpt?: string;
  image?: string;
  category?: string;
  publishedAt?: string;
  createdAt?: string;
  author?: string;
  slug?: string;
  readTime?: string;
}

const BlogSection = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${API_URL}/blogs?status=published`);
        // Sort by date desc (if not already handled by API)
        const sorted = res.data.sort((a: BlogPost, b: BlogPost) => {
          const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
          const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        setPosts(sorted);
      } catch (err) {
        console.error("Failed to fetch blog posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return (
      <section className="py-5 md:py-15 bg-muted/30">
        <div className="container px-4">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-marigold border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null; // Don't show section if no posts
  }

  const featuredPost = posts[0];
  const regularPosts = posts.slice(1, 4); // Show next 3 posts

  return (
    <section className="py-5 md:py-15 bg-muted/30">
      <div className="container px-4">
        {/* Section Header */}
        <div className="mb-5">
          {/* Divine Knowledge Badge - Mobile */}
          <div className="flex md:hidden items-center justify-center gap-2 mb-3">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-spiritual-green"></div>
            <span className="inline-flex items-center gap-2 text-spiritual-green text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full bg-gradient-to-r from-spiritual-green/10 via-spiritual-green/20 to-spiritual-green/10 border border-spiritual-green/30">
              <BookOpen className="w-3.5 h-3.5 fill-spiritual-green animate-pulse" />
              Divine Knowledge
            </span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-spiritual-green"></div>
          </div>

          {/* Title and Link Row */}
          <div className="flex flex-row items-center justify-between">
            <div className="text-left md:text-center">
              {/* Divine Knowledge Badge - Desktop */}
              <div className="hidden md:flex items-center justify-center gap-2 mb-2">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-spiritual-green"></div>
                <span className="inline-flex items-center gap-2 text-spiritual-green text-sm font-bold tracking-wider uppercase px-4 py-2 rounded-full bg-gradient-to-r from-spiritual-green/10 via-spiritual-green/20 to-spiritual-green/10 border border-spiritual-green/30">
                  <BookOpen className="w-4 h-4 fill-spiritual-green animate-pulse" />
                  Divine Knowledge
                </span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-spiritual-green"></div>
              </div>
              <h2 className="font-teluguHeading text-2xl md:text-5xl font-bold text-maroon-dark md:mt-2">
                From Our Blog
              </h2>
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center text-spiritual-green font-medium hover:text-spiritual-green/80 transition-colors whitespace-nowrap group text-sm md:text-base"
            >
              View All Articles
              <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Blog Grid with Featured Post */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Featured Post - Spans 2 columns on desktop */}
          {featuredPost && (
            <article
              className="group relative md:col-span-2 lg:col-span-2 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-shadow h-full"
              onClick={() => window.open(`/blog/${featuredPost.slug || featuredPost._id}`, '_blank')}
            >
              {/* Large Image with Overlay */}
              <div className="relative h-full min-h-[20rem] md:min-h-[24rem] overflow-hidden">
                <img
                  src={featuredPost.image || "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop&crop=faces"}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                  <span className="inline-block bg-marigold px-3 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-lg text-maroon-dark">
                    ⭐ {featuredPost.category || 'General'}
                  </span>

                  <h3 className={`font-teluguHeading font-bold mb-3 line-clamp-2 overflow-hidden shrink-0 ${isTeluguText(featuredPost.title) ? 'text-[28px] md:text-[36px] leading-[1.6] min-h-[calc(2*1.6em)] max-h-[calc(2*1.6em)]' : 'text-2xl md:text-3xl lg:text-4xl leading-[1.4] min-h-[calc(2*1.4em)] max-h-[calc(2*1.4em)]'}`}>
                    {featuredPost.title}
                  </h3>

                  <p className={`font-teluguBody text-white/90 mb-4 line-clamp-3 max-w-2xl overflow-hidden shrink-0 ${isTeluguText(featuredPost.excerpt) ? 'text-[14px] leading-[1.8] min-h-[calc(3*1.8em)] max-h-[calc(3*1.8em)]' : 'text-[12px] leading-[1.7] min-h-[calc(3*1.7em)] max-h-[calc(3*1.7em)]'}`}>
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-white/80">
                    <span className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-marigold flex items-center justify-center text-maroon-dark font-semibold">
                        {(featuredPost.author || "A").charAt(0)}
                      </div>
                      {featuredPost.author || "Admin"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {featuredPost.publishedAt ? format(new Date(featuredPost.publishedAt), 'MMM d, yyyy') : (featuredPost.createdAt ? format(new Date(featuredPost.createdAt), 'MMM d, yyyy') : '-')}
                    </span>
                    {/* <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {featuredPost.readTime || "5 min read"}
                  </span> */}
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* Regular Posts */}
          {regularPosts.map((post) => (
            <article
              key={post._id}
              className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-border hover:border-marigold/50"
              onClick={() => window.open(`/blog/${post.slug || post._id}`, '_blank')}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image || "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop&crop=faces"}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Category Badge */}
                <span className="absolute top-3 left-3 bg-marigold/90 backdrop-blur-sm text-maroon-dark px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                  {post.category || 'General'}
                </span>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col h-full">
                <h3 className={`font-teluguHeading font-bold mb-2 line-clamp-2 group-hover:text-marigold transition-colors overflow-hidden shrink-0 ${isTeluguText(post.title) ? 'text-[18px] leading-[1.6] min-h-[calc(2*1.6em)] max-h-[calc(2*1.6em)]' : 'text-xl leading-[1.5] min-h-[calc(2*1.5em)] max-h-[calc(2*1.5em)]'}`}>
                  {post.title}
                </h3>

                <p className={`font-teluguBody text-muted-foreground line-clamp-3 mb-4 overflow-hidden shrink-0 ${isTeluguText(post.excerpt) ? 'text-[14px] leading-[1.8] min-h-[calc(3*1.8em)] max-h-[calc(3*1.8em)]' : 'text-[12px] leading-[1.7] min-h-[calc(3*1.7em)] max-h-[calc(3*1.7em)]'}`}>
                  {post.excerpt}
                </p>

                {/* Author & Meta */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-6 h-6 rounded-full bg-marigold/20 flex items-center justify-center text-marigold font-semibold">
                      {(post.author || "A").charAt(0)}
                    </div>
                    <span className="font-medium">{post.author || "Admin"}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : (post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy') : '-')}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
