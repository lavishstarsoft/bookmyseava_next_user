import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft, CheckCircle2, ChevronRight, MapPin,
    Calendar as CalendarIcon, Clock, CreditCard, ShieldCheck,
    Star, Sparkles, Receipt, Home, Plus, Phone, Loader2, Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import AddressFormModal, { type AddressData } from "@/components/AddressFormModal";
import axios from "axios";
import { API_URL } from "@/config";

type SavedAddress = AddressData;

// We don't need mock data for pooja details here anymore, we will primarily rely on location.state


// Pricing & Add-ons configuration
const VERSIONS = [
    { id: 'basic', title: 'Basic Version', price: 1500, rating: 4, desc: 'Includes all essential pooja items and a certified pandit.' },
    { id: 'premium', title: 'Premium Version', price: 2500, rating: 4, desc: 'Includes extra floral decorations and special vastram for deity.' },
    { id: 'super_premium', title: 'Super Premium', price: 5000, rating: 5, desc: 'All-inclusive VIP arrangement with extended rituals and silver items.' }
];

const ADD_ONS = [
    { id: 'none', label: 'Only Pooja', price: 0 },
    { id: 'kit', label: 'Pooja + Pooja Kit', price: 1500 },
    { id: 'prasadam', label: 'Pooja + Kit + Prasadam', price: 2000 }
];

const TIME_SLOTS = [
    { id: 'morning', label: 'Morning (06:00 AM - 11:00 AM)' },
    { id: 'afternoon', label: 'Afternoon (12:00 PM - 03:00 PM)' },
    { id: 'evening', label: 'Evening (05:00 PM - 08:30 PM)' }
];

const DELIVERY_TIME_SLOTS = [
    { id: 'delivery_morning', label: '8 AM – 11 AM' },
    { id: 'delivery_mid', label: '11 AM – 2 PM' },
    { id: 'delivery_afternoon', label: '2 PM – 5 PM' }
];

