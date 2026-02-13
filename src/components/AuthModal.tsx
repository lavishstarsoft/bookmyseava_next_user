import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState, useEffect } from "react";
import { API_URL } from "../config";
import { useToast } from "@/hooks/use-toast";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { User, Mail, Lock, Phone, Eye, EyeOff, X, Globe, ArrowLeft } from "lucide-react";

interface AuthModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState("login");
    const [isNriLogin, setIsNriLogin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // OTP Login states
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [otpSent, setOtpSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    // Registration OTP states
    const [regMobileNumber, setRegMobileNumber] = useState("");
    const [regOtp, setRegOtp] = useState(["", "", "", ""]);
    const [regOtpSent, setRegOtpSent] = useState(false);
    const [regResendTimer, setRegResendTimer] = useState(0);
    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");

    // Timer effect for resend OTP
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Timer effect for registration resend OTP
    useEffect(() => {
        if (regResendTimer > 0) {
            const timer = setTimeout(() => setRegResendTimer(regResendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [regResendTimer]);

    const sendOtpApi = async (mobile: string, isSignup: boolean) => {
        const response = await fetch(`${API_URL}/v1/customer-auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile, isSignup })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
        return data;
    };

    const verifyOtpApi = async (payload: any) => {
        const response = await fetch(`${API_URL}/v1/customer-auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to verify OTP');
        return data;
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mobileNumber.length === 10) {
            setIsLoading(true);
            try {
                // Login flow: checking if user exists implicitly via backend error
                await sendOtpApi(mobileNumber, false);

                toast({
                    title: "OTP Sent",
                    description: "Please check your mobile for the OTP",
                    variant: "default"
                });

                setOtpSent(true);
                setResendTimer(30);
            } catch (error: any) {
                if (error.message.includes('User not found') || error.message.includes('register first')) {
                    toast({
                        title: "User Not Found",
                        description: "You are not registered. Redirecting to registration...",
                        variant: "destructive"
                    });

                    setTimeout(() => {
                        setActiveTab("register");
                        setRegMobileNumber(mobileNumber);
                        setOtpSent(false);
                    }, 1500);
                } else {
                    toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive"
                    });
                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpValue = otp.join("");
        if (otpValue.length === 4) {
            setIsLoading(true);
            try {
                const data = await verifyOtpApi({ mobile: mobileNumber, otp: otpValue, isSignup: false });

                // Store token and user
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Dispatch event to update Header state
                window.dispatchEvent(new Event('auth-change'));

                toast({
                    title: "Success",
                    description: "Login successful!",
                    variant: "default"
                });

                onOpenChange(false);
            } catch (error: any) {
                // Check if error is due to user not found (unregistered)
                if (error.message.includes('User not found') || error.message.includes('register first')) {
                    toast({
                        title: "User Not Found",
                        description: "You are not registered. Redirecting to registration...",
                        variant: "destructive"
                    });

                    // Switch to register tab and pre-fill mobile number
                    setTimeout(() => {
                        setActiveTab("register");
                        setRegMobileNumber(mobileNumber);
                        // Reset login state
                        setOtpSent(false);
                        setOtp(["", "", "", ""]);
                    }, 1500);
                } else {
                    toast({
                        title: "Verification Failed",
                        description: error.message,
                        variant: "destructive"
                    });
                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Auto-focus next input
            if (value && index < 3) {
                const nextInput = document.getElementById(`otp-${index + 1}`);
                nextInput?.focus();
            }
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer === 0) {
            setIsLoading(true);
            try {
                await sendOtpApi(mobileNumber, false);
                toast({ title: "OTP Resent", description: "OTP has been resent to your mobile number" });
                setOtp(["", "", "", ""]);
                setResendTimer(30);
            } catch (error: any) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const resetOtpForm = () => {
        setOtpSent(false);
        setOtp(["", "", "", ""]);
        setMobileNumber("");
        setResendTimer(0);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!regOtpSent && regMobileNumber.length === 10 && regName && regEmail) {
            setIsLoading(true);
            try {
                await sendOtpApi(regMobileNumber, true);

                toast({
                    title: "OTP Sent",
                    description: "Please check your mobile for the OTP",
                    variant: "default"
                });

                setRegOtpSent(true);
                setRegResendTimer(30);
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleRegVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpValue = regOtp.join("");
        if (otpValue.length === 4) {
            setIsLoading(true);
            try {
                const data = await verifyOtpApi({
                    mobile: regMobileNumber,
                    otp: otpValue,
                    name: regName,
                    email: regEmail,
                    isSignup: true
                });

                // Store token and user
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Dispatch event to update Header state
                window.dispatchEvent(new Event('auth-change'));

                toast({
                    title: "Success",
                    description: "Registration successful!",
                    variant: "default"
                });

                onOpenChange(false);
            } catch (error: any) {
                toast({
                    title: "Verification Failed",
                    description: error.message,
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleRegOtpChange = (index: number, value: string) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newOtp = [...regOtp];
            newOtp[index] = value;
            setRegOtp(newOtp);

            // Auto-focus next input
            if (value && index < 3) {
                const nextInput = document.getElementById(`reg-otp-${index + 1}`);
                nextInput?.focus();
            }
        }
    };

    const handleRegOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !regOtp[index] && index > 0) {
            const prevInput = document.getElementById(`reg-otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleRegResendOtp = async () => {
        if (regResendTimer === 0) {
            setIsLoading(true);
            try {
                await sendOtpApi(regMobileNumber, true);
                toast({ title: "OTP Resent", description: "OTP has been resent to your mobile number" });
                setRegOtp(["", "", "", ""]);
                setRegResendTimer(30);
            } catch (error: any) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const resetRegOtpForm = () => {
        setRegOtpSent(false);
        setRegOtp(["", "", "", ""]);
        setRegResendTimer(0);
    };

    // Auto-scroll to focused input
    useEffect(() => {
        const handleFocus = (e: FocusEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                }, 300);
            }
        };
        document.addEventListener('focusin', handleFocus);
        return () => document.removeEventListener('focusin', handleFocus);
    }, []);

    const formContent = (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card/50 border border-maroon/20">
                <TabsTrigger value="login" className="data-[state=active]:bg-spiritual-green data-[state=active]:text-white data-[state=inactive]:text-maroon font-semibold transition-all">Login</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-spiritual-green data-[state=active]:text-white data-[state=inactive]:text-maroon font-semibold transition-all">Register</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4 mt-4">
                {!isNriLogin ? (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                        {!otpSent ? (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mobile-number" className="flex items-center gap-2 text-maroon font-semibold">
                                        <Phone className="h-4 w-4 text-maroon" /> Mobile Number
                                    </Label>
                                    <Input
                                        id="mobile-number"
                                        type="tel"
                                        placeholder="Enter 10-digit mobile number"
                                        value={mobileNumber}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, "");
                                            if (value.length <= 10) setMobileNumber(value);
                                        }}
                                        required
                                        maxLength={10}
                                        disabled={isLoading}
                                        className="border-maroon/30 focus:border-spiritual-green focus:ring-2 focus:ring-spiritual-green/20 bg-white/80"
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-spiritual-green hover:bg-spiritual-green/90 text-white font-semibold shadow-lg shadow-spiritual-green/30" disabled={mobileNumber.length !== 10 || isLoading}>
                                    {isLoading ? 'Sending...' : 'Send OTP'}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex items-center gap-2 text-maroon font-semibold"><Lock className="h-4 w-4 text-maroon" /> Enter OTP</Label>
                                        <button type="button" onClick={resetOtpForm} className="text-xs text-spiritual-green hover:text-spiritual-green/80 font-medium transition-colors" disabled={isLoading}>Change Number</button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">OTP sent to +91 {mobileNumber}</p>
                                </div>
                                <div className="flex gap-2 justify-center">
                                    {otp.map((digit, index) => (
                                        <Input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            disabled={isLoading}
                                            className="w-12 h-12 text-center text-lg font-semibold border-border focus:border-maroon"
                                        />
                                    ))}
                                </div>
                                <Button type="submit" className="w-full bg-spiritual-green hover:bg-spiritual-green/90 text-white font-semibold shadow-lg shadow-spiritual-green/30" disabled={otp.join("").length !== 4 || isLoading}>
                                    {isLoading ? 'Verifying...' : 'Verify & Login'}
                                </Button>
                                <div className="text-center">
                                    {resendTimer > 0 ? (
                                        <p className="text-sm text-muted-foreground">Resend OTP in {resendTimer}s</p>
                                    ) : (
                                        <button type="button" onClick={handleResendOtp} className="text-sm text-spiritual-green hover:text-spiritual-green/80 transition-colors font-semibold" disabled={isLoading}>Resend OTP</button>
                                    )}
                                </div>
                            </form>
                        )}

                        {/* NRI Toggle */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-maroon/20" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground font-medium">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full border-maroon/30 text-maroon hover:bg-maroon/5 hover:text-maroon gap-2"
                            onClick={() => setIsNriLogin(true)}
                        >
                            <Globe className="h-4 w-4" /> NRI / International Login
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <Button variant="ghost" size="icon" onClick={() => setIsNriLogin(false)} className="-ml-2 h-8 w-8 text-maroon/70 hover:text-maroon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <h3 className="font-heading text-lg text-maroon">NRI Login</h3>
                        </div>

                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 border border-dashed border-maroon/20 rounded-lg bg-maroon/5">
                            <div className="bg-white p-3 rounded-full shadow-sm">
                                <Globe className="h-6 w-6 text-maroon" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-semibold text-maroon">Coming Soon</h4>
                                <p className="text-muted-foreground text-sm max-w-[240px] mx-auto">
                                    We are working on bringing international login support to you.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </TabsContent>

            {/* Register Tab */}
            < TabsContent value="register" className="space-y-4 mt-4" >
                {!regOtpSent ? (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="register-name" className="flex items-center gap-2 text-maroon font-semibold"><User className="h-4 w-4 text-maroon" /> Full Name</Label>
                            <Input id="register-name" type="text" placeholder="Enter your full name" value={regName} onChange={(e) => setRegName(e.target.value)} required disabled={isLoading} className="border-maroon/30 focus:border-spiritual-green focus:ring-2 focus:ring-spiritual-green/20 bg-white/80" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="register-email" className="flex items-center gap-2 text-maroon font-semibold"><Mail className="h-4 w-4 text-maroon" /> Email</Label>
                            <Input id="register-email" type="email" placeholder="Enter your email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required disabled={isLoading} className="border-maroon/30 focus:border-spiritual-green focus:ring-2 focus:ring-spiritual-green/20 bg-white/80" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="register-phone" className="flex items-center gap-2 text-maroon font-semibold"><Phone className="h-4 w-4 text-maroon" /> Phone Number</Label>
                            <Input id="register-phone" type="tel" placeholder="Enter 10-digit mobile number" value={regMobileNumber} onChange={(e) => { const value = e.target.value.replace(/\D/g, ""); if (value.length <= 10) setRegMobileNumber(value); }} required maxLength={10} disabled={isLoading} className="border-maroon/30 focus:border-spiritual-green focus:ring-2 focus:ring-spiritual-green/20 bg-white/80" />
                        </div>
                        <Button type="submit" className="w-full bg-spiritual-green hover:bg-spiritual-green/90 text-white font-semibold shadow-lg shadow-spiritual-green/30" disabled={!regName || !regEmail || regMobileNumber.length !== 10 || isLoading}>
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-4">
                            By creating an account, you agree to our <a href="#" className="text-maroon hover:underline">Terms of Service</a> and <a href="#" className="text-maroon hover:underline">Privacy Policy</a>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleRegVerifyOtp} className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2 text-maroon font-semibold"><Lock className="h-4 w-4 text-maroon" /> Enter OTP</Label>
                                <button type="button" onClick={resetRegOtpForm} className="text-xs text-spiritual-green hover:text-spiritual-green/80 font-medium transition-colors" disabled={isLoading}>Edit Details</button>
                            </div>
                            <p className="text-sm text-muted-foreground">OTP sent to +91 {regMobileNumber}</p>
                        </div>
                        <div className="flex gap-2 justify-center">
                            {regOtp.map((digit, index) => (
                                <Input
                                    key={index}
                                    id={`reg-otp-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleRegOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleRegOtpKeyDown(index, e)}
                                    disabled={isLoading}
                                    className="w-12 h-12 text-center text-lg font-semibold border-border focus:border-maroon"
                                />
                            ))}
                        </div>
                        <Button type="submit" className="w-full bg-spiritual-green hover:bg-spiritual-green/90 text-white font-semibold shadow-lg shadow-spiritual-green/30" disabled={regOtp.join("").length !== 4 || isLoading}>
                            {isLoading ? 'Verifying...' : 'Verify & Create Account'}
                        </Button>
                        <div className="text-center">
                            {regResendTimer > 0 ? (
                                <p className="text-sm text-muted-foreground">Resend OTP in {regResendTimer}s</p>
                            ) : (
                                <button type="button" onClick={handleRegResendOtp} className="text-sm text-spiritual-green hover:text-spiritual-green/80 transition-colors font-semibold" disabled={isLoading}>Resend OTP</button>
                            )}
                        </div>
                    </form>
                )}
            </TabsContent >
        </Tabs >
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="bg-gradient-to-br from-marigold/20 via-marigold/10 to-marigold/5 border-maroon/30 backdrop-blur-sm p-6 !pb-12 max-h-[85vh] [&>div.bg-muted]:hidden">
                    <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none">
                        <X className="h-6 w-6 text-maroon" />
                        <span className="sr-only">Close</span>
                    </DrawerClose>
                    <DrawerHeader className="text-left p-0 mb-4">
                        <DrawerTitle className="flex items-center gap-2 font-heading text-2xl text-maroon">
                            <User className="h-6 w-6 text-maroon" />
                            Welcome to Book My Seva
                        </DrawerTitle>
                        <DrawerDescription className="sr-only">
                            Login or Register to access services
                        </DrawerDescription>
                    </DrawerHeader>
                    {formContent}
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-md bg-gradient-to-br from-marigold/20 via-marigold/10 to-marigold/5 border-maroon/30 animate-slide-up backdrop-blur-sm safe-bottom p-6 !pb-12 overflow-y-auto max-h-[85vh]"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-heading text-2xl text-maroon">
                        <User className="h-6 w-6 text-maroon" />
                        Welcome to Book My Seva
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Login or Register to access Book My Seva services
                    </DialogDescription>
                </DialogHeader>

                {formContent}
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
