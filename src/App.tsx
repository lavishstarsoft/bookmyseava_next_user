import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LiveDarshan from "./pages/LiveDarshan";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import FloatingAudioPlayer from "./components/FloatingAudioPlayer";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Layout from "./components/Layout";
import BookPooja from "./pages/BookPooja";
import PoojaDetail from "./pages/PoojaDetail";
import PoojaCheckout from "./pages/PoojaCheckout";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

persistQueryClient({
  queryClient,
  persister,
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/">
        <ScrollToTop />
        <FloatingAudioPlayer />
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/book-pooja" element={<BookPooja />} />
            <Route path="/pooja/:slug" element={<PoojaDetail />} />
            <Route path="/checkout/:slug" element={<PoojaCheckout />} />
            <Route path="/live-darshan" element={<LiveDarshan />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