const Checkout = () => {
    const { type, slug } = useParams<{ type: 'pooja' | 'kit'; slug: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { checkoutItems } = useCart();

    const isDirectRouting = !!type;
    const payload = location.state || {};

    // Determine the items being checked out
    const orderItems = isDirectRouting ? [
        {
            id: 'direct_item',
            productId: slug || 'unknown',
            type: type || 'pooja',
            title: payload.title || (type === 'kit' ? "Pooja Kit" : "Pooja Booking"),
            price: payload.price || (payload.version?.price || VERSIONS[0].price),
            image: payload.image || "",
            quantity: payload.quantity || 1,
            selectedVersion: payload.version || (type === 'kit' ? undefined : VERSIONS[0]),
            addon: payload.addon || (type === 'kit' ? undefined : ADD_ONS[0]),
            planLabel: payload.planLabel || "One-Time"
        }
    ] : checkoutItems;

    // If there are no items to checkout, redirect to cart
    useEffect(() => {
        if (!isDirectRouting && orderItems.length === 0) {
            navigate('/cart');
        }
    }, [isDirectRouting, orderItems, navigate]);

    // Check if the order requires Date & Time selection
    const hasPooja = orderItems.some(item => item.type === 'pooja');

    // Checkout State
    const [currentStep, setCurrentStep] = useState(1);

    const initialTimeSlot = hasPooja ? TIME_SLOTS[0] : DELIVERY_TIME_SLOTS[0];
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [timeSlot, setTimeSlot] = useState(initialTimeSlot);
    const [paymentMode, setPaymentMode] = useState<'advance' | 'full'>('full');
    const [couponCode, setCouponCode] = useState("");
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponApplied, setCouponApplied] = useState<{ code: string; discountType: string; discountValue: number } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState("");
    const [couponSuccess, setCouponSuccess] = useState("");
    const [useCoins, setUseCoins] = useState(false);

    const { isAuthenticated, openAuthModal, token } = useAuth();
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    // Delivery zone check state
    const [deliveryCheck, setDeliveryCheck] = useState<{
        serviceable: boolean;
        zone?: { name: string; deliveryCharge: number; estimatedDays: string; freeDeliveryAbove: number | null; minOrderValue: number };
        message?: string;
    } | null>(null);
    const [deliveryCheckLoading, setDeliveryCheckLoading] = useState(false);

    // Load saved addresses from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('addresses');
        if (saved) {
            const parsed: SavedAddress[] = JSON.parse(saved);
            setSavedAddresses(parsed);
            const defaultAddr = parsed.find(a => a.isDefault) || parsed[0];
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        }
    }, []);

    // Check delivery serviceability for a pincode
    const checkDeliveryPincode = async (pincode: string) => {
        if (!pincode || pincode.length !== 6) return;
        setDeliveryCheckLoading(true);
        try {
            const res = await axios.get(`${API_URL.replace('/api', '/api/v1')}/delivery-zones/check/${pincode}`);
            setDeliveryCheck(res.data);
        } catch {
            setDeliveryCheck({ serviceable: false, message: 'Failed to check delivery availability' });
        } finally {
            setDeliveryCheckLoading(false);
        }
    };

    // Auto-check pincode when address is selected
    useEffect(() => {
        if (selectedAddressId) {
            const addr = savedAddresses.find(a => a.id === selectedAddressId);
            if (addr?.pincode) {
                checkDeliveryPincode(addr.pincode);
            } else {
                setDeliveryCheck(null);
            }
        } else {
            setDeliveryCheck(null);
        }
    }, [selectedAddressId, savedAddresses]);

    // Kit delivery config fetched from backend
    const [kitDeliveryConfig, setKitDeliveryConfig] = useState<{
        timeSlots: { id: string; label: string; active: boolean }[];
        bookingStartDate?: string;
        bookingEndDate?: string;
        leadDays: number;
        maxAdvanceDays: number;
    } | null>(null);

    // Fetch kit deliveryConfig when type is 'kit'
    useEffect(() => {
        if (type === 'kit' && slug) {
            axios.get(`${API_URL.replace('/api', '/api/v1')}/kits/${slug}`)
                .then(res => {
                    const config = res.data?.deliveryConfig;
                    if (config) {
                        setKitDeliveryConfig({
                            timeSlots: config.timeSlots || [],
                            bookingStartDate: config.bookingStartDate,
                            bookingEndDate: config.bookingEndDate,
                            leadDays: config.leadDays ?? 0,
                            maxAdvanceDays: config.maxAdvanceDays ?? 30,
                        });
                        // Set first active slot as selected
                        const activeSlots = (config.timeSlots || []).filter((s: { active: boolean }) => s.active);
                        if (activeSlots.length > 0) setTimeSlot(activeSlots[0]);
                        // Set initial date based on leadDays + bookingStartDate
                        const today = new Date(new Date().setHours(0, 0, 0, 0));
                        const leadDays = config.leadDays ?? 0;
                        const minDate = new Date(today);
                        minDate.setDate(minDate.getDate() + leadDays);
                        if (config.bookingStartDate) {
                            const bsd = new Date(config.bookingStartDate);
                            bsd.setHours(0, 0, 0, 0);
                            if (bsd > minDate) { setDate(bsd); return; }
                        }
                        setDate(minDate);
                    }
                })
                .catch(() => { /* use defaults on failure */ });
        }
    }, [type, slug]);

    // Redirect if not logged in (check localStorage too — token loads async on refresh)
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (!isAuthenticated && !storedToken) {
            openAuthModal();
            navigate(-1);
        }
    }, [isAuthenticated, openAuthModal, navigate]);

    // Calculations based on multi-item setup
    const serviceFee = 50;
    const coinsDiscount = useCoins ? 200 : 0;

    // Calculate sum of all items in checkout
    const subTotal = orderItems.reduce((acc, item) => {
        const itemBasePrice = item.price * item.quantity;
        // In the direct routing we attached addon to the item object directly
        const addonPrice = (item.type === 'pooja' && (item as any).addon?.price) ? (item as any).addon.price : 0;
        return acc + itemBasePrice + addonPrice;
    }, 0);

    // Delivery charge from zone check
    const deliveryCharge = deliveryCheck?.serviceable && deliveryCheck.zone
        ? (deliveryCheck.zone.freeDeliveryAbove && subTotal >= deliveryCheck.zone.freeDeliveryAbove ? 0 : deliveryCheck.zone.deliveryCharge)
        : 0;

    const grandTotal = subTotal + serviceFee + deliveryCharge - coinsDiscount - couponDiscount;
    const advanceAmount = Math.ceil(grandTotal * 0.2); // 20% advance

    const amountToPay = paymentMode === 'full' ? grandTotal : advanceAmount;

    // Dynamic delivery slots: use kit's active slots if available, else fallback to defaults
    const activeDeliverySlots = !hasPooja && kitDeliveryConfig?.timeSlots?.length
        ? kitDeliveryConfig.timeSlots.filter(s => s.active)
        : DELIVERY_TIME_SLOTS;

    // Steps Configuration dynamically based on cart contents
    const STEPS = [
        { num: 1, title: hasPooja ? 'Date & Time' : 'Delivery Slot', icon: CalendarIcon },
        { num: 2, title: 'Address', icon: MapPin },
        { num: 3, title: 'Payment', icon: CreditCard }
    ];

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => {
        if (currentStep === 1) {
            navigate(-1);
        } else {
            setCurrentStep(prev => Math.max(prev - 1, 1));
        }
    };
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError("");
        setCouponSuccess("");
        try {
            const authToken = token || localStorage.getItem('token');
            const res = await axios.post(
                `${API_URL.replace('/api', '/api/v1')}/coupons/validate`,
                {
                    code: couponCode.trim(),
                    orderValue: subTotal + serviceFee,
                    category: orderItems[0]?.type === 'kit' || orderItems[0]?.type === 'pooja-kit'
                        ? (orderItems[0] as any).category || ''
                        : ''
                },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            const data = res.data;
            if (data.valid) {
                setCouponDiscount(data.discount);
                setCouponApplied(data.coupon);
                setCouponSuccess(data.message);
                setCouponError("");
            } else {
                setCouponDiscount(0);
                setCouponApplied(null);
                setCouponError(data.message);
                setCouponSuccess("");
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Failed to validate coupon";
            setCouponError(msg);
            setCouponDiscount(0);
            setCouponApplied(null);
            setCouponSuccess("");
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponCode("");
        setCouponDiscount(0);
        setCouponApplied(null);
        setCouponError("");
        setCouponSuccess("");
    };

    const handlePayment = async () => {
        const isKitOnly = orderItems.every(item => item.type === 'pooja-kit' || item.type === 'kit');

        if (isKitOnly) {
            // Save kit order to backend
            setIsPlacingOrder(true);
            try {
                const kitItem = orderItems[0];
                const authToken = token || localStorage.getItem('token');

                await axios.post(
                    `${API_URL.replace('/api', '/api/v1')}/kit-orders`,
                    {
                        kit: {
                            kitId: kitItem.productId,
                            title: kitItem.title,
                            image: kitItem.image || '',
                            category: 'kit'
                        },
                        plan: kitItem.selectedVersion
                            ? { id: kitItem.selectedVersion.id, label: kitItem.selectedVersion.title, price: kitItem.price }
                            : { id: 'one_time', label: (kitItem as any).planLabel || 'One-Time Purchase', price: kitItem.price },
                        quantity: kitItem.quantity,
                        totalAmount: grandTotal,
                        coupon: couponApplied ? { code: couponApplied.code, discountType: couponApplied.discountType, discountValue: couponApplied.discountValue, discountAmount: couponDiscount } : undefined,
                        deliveryDate: date ? date.toISOString() : undefined,
                        deliverySlot: timeSlot.label,
                        deliveryAddress: (() => {
                            const addr = savedAddresses.find(a => a.id === selectedAddressId);
                            if (!addr) return {};
                            return {
                                line1: addr.houseNo + (addr.area ? `, ${addr.area}` : '') + (addr.landmark ? `, ${addr.landmark}` : ''),
                                city: addr.city,
                                state: addr.state,
                                pincode: addr.pincode
                            };
                        })()
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
                navigate('/order-confirmed', { state: { title: kitItem.title, amount: grandTotal } });
            } catch {
                alert('Failed to place order. Please try again.');
            } finally {
                setIsPlacingOrder(false);
            }
        } else {
            alert('Proceeding to Razorpay for ₹' + amountToPay);
            // Integrate Razorpay here
        }
    };

    return (
        <div className="min-h-screen bg-muted/30 pb-20 pt-6">
            <div className="container px-4 max-w-6xl mx-auto">

                {/* Header Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-sm font-medium text-muted-foreground hover:text-maroon-dark mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                </button>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* LEFT COLUMN: Checkout Flow */}
                    <div className="flex-1 space-y-6">

                        {/* Stepper Header */}
                        <div className="bg-white rounded-xl shadow-sm border border-border/40 p-4 md:p-6 mb-6">
                            <div className="flex items-center justify-between relative">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-muted z-0 hidden md:block" />
                                <div
                                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-spiritual-green z-0 hidden md:block transition-all duration-500"
                                    style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                                />

                                {STEPS.map((step, index) => {
                                    const Icon = step.icon;
                                    const isActive = currentStep === step.num;
                                    const isCompleted = currentStep > step.num;

                                    // For pure kits, we only have 2 steps, so flex justify-between works perfectly
                                    return (
                                        <div key={step.num} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                                            <div className={`
                                                w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300
                                                ${isActive ? 'bg-spiritual-green text-white shadow-md ring-4 ring-spiritual-green/20' :
                                                    isCompleted ? 'bg-spiritual-green text-white' :
                                                        'bg-white text-muted-foreground border-2 border-muted'}
                                            `}>
                                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.num}
                                            </div>
                                            <span className={`text-[10px] md:text-xs font-semibold hidden md:block ${isActive || isCompleted ? 'text-maroon-dark' : 'text-muted-foreground'}`}>
                                                {step.title}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* STEP 1: Date & Time */}
                        {currentStep === 1 && (
                            <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6 animate-fade-in-up">
                                <h2 className="text-xl font-heading font-bold text-maroon-dark mb-6 flex items-center">
                                    <CalendarIcon className="w-5 h-5 mr-2 text-spiritual-green" />
                                    {hasPooja ? 'Schedule your Pooja' : 'Select Delivery Slot'}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Date Selection */}
                                    <div>
                                        <h4 className="font-semibold text-sm mb-3">{hasPooja ? 'Select Date' : 'Delivery Date'}</h4>
                                        <div className="border rounded-lg p-2 flex justify-center bg-white shadow-sm">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                className="rounded-md"
                                                disabled={(date) => {
                                                    const today = new Date(new Date().setHours(0, 0, 0, 0));
                                                    if (date < today) return true;
                                                    if (!hasPooja && kitDeliveryConfig) {
                                                        const minDate = new Date(today);
                                                        minDate.setDate(minDate.getDate() + kitDeliveryConfig.leadDays);
                                                        if (date < minDate) return true;
                                                        const maxDate = new Date(today);
                                                        maxDate.setDate(maxDate.getDate() + kitDeliveryConfig.maxAdvanceDays);
                                                        if (date > maxDate) return true;
                                                        if (kitDeliveryConfig.bookingStartDate) {
                                                            const bsd = new Date(kitDeliveryConfig.bookingStartDate);
                                                            bsd.setHours(0, 0, 0, 0);
                                                            if (date < bsd) return true;
                                                        }
                                                        if (kitDeliveryConfig.bookingEndDate) {
                                                            const bed = new Date(kitDeliveryConfig.bookingEndDate);
                                                            bed.setHours(23, 59, 59, 999);
                                                            if (date > bed) return true;
                                                        }
                                                    }
                                                    return false;
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Time Selection */}
                                    <div>
                                        <h4 className="font-semibold text-sm mb-3 flex items-center">
                                            <Clock className="w-4 h-4 mr-1.5" /> {hasPooja ? 'Select Time Slot' : 'Delivery Time Slot'}
                                        </h4>
                                        <div className="flex flex-col gap-3">
                                            {(hasPooja ? TIME_SLOTS : activeDeliverySlots).map(slot => (
                                                <button
                                                    key={slot.id}
                                                    onClick={() => setTimeSlot(slot)}
                                                    className={`
                                                        p-4 rounded-lg border text-left flex items-center justify-between transition-all
                                                        ${timeSlot.id === slot.id ? 'border-spiritual-green bg-spiritual-green/5 ring-1 ring-spiritual-green' : 'border-border hover:border-spiritual-green/30 hover:bg-muted/10'}
                                                    `}
                                                >
                                                    <span className="font-medium">{slot.label}</span>
                                                    {timeSlot.id === slot.id && <CheckCircle2 className="w-5 h-5 text-spiritual-green" />}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-4 italic">
                                            {hasPooja ? '* Exact timing will be confirmed by the pandit after booking.' : '* Estimated delivery window. We will notify you when dispatched.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-between">
                                    <Button variant="outline" onClick={prevStep}>Back</Button>
                                    <Button onClick={nextStep} className="bg-spiritual-green hover:bg-spiritual-green/90 text-white px-8" disabled={!date}>
                                        Proceed <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Address & Details */}
                        {currentStep === 2 && (
                            <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6 animate-fade-in-up">
                                <h2 className="text-xl font-heading font-bold text-maroon-dark mb-6 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-maroon" />
                                    Booking Details & Address
                                </h2>

                                {!isAuthenticated ? (
                                    <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border">
                                        <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                        <h3 className="font-bold text-lg mb-2">Login to Continue</h3>
                                        <p className="text-muted-foreground mb-4 text-sm max-w-sm mx-auto">Please login or sign up to save your booking details and access them later.</p>
                                        <Button className="bg-maroon hover:bg-maroon-dark text-white">Login / Sign Up</Button>
                                    </div>
                                ) : (
                                    <>
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-semibold text-sm mb-3">Select Performing Address</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {savedAddresses.map((addr) => (
                                                    <label
                                                        key={addr.id}
                                                        className={`p-4 rounded-lg border cursor-pointer relative transition-all ${selectedAddressId === addr.id ? 'border-marigold bg-marigold/5' : 'border-border hover:bg-muted/20'}`}
                                                        onClick={() => setSelectedAddressId(addr.id)}
                                                    >
                                                        {selectedAddressId === addr.id && <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-marigold" />}
                                                        <div className="flex items-center gap-2 font-bold mb-1"><Home className="w-4 h-4" /> {addr.name}</div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {addr.houseNo}{addr.area ? `, ${addr.area}` : ''}{addr.landmark ? `, ${addr.landmark}` : ''}, {addr.city}, {addr.state} {addr.pincode}
                                                        </p>
                                                        <p className="text-sm font-medium mt-2 flex items-center gap-1"><Phone className="w-3 h-3" /> {addr.phone}</p>
                                                    </label>
                                                ))}

                                                {/* Add New Address */}
                                                <button
                                                    onClick={() => setIsAddressModalOpen(true)}
                                                    className="p-4 rounded-lg border border-dashed border-muted-foreground/40 hover:border-maroon hover:bg-maroon/5 flex flex-col items-center justify-center text-muted-foreground hover:text-maroon transition-colors min-h-[120px]"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-2">
                                                        <Plus className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-semibold">Add New Address</span>
                                                </button>
                                            </div>

                                            {savedAddresses.length === 0 && (
                                                <p className="text-xs text-amber-600 mt-2 font-medium">Please add an address to continue.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Add Address Modal - Shared Component */}
                                    <AddressFormModal
                                        open={isAddressModalOpen}
                                        onOpenChange={setIsAddressModalOpen}
                                        onSave={(savedAddr) => {
                                            const updated = [...savedAddresses, savedAddr];
                                            setSavedAddresses(updated);
                                            setSelectedAddressId(savedAddr.id);
                                            localStorage.setItem('addresses', JSON.stringify(updated));
                                            setIsAddressModalOpen(false);
                                        }}
                                    />
                                    </>
                                )}

                                {/* Delivery Zone Check Result */}
                                {selectedAddressId && (
                                    <div className="mt-4">
                                        {deliveryCheckLoading ? (
                                            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">Checking delivery availability...</span>
                                            </div>
                                        ) : deliveryCheck?.serviceable ? (
                                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                                    <span className="text-sm font-bold text-green-700">Delivery available — {deliveryCheck.zone?.estimatedDays}</span>
                                                </div>
                                                <div className="flex items-center gap-3 ml-6 text-xs text-green-600">
                                                    <span className="flex items-center gap-1">
                                                        <Truck className="w-3 h-3" />
                                                        {deliveryCheck.zone?.freeDeliveryAbove && subTotal >= deliveryCheck.zone.freeDeliveryAbove
                                                            ? 'Free Delivery'
                                                            : deliveryCheck.zone?.deliveryCharge === 0
                                                                ? 'Free Delivery'
                                                                : `Delivery: ₹${deliveryCheck.zone?.deliveryCharge}`
                                                        }
                                                    </span>
                                                    {deliveryCheck.zone?.freeDeliveryAbove && subTotal < deliveryCheck.zone.freeDeliveryAbove && deliveryCheck.zone.deliveryCharge > 0 && (
                                                        <span className="text-green-500">• Free above ₹{deliveryCheck.zone.freeDeliveryAbove}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ) : deliveryCheck ? (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                                                    <span className="text-sm font-medium text-red-700">{deliveryCheck.message || "We don't deliver to this area yet"}</span>
                                                </div>
                                                <p className="text-xs text-red-500 mt-1 ml-6">Please try a different address.</p>
                                            </div>
                                        ) : null}
                                    </div>
                                )}

                                <div className="mt-8 flex justify-between">
                                    <Button variant="outline" onClick={prevStep}>Back</Button>
                                    <Button onClick={nextStep} className="bg-spiritual-green hover:bg-spiritual-green/90 text-white px-8" disabled={!isAuthenticated || !selectedAddressId || deliveryCheckLoading || (deliveryCheck !== null && !deliveryCheck.serviceable)}>
                                        Continue to Payment <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Payment */}
                        {currentStep === 3 && (
                            <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6 animate-fade-in-up">
                                <h2 className="text-xl font-heading font-bold text-maroon-dark mb-6 flex items-center">
                                    <ShieldCheck className="w-5 h-5 mr-2 text-green-600" />
                                    Secure Payment (Razorpay)
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-sm mb-3">Payment Type</h4>
                                        <div className={`grid gap-4 ${hasPooja ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                                            <label
                                                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden ${paymentMode === 'full'
                                                    ? 'border-spiritual-green bg-gradient-to-br from-spiritual-green/10 to-transparent shadow-md'
                                                    : 'border-border bg-white hover:border-spiritual-green/30 hover:shadow-sm'}`}
                                                onClick={() => setPaymentMode('full')}
                                            >
                                                {/* Selected Checkmark Icon */}
                                                <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${paymentMode === 'full' ? 'border-spiritual-green bg-spiritual-green' : 'border-gray-300'}`}>
                                                    {paymentMode === 'full' && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                </div>

                                                <div className="pr-8">
                                                    <div className={`font-extrabold text-lg mb-1 ${paymentMode === 'full' ? 'text-gray-900' : 'text-gray-700'}`}>Pay Full Amount</div>
                                                    <div className={`text-3xl font-black mt-2 mb-1 ${paymentMode === 'full' ? 'text-spiritual-green' : 'text-gray-900'}`}>₹{grandTotal}</div>
                                                    <div className="text-xs text-muted-foreground font-medium">Pay everything now</div>
                                                </div>

                                                {paymentMode === 'full' && (
                                                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-spiritual-green/5 rounded-full blur-xl pointer-events-none" />
                                                )}
                                            </label>

                                            {hasPooja && (
                                                <label
                                                    className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden ${paymentMode === 'advance'
                                                        ? 'border-maroon bg-gradient-to-br from-maroon/5 to-transparent shadow-md'
                                                        : 'border-border bg-white hover:border-maroon/30 hover:shadow-sm'}`}
                                                    onClick={() => setPaymentMode('advance')}
                                                >
                                                    {/* Selected Checkmark Icon */}
                                                    <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${paymentMode === 'advance' ? 'border-maroon bg-maroon' : 'border-gray-300'}`}>
                                                        {paymentMode === 'advance' && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                    </div>

                                                    <div className="pr-8">
                                                        <div className={`font-extrabold text-lg mb-1 ${paymentMode === 'advance' ? 'text-gray-900' : 'text-gray-700'}`}>Pay Booking Advance</div>
                                                        <div className={`text-3xl font-black mt-2 mb-1 ${paymentMode === 'advance' ? 'text-maroon' : 'text-gray-900'}`}>₹{advanceAmount}</div>
                                                        <div className="text-xs text-muted-foreground font-medium">Pay remaining offline (20%)</div>
                                                    </div>

                                                    {paymentMode === 'advance' && (
                                                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-maroon/5 rounded-full blur-xl pointer-events-none" />
                                                    )}
                                                </label>
                                            )}
                                        </div>

                                        {!hasPooja && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-800 text-sm font-medium">
                                                To confirm your order, full payment is required at the time of checkout. Partial payments are not allowed.
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-muted/30 p-4 rounded-lg border border-border">
                                        <h4 className="font-semibold text-sm mb-3">Supported Payment Methods</h4>
                                        <div className="flex flex-wrap gap-3">
                                            <span className="px-3 py-1 bg-white border rounded text-xs font-semibold">UPI</span>
                                            <span className="px-3 py-1 bg-white border rounded text-xs font-semibold">Credit/Debit Cards</span>
                                            <span className="px-3 py-1 bg-white border rounded text-xs font-semibold">Net Banking</span>
                                            <span className="px-3 py-1 bg-white border rounded text-xs font-semibold">Wallets</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-between items-center pt-6 border-t border-border">
                                    <Button variant="ghost" onClick={prevStep}>Back</Button>
                                    <div className="text-right flex items-center gap-4">
                                        <div className="text-sm">
                                            Amount to pay: <span className="text-xl font-bold">₹{amountToPay}</span>
                                        </div>
                                        <Button onClick={handlePayment} disabled={isPlacingOrder} className="bg-[#528FF0] hover:bg-[#3b7bed] text-white px-8 h-12 text-lg shadow-lg">
                                            {isPlacingOrder ? 'Placing Order...' : 'Pay Now'}
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-center mt-4">
                                    <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                                        <ShieldCheck className="w-3 h-3 text-green-600" /> 100% Secure Payments via Razorpay
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* RIGHT COLUMN: Order Summary (Sticky) */}
                    <div className="w-full lg:w-[380px] shrink-0">
                        <div className="sticky top-28 bg-white rounded-xl shadow-lg border border-border/60 overflow-hidden">
                            <div className="bg-maroon-dark text-white p-4 flex items-center gap-2">
                                <Receipt className="w-5 h-5" />
                                <h3 className="font-bold font-heading">Order Summary</h3>
                            </div>

                            <div className="p-5 max-h-[80vh] overflow-y-auto">
                                {/* Iterate through all checkout items */}
                                {orderItems.map((item, index) => (
                                    <div key={`${item.id}-${index}`} className="mb-4 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1 pr-3">
                                                <p className="font-bold text-sm text-gray-800 line-clamp-2 leading-tight">
                                                    {item.quantity > 1 && <span className="text-maroon mr-1">{item.quantity}x</span>}
                                                    {item.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {item.type === 'pooja-kit' ? (item as any).planLabel : item.selectedVersion?.title}
                                                </p>
                                            </div>
                                            <span className="font-semibold text-sm shrink-0">₹{item.price * item.quantity}</span>
                                        </div>

                                        {/* Add On (Pooja Only) */}
                                        {item.type === 'pooja' && (item as any).addon && (item as any).addon.price > 0 && (
                                            <div className="flex justify-between items-start text-xs pl-4 relative before:absolute before:content-[''] before:w-2 before:h-2 before:border-l before:border-b before:-ml-2 before:top-0.5 before:border-muted-foreground/40">
                                                <p className="text-gray-600">{(item as any).addon.label}</p>
                                                <span className="font-medium text-gray-600">+₹{(item as any).addon.price}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <Separator className="my-2" />

                                {/* Subtotals & Fees */}
                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">₹{subTotal}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Platform/Service Fee</span>
                                        <span className="font-medium">₹{serviceFee}</span>
                                    </div>
                                    {deliveryCharge > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Delivery Charge</span>
                                            <span className="font-medium">₹{deliveryCharge}</span>
                                        </div>
                                    )}
                                    {deliveryCheck?.serviceable && deliveryCharge === 0 && deliveryCheck.zone?.deliveryCharge !== undefined && (
                                        <div className="flex justify-between text-green-600 font-medium">
                                            <span>Delivery</span>
                                            <span>FREE</span>
                                        </div>
                                    )}
                                    {useCoins && (
                                        <div className="flex justify-between text-green-600 font-medium">
                                            <span>BMS Coins Discount</span>
                                            <span>-₹{coinsDiscount}</span>
                                        </div>
                                    )}
                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between text-green-600 font-medium">
                                            <span>Coupon ({couponApplied?.code})</span>
                                            <span>-₹{couponDiscount}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Promo/Coins Section */}
                                <div className="bg-muted/40 rounded-lg p-3 mb-6 border border-dashed border-border flex flex-col gap-3">
                                    {/* Toggle Coins */}
                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={useCoins}
                                                onChange={(e) => setUseCoins(e.target.checked)}
                                                className="rounded border-gray-300 text-marigold focus:ring-marigold"
                                            />
                                            <span className="text-sm font-medium">Redeem 200 BMS Coins</span>
                                        </div>
                                        <span className="text-xs font-bold text-green-600 group-hover:underline">Save ₹200</span>
                                    </label>

                                    {/* Coupon */}
                                    {couponApplied ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                                    <div>
                                                        <span className="text-sm font-bold text-green-700 uppercase">{couponApplied.code}</span>
                                                        <p className="text-[11px] text-green-600 font-medium">You save ₹{couponDiscount}!</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleRemoveCoupon}
                                                    className="text-xs text-red-500 hover:text-red-700 font-semibold hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter Coupon Code"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                    className="w-full text-sm border rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-spiritual-green uppercase font-mono tracking-wider"
                                                    disabled={couponLoading}
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="text-xs bg-gray-200 shrink-0"
                                                    onClick={handleApplyCoupon}
                                                    disabled={couponLoading || !couponCode.trim()}
                                                >
                                                    {couponLoading ? 'Checking...' : 'Apply'}
                                                </Button>
                                            </div>
                                            {couponError && (
                                                <p className="text-xs text-red-600 font-medium">{couponError}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <Separator className="my-4" />

                                {/* Total */}
                                <div className="flex justify-between items-end mb-2">
                                    <span className="font-bold text-lg">Grand Total</span>
                                    <span className="font-black text-2xl text-maroon-dark">₹{grandTotal}</span>
                                </div>
                                <p className="text-right text-[10px] text-muted-foreground mb-6">Inclusive of all taxes</p>

                                {/* Date/Time preview if selected */}
                                {date && currentStep > 1 && (
                                    <div className="bg-spiritual-green/10 text-spiritual-green p-3 rounded-lg text-xs font-medium flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4 shrink-0" />
                                        <span>{format(date, "PPP")} • {timeSlot.label.split('(')[0].trim()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;
