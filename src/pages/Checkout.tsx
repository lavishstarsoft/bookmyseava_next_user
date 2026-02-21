import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft, CheckCircle2, ChevronRight, MapPin,
    Calendar as CalendarIcon, Clock, CreditCard, ShieldCheck,
    Star, Sparkles, Receipt, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

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

const Checkout = () => {
    const { type, slug } = useParams<{ type: 'pooja' | 'kit'; slug: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const isKit = type === 'kit';
    const payload = location.state || {}; // Expecting { title, image, price, planLabel } for kits, OR { title, image, version, addon } for poojas

    // Checkout State
    const [currentStep, setCurrentStep] = useState(isKit ? 2 : 1);

    // Data from Payload
    const selectedVersion = payload.version || VERSIONS[0];
    const selectedAddon = payload.addon || ADD_ONS[0];
    const itemTitle = payload.title || (isKit ? "Pooja Kit" : "Pooja Booking");
    const itemImage = payload.image || "";
    const kitPrice = payload.price || 0;
    const kitPlan = payload.planLabel || "One-Time";

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
    const [paymentMode, setPaymentMode] = useState<'advance' | 'full'>('full');
    const [couponCode, setCouponCode] = useState("");
    const [useCoins, setUseCoins] = useState(false);

    // Mock User State
    const [isLoggedIn] = useState(true);
    const [selectedAddress, setSelectedAddress] = useState(1);

    // Calculations
    const serviceFee = 50;
    const coinsDiscount = useCoins ? 200 : 0;
    const subTotal = isKit ? kitPrice : (selectedVersion.price + selectedAddon.price);
    const grandTotal = subTotal + serviceFee - coinsDiscount;
    const advanceAmount = Math.ceil(grandTotal * 0.2); // 20% advance

    const amountToPay = paymentMode === 'full' ? grandTotal : advanceAmount;

    // Steps Configuration based on type
    const STEPS = isKit ? [
        { num: 2, title: 'Address', icon: MapPin },
        { num: 3, title: 'Payment', icon: CreditCard }
    ] : [
        { num: 1, title: 'Date & Time', icon: CalendarIcon },
        { num: 2, title: 'Address', icon: MapPin },
        { num: 3, title: 'Payment', icon: CreditCard }
    ];

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => {
        if (isKit && currentStep === 2) {
            navigate(-1);
        } else if (!isKit && currentStep === 1) {
            navigate(-1);
        } else {
            setCurrentStep(prev => Math.max(prev - 1, isKit ? 2 : 1));
        }
    };
    const handlePayment = () => {
        alert('Proceeding to Razorpay for ₹' + amountToPay);
        // Integrate Razorpay here
    };

    return (
        <div className="min-h-screen bg-muted/30 pb-20 pt-6">
            <div className="container px-4 max-w-6xl mx-auto">

                {/* Header Back Button */}
                <button
                    onClick={() => navigate(isKit ? '/pooja-kits' : '/book-pooja')}
                    className="flex items-center text-sm font-medium text-muted-foreground hover:text-maroon-dark mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to {isKit ? 'Kits' : 'Poojas'}
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
                                    style={{ width: isKit ? `${((currentStep - 2)) * 100}%` : `${((currentStep - 1) / 2) * 100}%` }}
                                />

                                {STEPS.map((step, index) => {
                                    const Icon = step.icon;
                                    const isActive = currentStep === step.num;
                                    const isCompleted = currentStep > step.num;

                                    // For Kits, we only have 2 steps, so flex justify-between works perfectly
                                    return (
                                        <div key={step.num} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                                            <div className={`
                                                w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300
                                                ${isActive ? 'bg-spiritual-green text-white shadow-md ring-4 ring-spiritual-green/20' :
                                                    isCompleted ? 'bg-spiritual-green text-white' :
                                                        'bg-white text-muted-foreground border-2 border-muted'}
                                            `}>
                                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : (isKit ? index + 1 : step.num)}
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
                                    Schedule your Pooja
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Date Selection */}
                                    <div>
                                        <h4 className="font-semibold text-sm mb-3">Select Date</h4>
                                        <div className="border rounded-lg p-2 flex justify-center bg-white shadow-sm">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                className="rounded-md"
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                            />
                                        </div>
                                    </div>

                                    {/* Time Selection */}
                                    <div>
                                        <h4 className="font-semibold text-sm mb-3 flex items-center">
                                            <Clock className="w-4 h-4 mr-1.5" /> Select Time Slot
                                        </h4>
                                        <div className="flex flex-col gap-3">
                                            {TIME_SLOTS.map(slot => (
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
                                            * Exact timing will be confirmed by the pandit after booking.
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

                                {!isLoggedIn ? (
                                    <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border">
                                        <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                        <h3 className="font-bold text-lg mb-2">Login to Continue</h3>
                                        <p className="text-muted-foreground mb-4 text-sm max-w-sm mx-auto">Please login or sign up to save your booking details and access them later.</p>
                                        <Button className="bg-maroon hover:bg-maroon-dark text-white">Login / Sign Up</Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-semibold text-sm mb-3">Select Performing Address</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Mock Address 1 */}
                                                <label
                                                    className={`p-4 rounded-lg border cursor-pointer relative ${selectedAddress === 1 ? 'border-marigold bg-marigold/5' : 'border-border hover:bg-muted/20'}`}
                                                    onClick={() => setSelectedAddress(1)}
                                                >
                                                    {selectedAddress === 1 && <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-marigold" />}
                                                    <div className="flex items-center gap-2 font-bold mb-1"><Home className="w-4 h-4" /> Home</div>
                                                    <p className="text-sm text-muted-foreground">12-4, Temple Road, Kukatpally, Hyderabad, Telangana 500072</p>
                                                    <p className="text-sm font-medium mt-2">+91 98765 43210</p>
                                                </label>

                                                {/* Add New Info */}
                                                <button className="p-4 rounded-lg border border-dashed border-muted-foreground/40 hover:border-maroon hover:bg-maroon/5 flex flex-col items-center justify-center text-muted-foreground hover:text-maroon transition-colors min-h-[120px]">
                                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-2">+</div>
                                                    <span className="font-semibold">Add New Address</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 flex justify-between">
                                    <Button variant="outline" onClick={prevStep}>Back</Button>
                                    <Button onClick={nextStep} className="bg-spiritual-green hover:bg-spiritual-green/90 text-white px-8" disabled={!isLoggedIn}>
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
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <label
                                                className={`p-4 rounded-lg border cursor-pointer text-center transition-all ${paymentMode === 'full' ? 'border-spiritual-green bg-spiritual-green/5 ring-1 ring-spiritual-green' : 'border-border hover:bg-muted/20'}`}
                                                onClick={() => setPaymentMode('full')}
                                            >
                                                <div className="font-bold text-lg mb-1">Pay Full Amount</div>
                                                <div className="text-2xl font-black text-spiritual-green">₹{grandTotal}</div>
                                                <div className="text-xs text-muted-foreground mt-1">Pay everything now</div>
                                            </label>
                                            <label
                                                className={`p-4 rounded-lg border cursor-pointer text-center transition-all ${paymentMode === 'advance' ? 'border-spiritual-green bg-spiritual-green/5 ring-1 ring-spiritual-green' : 'border-border hover:bg-muted/20'}`}
                                                onClick={() => setPaymentMode('advance')}
                                            >
                                                <div className="font-bold text-lg mb-1">Pay Booking Advance</div>
                                                <div className="text-2xl font-black text-maroon">₹{advanceAmount}</div>
                                                <div className="text-xs text-muted-foreground mt-1">Pay remaining offline (20%)</div>
                                            </label>
                                        </div>
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
                                        <Button onClick={handlePayment} className="bg-[#528FF0] hover:bg-[#3b7bed] text-white px-8 h-12 text-lg shadow-lg">
                                            Pay Now
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

                            <div className="p-5">
                                {/* Base Item */}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-sm text-gray-800 line-clamp-1">{itemTitle}</p>
                                        <p className="text-xs text-muted-foreground">{isKit ? kitPlan : selectedVersion.title}</p>
                                    </div>
                                    <span className="font-semibold text-sm">₹{isKit ? kitPrice : selectedVersion.price}</span>
                                </div>

                                {/* Add On (Pooja Only) */}
                                {!isKit && selectedAddon.price > 0 && (
                                    <div className="flex justify-between items-start mb-3 text-sm">
                                        <p className="text-gray-600">{selectedAddon.label}</p>
                                        <span className="font-medium">₹{selectedAddon.price}</span>
                                    </div>
                                )}

                                <Separator className="my-4" />

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
                                    {useCoins && (
                                        <div className="flex justify-between text-green-600 font-medium">
                                            <span>BMS Coins Discount</span>
                                            <span>-₹{coinsDiscount}</span>
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
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Coupon Code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            className="w-full text-sm border rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-spiritual-green uppercase"
                                        />
                                        <Button size="sm" variant="secondary" className="text-xs bg-gray-200">Apply</Button>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                {/* Total */}
                                <div className="flex justify-between items-end mb-2">
                                    <span className="font-bold text-lg">Grand Total</span>
                                    <span className="font-black text-2xl text-maroon-dark">₹{grandTotal}</span>
                                </div>
                                <p className="text-right text-[10px] text-muted-foreground mb-6">Inclusive of all taxes</p>

                                {/* Date/Time preview if selected (Pooja Only) */}
                                {!isKit && date && (
                                    <div className="bg-spiritual-green/10 text-spiritual-green p-3 rounded-lg text-xs font-medium flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4" />
                                        {format(date, "PPP")} • {timeSlot.label.split(' ')[0]}
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
