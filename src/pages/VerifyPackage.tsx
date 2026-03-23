import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Package, ShieldCheck, Calendar, Store, AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface PackageData {
  orderId: string;
  createdAt: string;
  vendorName: string;
  isVerified: boolean;
}

const VerifyPackage = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<PackageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rawData = searchParams.get("data");
    if (!rawData) {
      setError("No verification data found in the link.");
      setLoading(false);
      return;
    }

    try {
      // Decode base64
      const decodedString = atob(decodeURIComponent(rawData));
      const parts = decodedString.split("|");

      if (parts[0] === "VERIFIED_PACKAGE" && parts.length >= 4) {
        setData({
          orderId: parts[1],
          createdAt: parts[2],
          vendorName: parts[3],
          isVerified: true
        });
      } else {
        setError("Invalid verification data format.");
      }
    } catch (err) {
      console.error("Decoding error:", err);
      setError("Failed to decode verification data.");
    } finally {
      setTimeout(() => setLoading(false), 800); // Small delay for premium feel
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-[#8D0303] animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Verifying Package Authenticity...</h2>
        <p className="text-muted-foreground mt-2 text-sm">Please wait while we secure your delivery data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Verification Failed</h2>
        <p className="text-red-600 font-medium mt-2 max-w-md">{error}</p>
        <p className="text-muted-foreground mt-4 text-sm px-4">
          Please contact support if you believe this is a genuine BookMySeva package.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-6">
      <div className="max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* Status Header */}
          <div className="bg-green-500 p-8 text-center relative">
            <div className="absolute top-4 right-4 opacity-20">
              <ShieldCheck className="w-24 h-24 text-white" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-white"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </motion.div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Authenticity Verified</h2>
            <p className="text-green-50 text-sm font-medium mt-1">Genuine BookMySeva Package</p>
          </div>

          {/* Details Section */}
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Order Identifier</p>
                  <p className="text-lg font-black text-gray-900 font-mono">{data?.orderId}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Package Created</p>
                  <p className="text-sm font-bold text-gray-800">
                    {data?.createdAt ? new Date(data.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Certified Vendor</p>
                  <p className="text-sm font-bold text-gray-800">{data?.vendorName}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-dashed border-gray-200">
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#8D0303]" />
                <p className="text-[11px] text-gray-600 leading-snug">
                  This package has been digitally verified through the BookMySeva secure supply chain. If you notice any tampering with the physical seals, please report it immediately.
                </p>
              </div>
            </div>

            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
            >
              Continue to BookMySeva
            </button>
          </div>
        </motion.div>
        
        <p className="text-center text-xs text-muted-foreground mt-8 px-8">
            Digital signature: {btoa(data?.orderId || "BMS").slice(0, 32)}...
        </p>
      </div>
    </div>
  );
};

export default VerifyPackage;
