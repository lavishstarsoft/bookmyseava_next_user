import { useState, useEffect } from "react";
import { Sun, Moon, Calendar, Clock, Star, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { API_URL } from "@/config";
import { format } from "date-fns";
import FestivalBookingModal from "./FestivalBookingModal";
import { toast } from "sonner";

interface PanchangamData {
    samvatsaram: string;
    maasam: string;
    tithi: string;
    nakshatra: string;
    yoga: string;
    karana: string;
    sunrise: string;
    sunset: string;
    rahu: string;
    auspiciousTime: string;
    specialEventName?: string;
    specialEventDeity?: string;
    specialEventPooja?: string;
    specialEventImage?: string;
    specialEventBookingLink?: string;
    bookingButtonLabel?: string;
    isBookingEnabled?: boolean;
    formFields?: any[];
}

const PanchangamSection = () => {
    const [data, setData] = useState<PanchangamData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const today = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const englishDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const dayName = dayNames[today.getDay()];

    const dayRecommendations: Record<string, { deity: string; pooja: string; icon: string; teluguDeity: string; teluguPooja: string }> = {
        Sunday: { deity: "Surya Bhagavan", pooja: "Surya Namaskar Pooja", icon: "☀️", teluguDeity: "సూర్య భగవాన్", teluguPooja: "సూర్య నమస్కార పూజ" },
        Monday: { deity: "Lord Shiva", pooja: "Rudrabhishekam", icon: "🔱", teluguDeity: "శివుడు", teluguPooja: "రుద్రాభిషేకం" },
        Tuesday: { deity: "Lord Hanuman", pooja: "Hanuman Chalisa Path", icon: "🙏", teluguDeity: "హనుమాన్", teluguPooja: "హనుమాన్ చాలీసా పాఠం" },
        Wednesday: { deity: "Lord Ganesha", pooja: "Ganapati Homam", icon: "🪔", teluguDeity: "గణేశుడు", teluguPooja: "గణపతి హోమం" },
        Thursday: { deity: "Lord Vishnu", pooja: "Vishnu Sahasranama", icon: "🔯", teluguDeity: "విష్ణువు", teluguPooja: "విష్ణు సహస్రనామం" },
        Friday: { deity: "Goddess Lakshmi", pooja: "Lakshmi Pooja", icon: "🌸", teluguDeity: "లక్ష్మీ దేవి", teluguPooja: "లక్ష్మీ పూజ" },
        Saturday: { deity: "Lord Shani", pooja: "Shani Shanti Pooja", icon: "🪐", teluguDeity: "శని దేవుడు", teluguPooja: "శని శాంతి పూజ" },
    };

    const defaultRec = dayRecommendations[dayName];

    useEffect(() => {
        const fetchPanchangam = async () => {
            try {
                const dateStr = format(new Date(), "yyyy-MM-dd");
                const response = await axios.get(`${API_URL.replace('/api', '/api/v1')}/content/panchangam?date=${dateStr}`);
                // Only set data if it has actual panchangam fields (not just message)
                if (response.data && response.data.tithi) {
                    setData(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch panchangam:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPanchangam();
    }, []);

    const handleBookNow = () => {
        if (data?.specialEventBookingLink) {
            window.open(data.specialEventBookingLink, "_blank");
            return;
        }

        if (data?.isBookingEnabled) {
            setIsModalOpen(true);
        } else {
            toast.info("Booking not currently available for this event.");
        }
    };

    // Construct "festivalData" object for the modal
    const modalData = data ? {
        type: "panchangam", // Enquiry type for backend categorization
        identifier: "daily-panchangam", // Fixed identifier for backend tracking
        name: data.specialEventName || defaultRec.deity,
        formFields: data.formFields || []
    } : null;

    if (isLoading) {
        return (
            <div className="py-12 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#8D0303]" />
            </div>
        );
    }

    // Use fetched data or fallbacks when no data from backend
    const displayData = data || {
        samvatsaram: "Shri Vishvavasu",
        maasam: "Magha Maasam",
        tithi: "Data not available",
        nakshatra: "Data not available",
        yoga: "—",
        karana: "—",
        rahu: "Please check later",
        sunrise: "—",
        sunset: "—",
        auspiciousTime: "Please check later"
    };

    // Determine Logic for Right Panel (Special Event vs Default Day)
    const isSpecialEvent = !!data?.specialEventName;
    const currentEvent = {
        name: data?.specialEventName || "Today's Event",
        deity: data?.specialEventDeity || defaultRec.deity,
        pooja: data?.specialEventPooja || defaultRec.pooja,
        icon: isSpecialEvent ? "✨" : defaultRec.icon,
        image: data?.specialEventImage
    };

    return (
        <section className="relative bg-gradient-to-br from-[#FEB703] via-[#FFCB05] to-[#FEB703] py-6 md:py-8 overflow-hidden rounded-2xl lg:rounded-3xl mt-6 shadow-xl">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8D0303]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8D0303]/5 rounded-full blur-3xl" />

            <div className="relative container px-4 md:px-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <p className="text-[#8D0303] text-sm font-semibold mb-1">Today's Panchangam</p>
                    <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#8D0303]">Daily Panchangam</h2>
                    <p className="text-[#8D0303]/70 text-sm mt-1 font-medium">Daily devotional information and auspicious timings</p>
                </div>

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-[1fr,auto] gap-4 md:gap-6">
                    {/* Left Side - Panchangam Details */}
                    <div className="space-y-4">
                        {/* Date Card */}
                        <div className="bg-white border-2 border-[#8D0303]/10 rounded-xl p-4 shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="bg-[#8D0303]/10 rounded-lg p-3 flex items-center justify-center min-w-[70px]">
                                    <div className="text-center">
                                        <Calendar className="h-5 w-5 text-[#8D0303] mx-auto mb-1" />
                                        <p className="text-2xl font-bold text-[#8D0303]">{today.getDate()}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[#8D0303]/70 text-sm font-medium">{englishDays[today.getDay()]}</p>
                                    <p className="text-[#8D0303] font-semibold">{monthNames[today.getMonth()]} {today.getFullYear()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Panchangam Grid */}
                        <div className="grid grid-cols-1 gap-3">
                            <div className="bg-white border-2 border-[#8D0303]/10 rounded-xl p-4 shadow-md text-center">
                                <p className="text-[#8D0303] font-bold text-lg mb-1">{displayData.samvatsaram}</p>
                                <p className="text-[#8D0303]/80 font-semibold">{displayData.maasam}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <PanchangamItem icon={<Calendar className="h-4 w-4" />} label="Tithi" value={displayData.tithi} />
                            <PanchangamItem icon={<Star className="h-4 w-4" />} label="Nakshatra" value={displayData.nakshatra} />
                            <PanchangamItem icon={<Sun className="h-4 w-4" />} label="Yoga" value={displayData.yoga} />
                            <PanchangamItem icon={<Moon className="h-4 w-4" />} label="Karana" value={displayData.karana} />
                        </div>

                        {/* Time Sections */}
                        <div className="grid md:grid-cols-2 gap-3">
                            {/* Rahu Kalam */}
                            <div className="bg-white border-2 border-[#8D0303]/30 rounded-lg p-4 shadow-md">
                                <div className="flex items-center gap-2 text-[#8D0303] font-semibold mb-2 text-sm">
                                    <Clock className="h-5 w-5" />
                                    <span>Rahu Kalam</span>
                                </div>
                                <p className="text-[#8D0303] text-sm font-medium">{displayData.rahu}</p>
                            </div>

                            {/* Auspicious Time */}
                            <div className="bg-white border-2 border-[#00BD40]/40 rounded-lg p-4 shadow-md">
                                <div className="flex items-center gap-2 text-[#00BD40] font-semibold mb-2 text-sm">
                                    <Clock className="h-5 w-5" />
                                    <span>Shubh Muhurat</span>
                                </div>
                                <p className="text-[#8D0303] text-sm font-medium">{displayData.auspiciousTime}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Today's Event */}
                    <div className="md:w-[280px]">
                        <div className="bg-white border-2 border-[#8D0303]/20 rounded-xl p-4 h-full shadow-lg relative overflow-hidden group">

                            {/* Image Background if available */}
                            {currentEvent.image && (
                                <div className="absolute inset-0">
                                    <img src={currentEvent.image} alt={currentEvent.name} className="w-full h-full object-cover opacity-20" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                                </div>
                            )}

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-3">
                                    <Star className="h-4 w-4 text-[#8D0303] fill-[#8D0303]" />
                                    <span className="font-semibold text-[#8D0303] text-sm">
                                        {isSpecialEvent ? "Special Occasion" : "Today's Event"}
                                    </span>
                                </div>

                                <div className="text-center mb-4 flex-1 flex flex-col justify-center">
                                    {!currentEvent.image && <span className="text-5xl mb-2 block">{currentEvent.icon}</span>}
                                    <h3 className="text-xl font-bold text-[#8D0303] leading-tight mb-1">{currentEvent.name}</h3>
                                    {isSpecialEvent && data?.specialEventName && (
                                        <p className="text-[#8D0303] font-semibold text-sm">{currentEvent.deity}</p>
                                    )}
                                    {!isSpecialEvent && (
                                        <p className="text-[#8D0303] font-semibold mt-2">{currentEvent.deity}</p>
                                    )}
                                </div>

                                <div className="bg-[#8D0303]/10 rounded-lg p-3 mb-3 border border-[#8D0303]/20 backdrop-blur-sm">
                                    <p className="text-[#8D0303] font-heading font-bold text-center text-sm">{currentEvent.pooja}</p>
                                    <p className="text-[#8D0303]/70 text-[10px] text-center mt-1 font-medium uppercase tracking-wide">
                                        {isSpecialEvent ? "Special Pooja" : "Recommended"}
                                    </p>
                                </div>

                                {/* Only show button if booking is enabled OR booking link is provided */}
                                {(data?.isBookingEnabled || data?.specialEventBookingLink) && (
                                    <Button
                                        onClick={handleBookNow}
                                        variant="sacred"
                                        size="sm"
                                        className="w-full group bg-[#00BD40] hover:bg-[#00BD40]/90 text-white border-none shadow-md hover:shadow-lg hover:shadow-[#00BD40]/30"
                                    >
                                        {data?.bookingButtonLabel || "Book Now"}
                                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dynamic Booking Modal */}
            <FestivalBookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                festivalData={modalData}
            />
        </section>
    );
};

const PanchangamItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="bg-white border border-[#8D0303]/10 rounded-lg p-3 shadow-md">
        <div className="flex items-center gap-1.5 text-[#8D0303]/70 text-xs font-medium mb-1.5">
            {icon}
            <span>{label}</span>
        </div>
        <p className="text-sm font-semibold text-[#8D0303]">{value}</p>
    </div>
);

export default PanchangamSection;
