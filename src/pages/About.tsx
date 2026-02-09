import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "@/config";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Sidebar, { Sloka } from "@/components/Sidebar";

const About = () => {
    // About Content Query
    const { data: aboutContent, isLoading, error } = useQuery({
        queryKey: ["about-us"],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/content/about-us`);
            return response.data?.content || "";
        },
    });

    // Sidebar Data State
    const [gitaSlokas, setGitaSlokas] = useState<Sloka[]>([]);
    const [kidsGitaSlokas, setKidsGitaSlokas] = useState<Sloka[]>([]);

    // Fetch Sidebar Content
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

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12 text-center text-red-500">
                Failed to load content. Please try again later.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-2 md:px-8 py-8 md:py-12">
                <div className="flex gap-8 relative">
                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <h1 className="mb-8 text-3xl font-bold text-center text-primary md:text-4xl">About Us</h1>

                        <div className="w-full">
                            {aboutContent ? (
                                <div
                                    className="prose prose-orange max-w-none prose-img:rounded-xl prose-headings:text-primary"
                                    dangerouslySetInnerHTML={{ __html: typeof aboutContent === 'string' ? aboutContent : JSON.stringify(aboutContent) }}
                                />
                            ) : (
                                <div className="text-center text-muted-foreground py-12">
                                    <p>Content coming soon...</p>
                                </div>
                            )}
                        </div>
                    </main>

                    {/* Sidebar (Desktop Only) */}
                    <Sidebar gitaSlokas={gitaSlokas} kidsGitaSlokas={kidsGitaSlokas} />
                </div>
            </div>
        </div>
    );
};

export default About;
