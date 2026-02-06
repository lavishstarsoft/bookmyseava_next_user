import { useState } from "react";
import { Menu, ShoppingCart, X, Heart, User, Home, Info, CalendarCheck, Package, Gift, HandHeart, Video, Truck, BookOpen, UserCircle, ChevronDown, MoreHorizontal, LogIn, Store, Users, UserPlus, Briefcase, Languages, Loader2, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // Check if this exists or just use sr-only class.
// Actually, better to just use standard HTML or the components with sr-only class if they support it.
// If SheetTitle renders a DialogTitle, I can class it.

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import PanchangamModal from "./PanchangamModal";
import AuthModal from "./AuthModal";
import logo from "@/assets/logo.png";
import templeIcon from "@/assets/temple-icon.png";
import Lottie from "lottie-react";
import panchangamIcon from "@/assets/panchangam-icon.json";
import liveAnimation from "@/assets/Live.json";

import { useAppConfig } from "@/hooks/useAppConfig";
import { getImageUrl } from "@/config";

interface HeaderProps {
  isLiveCardDismissed?: boolean;
  onLiveButtonClick?: () => void;
}

const Header = ({ isLiveCardDismissed, onLiveButtonClick }: HeaderProps = {}) => {
  const { t } = useTranslation();
  const [isPanchangamOpen, setIsPanchangamOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const config = useAppConfig();

  // Read user from localStorage
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.reload(); // Reload to clear any other state
  };

  const navLinks = [
    { name: t('nav.home'), href: "/", icon: Home, isImage: true, imageSrc: templeIcon },
    { name: t('nav.about'), href: "/about", icon: Info },
    { name: t('nav.bookPooja'), href: "/book-pooja", icon: CalendarCheck },
    { name: t('nav.kits'), href: "/kits", icon: Package },
    { name: t('nav.prasadam'), href: "/prasadam", icon: Gift },
    { name: t('nav.onlinePooja'), href: "/online-pooja", icon: Video },
    { name: t('nav.homeService'), href: "/home-service", icon: Truck },
    { name: t('nav.blog'), href: "/blog", icon: BookOpen },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md border-b border-border/50 shadow-card">
        {/* Top Banner */}
        {/* Top Banner */}
        {config?.headerMarqueeText && (
          <div className="hidden md:block bg-gradient-to-r from-[#FEB703] to-[#FFCB05] text-[#8D0303] py-1.5 text-center text-xs font-semibold">
            <span className="mx-2">{config.headerMarqueeText}</span>
          </div>
        )}

        {/* Main Header */}
        <div className="container relative flex h-20 items-center justify-between px-2 md:px-8">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <button
                  className="inline-flex items-center justify-center rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }}
                >
                  <Menu style={{ width: '28px', height: '28px' }} strokeWidth={2} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-card p-0 border-r-2 border-maroon/20 h-screen !max-h-screen flex flex-col">
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                <SheetDescription className="sr-only">Navigation links and user options</SheetDescription>
                <div className="flex flex-col h-full">
                  {/* User Profile Section */}
                  <div className="flex-shrink-0 p-6 bg-gradient-to-br from-maroon/10 via-maroon/5 to-marigold/10 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-maroon to-maroon-dark flex items-center justify-center shadow-lg ring-2 ring-marigold/30">
                        <UserCircle className="w-8 h-8 text-secondary-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-base">{t('auth.guestUser')}</p>
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setIsAuthOpen(true);
                          }}
                          className="text-xs text-maroon hover:text-maroon-dark font-medium transition-colors"
                        >
                          {t('auth.signIn')} →
                        </button>
                      </div>
                      <div className="flex-shrink-0 mt-5">
                        <LanguageSwitcher />
                      </div>
                    </div>
                  </div>

                  {/* Navigation Menu with Icons */}
                  <nav className="overflow-y-auto min-h-0">
                    {navLinks.map((link, index) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.name}
                          to={link.href}
                          className="flex items-center gap-4 px-6 py-3.5 text-foreground hover:bg-gradient-to-r hover:from-maroon/10 hover:to-transparent transition-all duration-200 active:bg-maroon/20 ripple group border-b border-dotted border-maroon/20"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.isImage ? (
                            <img src={link.imageSrc} alt={link.name} className="h-6 w-6 object-contain flex-shrink-0" />
                          ) : (
                            <Icon className="h-5 w-5 text-maroon group-hover:text-maroon-dark transition-colors flex-shrink-0" />
                          )}
                          <span className="font-medium text-[15px]">{link.name}</span>
                        </Link>
                      );
                    })}


                    {/* Join Us Section */}
                    <div className="flex-shrink-0 px-4 pt-3 pb-2 border-t border-dotted border-maroon/30">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                        {t('joinUs.title')}
                      </p>

                      {/* Become a Vendor */}
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          // TODO: Navigate to vendor registration
                          console.log('Navigate to Vendor Registration');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-marigold/10 transition-colors group mb-2"
                      >
                        <span className="w-8 h-8 rounded-full bg-marigold/20 flex items-center justify-center group-hover:bg-marigold/30 transition-colors">
                          <Store className="h-4 w-4 text-marigold" />
                        </span>
                        <span className="flex flex-col items-start">
                          <span className="text-sm font-semibold text-foreground">{t('joinUs.vendor')}</span>
                          <span className="text-xs text-muted-foreground">{t('joinUs.vendorDesc')}</span>
                        </span>
                      </button>

                      {/* Become a Poojari */}
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          // TODO: Navigate to poojari registration
                          console.log('Navigate to Poojari Registration');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-maroon/10 transition-colors group mb-2"
                      >
                        <span className="w-8 h-8 rounded-full bg-maroon/20 flex items-center justify-center group-hover:bg-maroon/30 transition-colors">
                          <Users className="h-4 w-4 text-maroon" />
                        </span>
                        <span className="flex flex-col items-start">
                          <span className="text-sm font-semibold text-foreground">{t('joinUs.poojari')}</span>
                          <span className="text-xs text-muted-foreground">{t('joinUs.poojariDesc')}</span>
                        </span>
                      </button>

                      {/* Become a Volunteer */}
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          // TODO: Navigate to volunteer registration
                          console.log('Navigate to Volunteer Registration');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-spiritual-green/10 transition-colors group mb-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-spiritual-green/20 flex items-center justify-center group-hover:bg-spiritual-green/30 transition-colors">
                          <HandHeart className="h-4 w-4 text-spiritual-green" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-semibold text-foreground">{t('joinUs.volunteer')}</span>
                          <span className="text-xs text-muted-foreground">{t('joinUs.volunteerDesc')}</span>
                        </div>
                      </button>

                      {/* Request Home Service */}
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          // TODO: Navigate to home service request
                          console.log('Navigate to Home Service Request');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-500/10 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                          <Briefcase className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-semibold text-foreground">{t('joinUs.homeServiceReq')}</span>
                          <span className="text-xs text-muted-foreground">{t('joinUs.homeServiceDesc')}</span>
                        </div>
                      </button>
                    </div>

                    {/* Footer Section - Fixed at bottom using mt-auto */}
                    <div className="mt-8 p-4 bg-gradient-to-t from-maroon/5 to-transparent border-t border-border/30">
                      <p className="text-xs text-center text-muted-foreground font-medium">
                        © {new Date().getFullYear()} Book My Seva
                      </p>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>



          {/* Logo - Fixed width container to prevent shifting */}
          <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex items-center justify-center" style={{ width: '80px' }}>
            <Link to="/" className="flex items-center justify-center w-20 h-20 rounded-lg overflow-hidden">
              {config?.logoUrl ? (
                <img src={getImageUrl(config.logoUrl)} alt="Book My Seva" className="w-full h-full object-contain" />
              ) : (
                <img src={logo} alt="Book My Seva" className="w-full h-full object-contain" />
              )}
            </Link>
          </div>

          {/* Desktop Navigation - Responsive based on screen size */}
          <nav className="hidden md:flex items-center gap-0.5">
            {/* Home - Always visible on all desktop sizes with Temple Icon */}
            <Link
              to={navLinks[0].href}
              className="px-2 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted whitespace-nowrap flex items-center gap-1.5"
            >
              <img src={templeIcon} alt="Home" className="h-5 w-5 md:h-5 md:w-5 lg:h-6 lg:w-6 object-contain" />
              <span className="hidden lg:inline">{navLinks[0].name}</span>
            </Link>

            {/* About Us - Always visible on all desktop sizes */}
            <Link
              to={navLinks[1].href}
              className="px-2 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted whitespace-nowrap"
            >
              {navLinks[1].name}
            </Link>

            {/* Book A Pooja - Always visible on all desktop sizes */}
            <Link
              to={navLinks[2].href}
              className="px-2 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted whitespace-nowrap"
            >
              {navLinks[2].name}
            </Link>

            {/* Pooja Kits - Hidden on md, visible on lg+ */}
            <Link
              to={navLinks[3].href}
              className="hidden lg:flex px-2 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted whitespace-nowrap"
            >
              {navLinks[3].name}
            </Link>

            {/* Prasadam - Hidden on md, visible on lg+ */}
            <Link
              to={navLinks[4].href}
              className="hidden lg:flex px-2 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted whitespace-nowrap"
            >
              {navLinks[4].name}
            </Link>

            {/* Online Pooja - Visible only on lg screens and above */}
            <Link
              to={navLinks[5].href}
              className="hidden lg:flex px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted whitespace-nowrap"
            >
              {navLinks[5].name}
            </Link>

            {/* Home Service - Visible only on lg screens and above */}
            <Link
              to={navLinks[6].href}
              className="hidden lg:flex px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted whitespace-nowrap"
            >
              {navLinks[6].name}
            </Link>

            {/* Blog - Visible only on xl screens and above */}
            <Link
              to={navLinks[7].href}
              className="hidden xl:flex px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted whitespace-nowrap"
            >
              {navLinks[7].name}
            </Link>

            {/* More Dropdown - Shows hidden items based on screen size */}
            <DropdownMenu open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className="xl:hidden px-2 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted flex items-center gap-1 whitespace-nowrap"
                  aria-label="More menu items"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span>More</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-lg">
                {/* Pooja Kits - Show in dropdown on md screens only */}
                <DropdownMenuItem asChild className="lg:hidden">
                  <Link
                    to={navLinks[3].href}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setIsMoreMenuOpen(false)}
                  >
                    <Package className="h-4 w-4 text-maroon" />
                    <span className="text-sm font-medium">{navLinks[3].name}</span>
                  </Link>
                </DropdownMenuItem>

                {/* Prasadam - Show in dropdown on md screens only */}
                <DropdownMenuItem asChild className="lg:hidden">
                  <Link
                    to={navLinks[4].href}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setIsMoreMenuOpen(false)}
                  >
                    <Gift className="h-4 w-4 text-maroon" />
                    <span className="text-sm font-medium">{navLinks[4].name}</span>
                  </Link>
                </DropdownMenuItem>

                {/* Online Pooja - Show in dropdown on md screens only */}
                <DropdownMenuItem asChild className="lg:hidden">
                  <Link
                    to={navLinks[5].href}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setIsMoreMenuOpen(false)}
                  >
                    <Video className="h-4 w-4 text-maroon" />
                    <span className="text-sm font-medium">{navLinks[5].name}</span>
                  </Link>
                </DropdownMenuItem>

                {/* Home Service - Show in dropdown on md screens only */}
                <DropdownMenuItem asChild className="lg:hidden">
                  <Link
                    to={navLinks[6].href}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setIsMoreMenuOpen(false)}
                  >
                    <Truck className="h-4 w-4 text-maroon" />
                    <span className="text-sm font-medium">{navLinks[6].name}</span>
                  </Link>
                </DropdownMenuItem>

                {/* Blog - Show in dropdown on md and lg screens */}
                <DropdownMenuItem asChild className="xl:hidden">
                  <Link
                    to={navLinks[7].href}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setIsMoreMenuOpen(false)}
                  >
                    <BookOpen className="h-4 w-4 text-maroon" />
                    <span className="text-sm font-medium">{navLinks[7].name}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-1">
            {/* Live Stream Restore Button - TV Model (Desktop) / Lottie Icon (Mobile) */}
            {isLiveCardDismissed && onLiveButtonClick && (
              <button
                onClick={onLiveButtonClick}
                className="relative group mr-2 md:mr-4 mt-1 animate-in fade-in zoom-in duration-300"
                aria-label="Watch Live"
              >
                {/* Mobile View - Simple Lottie Icon */}
                <div className="md:hidden">
                  <Lottie animationData={liveAnimation} loop={true} className="h-12 w-12" />
                </div>

                {/* Desktop View - TV Style */}
                <div className="hidden md:block">
                  {/* Antenna */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3">
                    <div className="absolute left-0 bottom-0 w-[1px] h-full bg-[#005700] rotate-[-30deg] origin-bottom"></div>
                    <div className="absolute right-0 bottom-0 w-[1px] h-full bg-[#005700] rotate-[30deg] origin-bottom"></div>
                  </div>

                  {/* Body */}
                  <div className="bg-[#008000] text-white px-2 py-1 rounded-lg shadow-[0_3px_0_#005700] active:translate-y-[1px] transition-all border-2 border-[#006400] flex items-center justify-center min-w-[60px] relative z-10">
                    {/* Screen inset effect */}
                    <div className="absolute inset-0.5 rounded-md border-2 border-[#005700]/20 pointer-events-none"></div>

                    <div className="flex items-center justify-center gap-1">
                      {/* Animated LIVE Icon */}
                      <div className="w-4 h-4">
                        <Lottie animationData={liveAnimation} loop={true} />
                      </div>
                      <span className="font-bold text-[10px] tracking-wider font-mono leading-none">LIVE</span>
                    </div>
                  </div>

                  {/* TV Stand/Legs */}
                  <div className="flex absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 justify-between px-1">
                    <div className="w-0.5 h-1.5 bg-[#005700] rotate-[-15deg]"></div>
                    <div className="w-0.5 h-1.5 bg-[#005700] rotate-[15deg]"></div>
                  </div>
                </div>
              </button>
            )}

            {/* Language Switcher - Desktop Only */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* Panchangam Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPanchangamOpen(true)}
              className="text-marigold hover:text-marigold-light hover:bg-accent"
              title="Today's Panchangam"
            >
              <Lottie animationData={panchangamIcon} loop={true} className="h-12 w-12" />
            </Button>

            {/* User Login/Register - Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hover:bg-accent hidden md:flex gap-1 px-3"
                  title="Account"
                >
                  <User className="h-5 w-5" />
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-xl">
                {user ? (
                  <>
                    <DropdownMenuLabel className="font-semibold text-foreground">
                      {t('auth.hello')}, {user.name || 'User'}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer py-2.5 px-3 group focus:bg-maroon focus:text-white transition-colors flex items-center">
                        <User className="mr-3 h-4 w-4 text-maroon group-focus:text-white transition-colors" />
                        <span className="font-medium">{t('auth.myProfile')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer py-2.5 px-3 text-red-500 group focus:bg-red-500 focus:text-white transition-colors"
                    >
                      <LogOut className="mr-3 h-4 w-4 group-focus:text-white transition-colors" />
                      <span className="font-medium">{t('auth.logout')}</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel className="font-semibold text-foreground">
                      {t('auth.myAccount')}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsAuthOpen(true)}
                      className="cursor-pointer py-2.5 px-3"
                    >
                      <LogIn className="mr-3 h-4 w-4 text-spiritual-green" />
                      <span className="font-medium">{t('auth.signIn')}</span>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1">
                  {t('joinUs.title').toUpperCase()}
                </DropdownMenuLabel>

                {/* Become a Vendor */}
                <DropdownMenuItem
                  onClick={() => {
                    // TODO: Navigate to vendor registration
                    console.log('Navigate to Vendor Registration');
                  }}
                  className="cursor-pointer py-2.5 px-3 group"
                >
                  <Store className="mr-3 h-4 w-4 text-marigold" />
                  <div className="flex flex-col">
                    <span className="font-medium">{t('joinUs.vendor')}</span>
                    <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">{t('joinUs.vendorDesc')}</span>
                  </div>
                </DropdownMenuItem>

                {/* Become a Poojari */}
                <DropdownMenuItem
                  onClick={() => {
                    // TODO: Navigate to poojari registration
                    console.log('Navigate to Poojari Registration');
                  }}
                  className="cursor-pointer py-2.5 px-3 group"
                >
                  <Users className="mr-3 h-4 w-4 text-maroon group-hover:text-spiritual-green transition-colors" />
                  <div className="flex flex-col">
                    <span className="font-medium">{t('joinUs.poojari')}</span>
                    <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">{t('joinUs.poojariDesc')}</span>
                  </div>
                </DropdownMenuItem>

                {/* Become a Volunteer */}
                <DropdownMenuItem
                  onClick={() => {
                    // TODO: Navigate to volunteer registration
                    console.log('Navigate to Volunteer Registration');
                  }}
                  className="cursor-pointer py-2.5 px-3 group"
                >
                  <HandHeart className="mr-3 h-4 w-4 text-spiritual-green" />
                  <div className="flex flex-col">
                    <span className="font-medium">{t('joinUs.volunteer')}</span>
                    <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">{t('joinUs.volunteerDesc')}</span>
                  </div>
                </DropdownMenuItem>

                {/* Request Home Service */}
                <DropdownMenuItem
                  onClick={() => {
                    // TODO: Navigate to home service request
                    console.log('Navigate to Home Service Request');
                  }}
                  className="cursor-pointer py-2.5 px-3 group"
                >
                  <Briefcase className="mr-3 h-4 w-4 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="font-medium">{t('joinUs.homeServiceReq')}</span>
                    <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">{t('joinUs.homeServiceDesc')}</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Favorite */}
            <Button variant="ghost" size="icon" className="relative hidden md:flex" title="Favourite">
              <Heart className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative hidden md:flex">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-sacred-red text-secondary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                2
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Panchangam Modal */}
      <PanchangamModal open={isPanchangamOpen} onOpenChange={setIsPanchangamOpen} />

      {/* Auth Modal */}
      <AuthModal open={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  );
};

export default Header;
