import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
    User,
    MapPin,
    Calendar,
    Heart,
    Settings,
    LogOut,
    Camera,
    Edit2,
    Package,
    ChevronRight,
    Phone,
    Mail,
    Shield,
    CreditCard,
    Trash2,
    Plus
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

// --- Mock Data ---
interface UserProfile {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    joinDate: string;
}

interface Address {
    id: string;
    label: string;
    name: string;
    houseNo: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    landmark?: string;
    isDefault?: boolean;
}

const initialAddressForm = {
    label: "Home",
    name: "",
    houseNo: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    isDefault: false
};

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const Profile = () => {
    const { toast } = useToast();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [activeTab, setActiveTab] = useState("profile");
    const [isLoading, setIsLoading] = useState(true);

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserProfile | null>(null);

    // Address State
    const [addresses, setAddresses] = useState<Address[]>([]);

    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [addressForm, setAddressForm] = useState<Address>(initialAddressForm as Address);

    // Load addresses from local storage AND sync to backend
    useEffect(() => {
        const savedAddresses = localStorage.getItem("addresses");
        if (savedAddresses) {
            const parsedAddresses = JSON.parse(savedAddresses);
            setAddresses(parsedAddresses);

            // Auto-sync the first/default address to backend
            const syncToBackend = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (token && parsedAddresses.length > 0) {
                        // Find default address or use first one
                        const primaryAddr = parsedAddresses.find((a: Address) => a.isDefault) || parsedAddresses[0];

                        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'}/customer-auth/profile`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                address: {
                                    name: primaryAddr.name || '',
                                    phone: primaryAddr.phone || '',
                                    street: primaryAddr.houseNo + (primaryAddr.area ? `, ${primaryAddr.area}` : '') + (primaryAddr.landmark ? `, ${primaryAddr.landmark}` : ''),
                                    city: primaryAddr.city,
                                    state: primaryAddr.state,
                                    zip: primaryAddr.pincode,
                                    country: 'India'
                                }
                            })
                        });
                        console.log('[Profile] Address synced to backend');
                    }
                } catch (err) {
                    console.error('[Profile] Failed to sync address:', err);
                }
            };
            syncToBackend();
        } else {
            // No saved addresses, initialize empty
            setAddresses([]);
        }
    }, []);

    // Save addresses to local storage whenever they change
    useEffect(() => {
        if (addresses.length > 0) {
            localStorage.setItem("addresses", JSON.stringify(addresses));
        }
    }, [addresses]);


    // Sync formData with user when user changes
    useEffect(() => {
        if (user) {
            setFormData(user);
        }
    }, [user]);

    const handleSaveProfile = () => {
        if (formData) {
            setUser(formData);
            localStorage.setItem("user", JSON.stringify(formData));
            setIsEditing(false);
            toast({
                title: "Profile Updated",
                description: "Your personal information has been updated successfully.",
            });
        }
    };

    const handleCancelEdit = () => {
        setFormData(user);
        setIsEditing(false);
    };

    // Load user from backend (Secure Check)
    useEffect(() => {
        const verifyUserSession = async () => {
            try {
                const token = localStorage.getItem("token");
                const storedUser = localStorage.getItem("user");

                if (!token) {
                    throw new Error("No token found");
                }

                // If we have stored user, show it initially for speed (Optimistic UI)
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }

                // Verify with backend
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'}/customer-auth/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        throw new Error("Token invalid or expired");
                    }
                    throw new Error(`API Error: ${response.statusText}`);
                }

                const data = await response.json();

                // Update user with fresh data from server
                setUser(data.user);

                // Update local storage to keep it fresh
                localStorage.setItem("user", JSON.stringify(data.user));

            } catch (err: any) {
                console.error("Session verification failed:", err);

                // Only logout if it's explicitly an auth error
                if (err.message === "Token invalid or expired" || err.message.includes("Token invalid")) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/";
                } else {
                    // For other errors (network, server 500), just keep the user logged in with cached data
                    toast({
                        variant: "destructive",
                        title: "Sync Failed",
                        description: "Could not sync latest profile data. Using cached version."
                    });
                }
            } finally {
                setIsLoading(false);
            }
        };

        verifyUserSession();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    // Handler for Live button click
    const handleLiveButtonClick = () => {
        // Navigate to live darshan page
        window.location.href = "/live-darshan";
    };

    // Address Handlers
    const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAddressForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddAddress = () => {
        setAddressForm({ ...initialAddressForm, id: Math.random().toString(36).substr(2, 9) } as Address);
        setEditingAddressId(null);
        setIsAddressModalOpen(true);
    };

    const handleEditAddress = (address: Address) => {
        setAddressForm(address);
        setEditingAddressId(address.id);
        setIsAddressModalOpen(true);
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [addressToDeleteId, setAddressToDeleteId] = useState<string | null>(null);

    const handleDeleteAddress = (id: string) => {
        setAddressToDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteAddress = () => {
        if (addressToDeleteId) {
            setAddresses(prev => {
                const newAddresses = prev.filter(addr => addr.id !== addressToDeleteId);
                localStorage.setItem("addresses", JSON.stringify(newAddresses));
                return newAddresses;
            });
            toast({ title: "Address Deleted", description: "Address has been removed from your book." });
            setIsDeleteModalOpen(false);
            setAddressToDeleteId(null);
        }
    };

    const submitAddressForm = async () => {
        if (!addressForm.name || !addressForm.houseNo || !addressForm.city || !addressForm.phone) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
            return;
        }

        // Optimistic UI Update first
        let newAddresses = [];
        if (editingAddressId) {
            newAddresses = addresses.map(addr => addr.id === editingAddressId ? addressForm : addr);
        } else {
            newAddresses = [...addresses, addressForm];
        }
        setAddresses(newAddresses);
        setIsAddressModalOpen(false);

        // API Call to Update Backend
        try {
            const token = localStorage.getItem('token'); // Assuming token is stored here
            if (token) {
                // We send the 'primary' or default address to backend profile
                // For now, we just send the one currently being added/edited as the profile address
                // Ideally, we might want to sync the whole list, but for Superadmin "derived address", sending the active one is good.

                await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'}/customer-auth/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        address: {
                            name: addressForm.name || '',
                            phone: addressForm.phone || '',
                            street: addressForm.houseNo + (addressForm.area ? `, ${addressForm.area}` : ''),
                            city: addressForm.city,
                            state: addressForm.state,
                            zip: addressForm.pincode,
                            country: 'India'
                        }
                    })
                });
                toast({ title: "Success", description: "Address synced to your profile." });
            }
        } catch (err) {
            console.error("Failed to sync address", err);
            // We don't revert UI because localStorage is still valid, just sync failed
        }

        if (editingAddressId) {
            toast({ title: "Address Updated", description: "Your address details have been updated." });
        } else {
            toast({ title: "Address Added", description: "New address has been added to your book." });
        }
    };

    const navItems = [
        { id: "profile", label: "My Profile", icon: User },
        { id: "bookings", label: "My Bookings", icon: Calendar },
        { id: "addresses", label: "Address Book", icon: MapPin },
        { id: "favorites", label: "Favorites", icon: Heart },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Profile Header Banner (Mobile Only) */}
            <div className="md:hidden bg-gradient-to-r from-maroon to-maroon-dark text-white p-6 pb-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/mandala.png')]"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl mb-3">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-marigold text-maroon text-2xl font-bold">
                            {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <h1 className="text-2xl font-bold">{user?.name}</h1>
                    <p className="text-white/80">{user?.phone}</p>
                </div>
            </div>

            <main className="container max-w-6xl mx-auto py-8 px-4 md:px-8 -mt-8 md:mt-0 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* Sidebar Navigation */}
                    <div className="md:col-span-3 lg:col-span-3">
                        <Card className="border-border/50 shadow-md overflow-hidden sticky top-24">
                            {/* Desktop Profile Summary */}
                            <div className="hidden md:flex flex-col items-center p-6 bg-gradient-to-b from-maroon/5 to-transparent border-b border-border/50">
                                <div className="relative mb-4">
                                    <Avatar className="h-20 w-20 border-2 border-maroon/20">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-maroon to-red-800 text-white text-xl">
                                            {user?.name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full absolute bottom-0 right-0 shadow-sm border border-white">
                                        <Camera className="h-3 w-3" />
                                    </Button>
                                </div>
                                <h2 className="font-bold text-lg text-center leading-tight">{user?.name}</h2>
                                <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
                            </div>

                            <div className="p-2">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === item.id
                                            ? "bg-maroon text-white shadow-md shadow-maroon/20"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                            }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                        {activeTab === item.id && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
                                    </button>
                                ))}

                                <Separator className="my-2" />

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                            </div>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-9 lg:col-span-9 space-y-6">

                        {/* --- MY PROFILE TAB --- */}
                        {activeTab === "profile" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Card className="border-border/50 shadow-sm">
                                    <CardHeader className="border-b border-border/50 bg-slate-50/50">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle className="text-xl">Personal Information</CardTitle>
                                                <CardDescription>Manage your personal details</CardDescription>
                                            </div>
                                            {!isEditing ? (
                                                <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsEditing(true)}>
                                                    <Edit2 className="h-3 w-3" /> Edit
                                                </Button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                                                        Cancel
                                                    </Button>
                                                    <Button size="sm" className="bg-maroon hover:bg-maroon-dark text-white" onClick={handleSaveProfile}>
                                                        Save Changes
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Full Name</Label>
                                                {isEditing ? (
                                                    <div className="relative group">
                                                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-maroon transition-colors" />
                                                        <Input
                                                            value={formData?.name || ''}
                                                            onChange={(e) => setFormData(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                                                            className="pl-10 bg-white border-2 border-slate-200 focus:border-maroon focus:ring-4 focus:ring-maroon/10 transition-all font-medium text-slate-900 shadow-sm h-11"
                                                            placeholder="Enter your full name"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                        <User className="h-4 w-4 text-maroon/50" />
                                                        <span className="font-medium text-slate-800">{user?.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Mobile Number</Label>
                                                {isEditing ? (
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                                                        <Input
                                                            value={formData?.phone || ''}
                                                            disabled
                                                            className="pl-10 bg-slate-100/50 text-slate-500 cursor-not-allowed border-slate-200 h-11"
                                                        />
                                                        <Badge variant="secondary" className="absolute right-3 top-3 bg-green-100 text-green-700 text-[10px] pointer-events-none">Verified</Badge>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                        <Phone className="h-4 w-4 text-maroon/50" />
                                                        <span className="font-medium text-slate-800">{user?.phone}</span>
                                                        <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700 hover:bg-green-100">Verified</Badge>
                                                    </div>
                                                )}
                                                {isEditing && <p className="text-[10px] text-muted-foreground ml-1">Mobile number cannot be changed.</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Email Address</Label>
                                                {isEditing ? (
                                                    <div className="relative group">
                                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-maroon transition-colors" />
                                                        <Input
                                                            value={formData?.email || ''}
                                                            onChange={(e) => setFormData(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                                                            className="pl-10 bg-white border-2 border-slate-200 focus:border-maroon focus:ring-4 focus:ring-maroon/10 transition-all font-medium text-slate-900 shadow-sm h-11"
                                                            placeholder="Enter your email"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                        <Mail className="h-4 w-4 text-maroon/50" />
                                                        <span className="font-medium text-slate-800">{user?.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Member Since</Label>
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 opacity-80">
                                                    <Shield className="h-4 w-4 text-maroon/50" />
                                                    <span className="font-medium text-slate-800">{user?.joinDate || "Recent"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* --- MY BOOKINGS TAB --- */}
                        {activeTab === "bookings" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Card className="border-border/50 shadow-sm border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="h-16 w-16 bg-maroon/10 rounded-full flex items-center justify-center mb-4">
                                            <Calendar className="h-8 w-8 text-maroon" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900">No Bookings Yet</h3>
                                        <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                                            You haven't booked any poojas yet. Start your spiritual journey today.
                                        </p>
                                        <Button className="bg-maroon hover:bg-maroon-dark">
                                            Book a Pooja Now
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* --- ADDRESSES TAB --- */}
                        {activeTab === "addresses" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">Saved Addresses</h2>
                                    <Button size="sm" className="bg-maroon hover:bg-maroon-dark text-white" onClick={handleAddAddress}>
                                        <Plus className="w-4 h-4 mr-2" /> Add New Address
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className="group relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
                                        >
                                            {/* Decorative Left Accent */}
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8D0303]"></div>

                                            <div className="p-5 pl-7 flex flex-col h-full">
                                                {/* Header & Actions */}
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="font-bold text-lg text-slate-800 tracking-tight capitalize">{addr.name}</h3>
                                                    <div className="flex gap-1 -mr-2 -mt-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:text-[#8D0303] hover:bg-red-50 rounded-full transition-colors"
                                                            onClick={() => handleEditAddress(addr)}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                            onClick={() => handleDeleteAddress(addr.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Address Details */}
                                                <div className="flex-grow space-y-4">
                                                    <p className="text-sm text-slate-600 leading-relaxed">
                                                        <span className="block text-slate-900 font-medium mb-1">{addr.houseNo}</span>
                                                        {addr.area ? `${addr.area}, ` : ''}
                                                        {addr.landmark ? <span className="text-slate-500 italic">{addr.landmark}, </span> : ''}
                                                        {addr.city}
                                                        <br />
                                                        <span className="text-slate-500">{addr.state}</span> - <span className="font-semibold text-slate-900">{addr.pincode}</span>
                                                    </p>

                                                    {/* Phone Section */}
                                                    <div className="flex items-center gap-2 pt-3 border-t border-dashed border-slate-100">
                                                        <div className="h-6 w-6 rounded-full bg-[#8D0303]/5 flex items-center justify-center">
                                                            <Phone className="h-3 w-3 text-[#8D0303]" />
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-700 tracking-wide">{addr.phone}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {addresses.length === 0 && (
                                        <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                            <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                            <h3 className="text-lg font-medium text-slate-900">No Addresses Found</h3>
                                            <p className="text-slate-500">Add a delivery address to make booking easier.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Address Modal */}
                                <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                                    <DialogContent className="sm:max-w-[500px] bg-[#FFF9F0] border-[#8D0303]/20 shadow-xl p-0 gap-0">

                                        {/* Header */}
                                        <div className="p-6 pb-0 bg-[#FFF9F0]">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl text-[#8D0303] font-bold font-serif">{editingAddressId ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                                                <DialogDescription className="text-base text-[#8D0303]/80 pt-1">
                                                    Enter your delivery details below.
                                                </DialogDescription>
                                            </DialogHeader>
                                        </div>

                                        <div className="overflow-y-auto max-h-[60vh] px-6 pb-6 pt-4 space-y-6 flex-1 bg-[#FFF9F0]">
                                            <div className="bg-white p-5 rounded-lg border border-[#8D0303]/10 shadow-sm grid gap-4">

                                                {/* Full Name */}
                                                <div>
                                                    <Label htmlFor="name" className="text-xs font-semibold text-[#8D0303]/70 uppercase mb-1.5 block">Full name (First and Last name)</Label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        value={addressForm.name}
                                                        onChange={handleAddressInputChange}
                                                        className="bg-[#FFF9F0] border-[#8D0303]/20 focus-visible:ring-[#8D0303] focus-visible:ring-offset-0 focus-visible:border-[#8D0303] h-9"
                                                    />
                                                </div>

                                                {/* Mobile Number */}
                                                <div>
                                                    <Label htmlFor="phone" className="text-xs font-semibold text-[#8D0303]/70 uppercase mb-1.5 block">Mobile number</Label>
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        value={addressForm.phone}
                                                        onChange={handleAddressInputChange}
                                                        className="bg-[#FFF9F0] border-[#8D0303]/20 focus-visible:ring-[#8D0303] focus-visible:ring-offset-0 focus-visible:border-[#8D0303] h-9"
                                                    />
                                                    <p className="text-[10px] text-muted-foreground mt-1">May be used to assist delivery</p>
                                                </div>

                                                {/* Pincode */}
                                                <div>
                                                    <Label htmlFor="pincode" className="text-xs font-semibold text-[#8D0303]/70 uppercase mb-1.5 block">Pincode</Label>
                                                    <Input
                                                        id="pincode"
                                                        name="pincode"
                                                        value={addressForm.pincode}
                                                        onChange={handleAddressInputChange}
                                                        placeholder="6 digits [0-9] PIN code"
                                                        className="bg-[#FFF9F0] border-[#8D0303]/20 focus-visible:ring-[#8D0303] focus-visible:ring-offset-0 focus-visible:border-[#8D0303] h-9"
                                                    />
                                                </div>

                                                {/* House No */}
                                                <div>
                                                    <Label htmlFor="houseNo" className="text-xs font-semibold text-[#8D0303]/70 uppercase mb-1.5 block">Flat, House no., Building, Company, Apartment</Label>
                                                    <Input
                                                        id="houseNo"
                                                        name="houseNo"
                                                        value={addressForm.houseNo}
                                                        onChange={handleAddressInputChange}
                                                        className="bg-[#FFF9F0] border-[#8D0303]/20 focus-visible:ring-[#8D0303] focus-visible:ring-offset-0 focus-visible:border-[#8D0303] h-9"
                                                    />
                                                </div>

                                                {/* Area */}
                                                <div>
                                                    <Label htmlFor="area" className="text-xs font-semibold text-[#8D0303]/70 uppercase mb-1.5 block">Area, Street, Sector, Village</Label>
                                                    <Input
                                                        id="area"
                                                        name="area"
                                                        value={addressForm.area}
                                                        onChange={handleAddressInputChange}
                                                        className="bg-[#FFF9F0] border-[#8D0303]/20 focus-visible:ring-[#8D0303] focus-visible:ring-offset-0 focus-visible:border-[#8D0303] h-9"
                                                    />
                                                </div>

                                                {/* Landmark */}
                                                <div>
                                                    <Label htmlFor="landmark" className="text-xs font-semibold text-[#8D0303]/70 uppercase mb-1.5 block">Landmark</Label>
                                                    <Input
                                                        id="landmark"
                                                        name="landmark"
                                                        value={addressForm.landmark || ''}
                                                        onChange={handleAddressInputChange}
                                                        placeholder="E.g. near apollo hospital"
                                                        className="bg-[#FFF9F0] border-[#8D0303]/20 focus-visible:ring-[#8D0303] focus-visible:ring-offset-0 focus-visible:border-[#8D0303] h-9"
                                                    />
                                                </div>

                                                {/* City and State */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="city" className="text-xs font-semibold text-[#8D0303]/70 uppercase mb-1.5 block">Town/City</Label>
                                                        <Input
                                                            id="city"
                                                            name="city"
                                                            value={addressForm.city}
                                                            onChange={handleAddressInputChange}
                                                            className="bg-[#FFF9F0] border-[#8D0303]/20 focus-visible:ring-[#8D0303] focus-visible:ring-offset-0 focus-visible:border-[#8D0303] h-9"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="state" className="text-xs font-semibold text-[#8D0303]/70 uppercase mb-1.5 block">State</Label>
                                                        <select
                                                            id="state"
                                                            name="state"
                                                            value={addressForm.state}
                                                            onChange={handleAddressInputChange}
                                                            className="flex h-9 w-full rounded-md border border-[#8D0303]/20 bg-[#FFF9F0] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8D0303] focus-visible:ring-offset-0 focus:border-[#8D0303] disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                                        >
                                                            <option value="" disabled>Choose a state</option>
                                                            {INDIAN_STATES.map((state) => (
                                                                <option key={state} value={state}>{state}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        <div className="p-4 border-t border-[#8D0303]/10 bg-[#FFF9F0] flex justify-end gap-3 sticky bottom-0 backdrop-blur-sm rounded-b-lg">
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsAddressModalOpen(false)}
                                                className="text-[#8D0303] border-[#8D0303]/30 hover:bg-[#8D0303]/10 bg-transparent"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={submitAddressForm}
                                                className="bg-[#8D0303] hover:bg-[#720202] text-white shadow-md shadow-red-900/10"
                                            >
                                                Save Address
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                {/* Delete Confirmation Modal */}
                                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                                    <DialogContent className="sm:max-w-[400px] bg-[#FFF9F0] border-[#8D0303]/20 shadow-xl p-0 gap-0">
                                        <div className="p-6 pb-0 bg-[#FFF9F0] text-center">
                                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                                                <Trash2 className="h-8 w-8 text-red-600" />
                                            </div>
                                            <DialogHeader>
                                                <DialogTitle className="text-xl text-[#8D0303] font-bold font-serif text-center">Delete Address?</DialogTitle>
                                                <DialogDescription className="text-center text-[#8D0303]/80 pt-2">
                                                    Are you sure you want to delete this address? This action cannot be undone.
                                                </DialogDescription>
                                            </DialogHeader>
                                        </div>
                                        <div className="p-6 bg-[#FFF9F0] flex justify-center gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsDeleteModalOpen(false)}
                                                className="w-full text-[#8D0303] border-[#8D0303]/30 hover:bg-[#8D0303]/10 bg-transparent"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={confirmDeleteAddress}
                                                className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-900/10"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}

                        {/* --- FAVORITES TAB --- */}
                        {activeTab === "favorites" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Card className="border-border/50 shadow-sm border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                            <Heart className="h-8 w-8 text-red-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900">Your Wishlist is Empty</h3>
                                        <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                                            Save poojas and kits you're interested in to access them quickly later.
                                        </p>
                                        <Button variant="outline" className="border-maroon text-maroon hover:bg-maroon/5">
                                            Explore Services
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
