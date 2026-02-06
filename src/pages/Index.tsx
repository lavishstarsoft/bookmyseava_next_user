import { useState, useEffect } from "react";
import MantraMarquee from "@/components/MantraMarquee";
import HeroSection from "@/components/HeroSection";
import FeaturedExcellence from "@/components/FeaturedExcellence";
import PanchangamSection from "@/components/PanchangamSection";
import ServicesSection from "@/components/ServicesSection";
import TrustBadges from "@/components/TrustBadges";
import Testimonials from "@/components/Testimonials";
import BlogSection from "@/components/BlogSection";
import Sidebar, { Sloka } from "@/components/Sidebar";
import axios from "axios";
import { API_URL } from "@/config";
import FestivalCountdown from "@/components/FestivalCountdown";
import DevotionalSongs from "@/components/DevotionalSongs";
import VolunteerOpportunities from "@/components/VolunteerOpportunities";
import { Smartphone, BookOpen, Heart, Sparkles, Star } from "lucide-react";
import appStore from "@/assets/app-store.png";
import playStore from "@/assets/play-store.png";



const Index = () => {
  const [gitaSlokas, setGitaSlokas] = useState<Sloka[]>([]);
  const [kidsGitaSlokas, setKidsGitaSlokas] = useState<Sloka[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [gitaRes, kidsRes] = await Promise.all([
          axios.get(`${API_URL.replace('/api', '/api/v1')}/content/gita-sloka?type=gita`),
          axios.get(`${API_URL.replace('/api', '/api/v1')}/content/gita-sloka?type=kids-gita`)
        ]);
        if (gitaRes.data) setGitaSlokas(gitaRes.data);
        if (kidsRes.data) setKidsGitaSlokas(kidsRes.data);
      } catch (error) {
        console.error("Failed to fetch Gita content:", error);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Mantra Marquee */}
      <MantraMarquee />

      {/* Main Content with Sidebar (Desktop) */}
      <div className="container px-2 md:px-8">
        <div className="flex gap-8 py-2 md:py-8 relative">
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Hero Section */}
            <HeroSection />

            {/* Mobile Festival Countdown */}
            <div className="lg:hidden my-8">
              <FestivalCountdown />
            </div>

            {/* Mobile Download App */}
            <div className="lg:hidden mb-8">
              <div className="card-sacred p-5 relative overflow-hidden group">
                {/* Decorative glow */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-marigold/10 rounded-full blur-2xl group-hover:bg-marigold/20 transition-colors duration-500" />

                <div className="relative text-center">
                  <div className="flex items-center gap-2 mb-4 justify-center">
                    <div className="p-2 bg-marigold/10 rounded-lg">
                      <Smartphone className="h-5 w-5 text-marigold" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-foreground">Download App</h3>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    Get the best experience with our mobile app
                  </p>

                  <div className="flex flex-row gap-3 justify-center">
                    <a href="#" className="hover:opacity-80 transition-opacity">
                      <img src={playStore} alt="Get it on Google Play" className="h-10 w-auto" />
                    </a>
                    <a href="#" className="hover:opacity-80 transition-opacity">
                      <img src={appStore} alt="Download on the App Store" className="h-10 w-auto" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <ServicesSection />

            {/* Trust Badges */}
            <TrustBadges />

            {/* Featured Excellence - Champions Podium */}
            <FeaturedExcellence />

            {/* Panchangam Section */}
            <PanchangamSection />

            {/* Devotional Songs */}
            {/* <DevotionalSongs /> */}

            {/* Volunteer Opportunities */}
            <VolunteerOpportunities />

            {/* Testimonials */}
            <Testimonials />

            {/* Divine Knowledge Center - Mobile */}
            <div className="lg:hidden mb-8">
              <div className="text-center mb-6">
                <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
                  Divine Knowledge Center
                </h2>
                <p className="text-muted-foreground text-sm">
                  Wisdom from sacred scriptures for spiritual growth
                </p>
              </div>

              {/* Mobile Bhagavad Gita Section */}
              <div className="card-sacred p-5 relative overflow-hidden group mb-6">
                {/* Decorative glow */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-marigold/10 rounded-full blur-2xl group-hover:bg-marigold/20 transition-colors duration-500" />
                <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-spiritual-green/5 rounded-full blur-3xl" />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-br from-marigold/20 to-maroon/20 rounded-lg">
                      <BookOpen className="h-5 w-5 text-marigold" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-foreground">Bhagavad Gita</h3>
                    <Sparkles className="h-4 w-4 text-marigold ml-auto animate-pulse" />
                  </div>

                  <div className="space-y-3">
                    {gitaSlokas.map((sloka, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl border border-marigold/10"
                      >
                        {/* Chapter & Verse Reference */}
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-xs font-bold text-white bg-spiritual-green px-3 py-1.5 rounded-md shadow-md">
                            Chapter {sloka.chapter} : Verse {sloka.verse}
                          </span>
                          <span className="text-xs text-muted-foreground italic">{sloka.theme}</span>
                        </div>

                        {/* Telugu Sloka */}
                        <p className="text-sm font-semibold mb-2.5 leading-relaxed font-serif text-foreground/90">
                          {sloka.telugu}
                        </p>

                        {/* English Translation */}
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {sloka.translation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Gita for Kids Section */}
              <div className="card-sacred p-5 relative overflow-hidden group">
                {/* Enhanced decorative elements matching sacred theme */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-marigold/10 rounded-full blur-2xl group-hover:bg-marigold/20 transition-colors duration-500" />
                <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-spiritual-green/5 rounded-full blur-3xl" />
                <div className="absolute bottom-4 right-1/4 w-20 h-20 bg-maroon/5 rounded-full blur-2xl" />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-br from-marigold/20 to-spiritual-green/20 rounded-lg">
                      <Heart className="h-5 w-5 text-marigold" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-foreground">Gita for Kids</h3>
                    <Star className="h-4 w-4 text-marigold ml-auto animate-pulse" />
                  </div>

                  <p className="text-xs text-muted-foreground mb-4 italic">
                    ✨ Simple wisdom from Bhagavad Gita for young minds
                  </p>

                  <div className="space-y-3">
                    {kidsGitaSlokas.map((sloka, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl border border-marigold/20 hover:border-marigold/40 transition-all duration-300 hover:shadow-lg group/card"
                      >
                        {/* Title with Emoji */}
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="text-xl group-hover/card:scale-110 transition-transform">{sloka.emoji}</span>
                          <h4 className="font-bold text-sm text-foreground">{sloka.title}</h4>
                        </div>

                        {/* Telugu Text */}
                        <p className="text-xs font-semibold text-foreground/90 mb-2.5 leading-relaxed font-serif">
                          {sloka.telugu}
                        </p>

                        {/* Simple Translation */}
                        <div className="flex items-start gap-2 p-2 bg-marigold/5 rounded-lg border-l-2 border-marigold/40">
                          <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                            {sloka.simpleTranslation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-gradient-to-r from-marigold/10 to-spiritual-green/10 rounded-lg border border-marigold/30">
                    <p className="text-xs text-center text-foreground/70 font-semibold">
                      🌟 Teaching values through sacred stories
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Blog Section */}
            <BlogSection />
          </main>

          {/* Sidebar (Desktop Only) - with relative parent for sticky positioning */}
          <Sidebar gitaSlokas={gitaSlokas} kidsGitaSlokas={kidsGitaSlokas} />
        </div>
      </div>
    </div>
  );
};

export default Index;
