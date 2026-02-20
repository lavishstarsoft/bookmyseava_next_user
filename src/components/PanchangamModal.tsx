import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sun, Moon, Calendar, Clock, Star, Loader2 } from "lucide-react";
import axios from "axios";
import { API_URL } from "@/config";
import { format } from "date-fns";

interface PanchangamData {
  samvatsaram: string;
  maasam: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  rahu: string;
  auspiciousTime: string;
}

interface PanchangamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PanchangamModal = ({ open, onOpenChange }: PanchangamModalProps) => {
  const [data, setData] = useState<PanchangamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  useEffect(() => {
    if (!open) return; // Only fetch when modal opens

    const fetchPanchangam = async () => {
      setIsLoading(true);
      try {
        const dateStr = format(new Date(), "yyyy-MM-dd");
        const response = await axios.get(`${API_URL.replace('/api', '/api/v1')}/content/panchangam?date=${dateStr}`);
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
  }, [open]);

  // Fallback data when API returns nothing
  const displayData = data || {
    samvatsaram: "శ్రీ విశ్వావసు నామ సంవత్సరం",
    maasam: "మాఘ మాసం",
    tithi: "Data not available",
    nakshatra: "Data not available",
    yoga: "—",
    karana: "—",
    sunrise: "—",
    sunset: "—",
    moonrise: "—",
    rahu: "Please check later",
    auspiciousTime: "Please check later",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#FEB703] via-[#FFCB05] to-[#FEB703] border-maroon/40 border-2 animate-slide-up shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-2xl text-[#8D0303]">
            <Sun className="h-6 w-6 text-[#8D0303]" />
            Today's Panchangam
          </DialogTitle>
          <DialogDescription className="sr-only">
            Daily panchangam details including tithi, nakshatra, and auspicious timings.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#8D0303]" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Beautiful Redesigned Header Box */}
            <div className="bg-white rounded-2xl p-5 shadow-xl border-2 border-[#8D0303]/20 relative overflow-hidden">
              <div className="relative z-10 text-center">
                <p className="text-[#8D0303] font-bold text-lg md:text-xl mb-0.5 tracking-tight">
                  {displayData.samvatsaram}
                </p>
                <p className="text-[#8D0303]/80 font-semibold text-base mb-3">
                  {displayData.maasam}
                </p>

                <div className="flex flex-col items-center">
                  <div className="bg-[#8D0303] text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg mb-2">
                    <span className="text-xl font-bold">{today.getDate()}</span>
                  </div>
                  <div className="leading-tight">
                    <p className="text-[#8D0303] font-bold text-base uppercase">{dayNames[today.getDay()]}</p>
                    <p className="text-[#8D0303]/70 font-medium text-xs">
                      {monthNames[today.getMonth()]} {today.getFullYear()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Panchangam Details - White Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              <PanchangamItem icon={<Calendar className="h-4 w-4" />} label="Tithi" value={displayData.tithi} />
              <PanchangamItem icon={<Star className="h-4 w-4" />} label="Nakshatra" value={displayData.nakshatra} />
              <PanchangamItem icon={<Sun className="h-4 w-4" />} label="Sunrise" value={displayData.sunrise} />
              <PanchangamItem icon={<Moon className="h-4 w-4" />} label="Sunset" value={displayData.sunset} />
            </div>

            {/* Auspicious Time - White Card */}
            <div className="p-4 bg-white border-2 border-[#00BD40]/40 rounded-lg shadow-md">
              <div className="flex items-center gap-2 text-[#00BD40] font-semibold mb-2">
                <Clock className="h-5 w-5" />
                <span className="text-base">Auspicious Time (Shubh Muhurat)</span>
              </div>
              <p className="text-sm text-[#8D0303] font-medium">{displayData.auspiciousTime}</p>
            </div>

            {/* Rahu Kalam Warning - White Card */}
            <div className="p-4 bg-white border-2 border-[#8D0303]/30 rounded-lg shadow-md">
              <div className="flex items-center gap-2 text-[#8D0303] font-semibold mb-2">
                <Clock className="h-5 w-5" />
                <span className="text-base">Rahu Kalam (Avoid)</span>
              </div>
              <p className="text-sm text-[#8D0303] font-medium">{displayData.rahu}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const PanchangamItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="p-3 bg-white rounded-lg shadow-md border border-[#8D0303]/10">
    <div className="flex items-center gap-1.5 text-[#8D0303]/70 text-xs font-medium mb-1.5">
      {icon}
      <span>{label}</span>
    </div>
    <p className="text-sm font-normal text-[#8D0303]">{value}</p>
  </div>
);

export default PanchangamModal;
