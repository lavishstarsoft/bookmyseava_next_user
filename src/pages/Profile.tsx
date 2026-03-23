import React, { useState, useEffect } from "react";
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
    Plus,
    Clock,
    IndianRupee,
    Truck,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2
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
import AddressFormModal, { type AddressData } from "@/components/AddressFormModal";
import { API_URL } from "@/config";

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

interface KitOrder {
    _id: string;
    orderId: string;
    kit: { kitId: string; title: string; image: string; category: string };
    plan: { id: string; label: string; price: number };
    quantity: number;
    totalAmount: number;
    deliveryDate: string;
    deliverySlot: { id: string; label: string };
    deliveryAddress: { line1: string; city: string; state: string; pincode: string };
    status: 'pending' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed';
    createdAt: string;
    trackingId?: string;
    courierName?: string;
}

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

    // Orders State
    const [orders, setOrders] = useState<KitOrder[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<AddressData | null>(null);

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

                        await fetch(`${API_URL}/v1/customer-auth/profile`, {
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

    // Fetch orders when bookings tab is active
    useEffect(() => {
        if (activeTab === 'bookings') {
            const fetchOrders = async () => {
                setOrdersLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return;
                    const res = await fetch(`${API_URL}/v1/kit-orders/mine`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setOrders(Array.isArray(data) ? data : (data.orders || []));
                    }
                } catch (err) {
                    console.error('Failed to fetch orders:', err);
                } finally {
                    setOrdersLoading(false);
                }
            };
            fetchOrders();
        }
    }, [activeTab]);

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
                const response = await fetch(`${API_URL}/v1/customer-auth/profile`, {
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

                // Only logout if it's explicitly an auth error or no token exists
                if (err.message === "Token invalid or expired" || err.message.includes("Token invalid") || err.message === "No token found") {
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
    const handleAddAddress = () => {
        setEditingAddress(null);
        setIsAddressModalOpen(true);
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address as AddressData);
        setIsAddressModalOpen(true);
    };

    const handleAddressSave = async (savedAddr: AddressData) => {
        let newAddresses: Address[];
        const addrAsAddress = savedAddr as unknown as Address;
        if (editingAddress) {
            newAddresses = addresses.map(addr => addr.id === savedAddr.id ? addrAsAddress : addr);
        } else {
            newAddresses = [...addresses, addrAsAddress];
        }
        setAddresses(newAddresses);
        localStorage.setItem("addresses", JSON.stringify(newAddresses));
        setIsAddressModalOpen(false);

        // API Call to Update Backend
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await fetch(`${API_URL}/v1/customer-auth/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        address: {
                            name: savedAddr.name || '',
                            phone: savedAddr.phone || '',
                            street: savedAddr.houseNo + (savedAddr.area ? `, ${savedAddr.area}` : ''),
                            city: savedAddr.city,
                            state: savedAddr.state,
                            zip: savedAddr.pincode,
                            country: 'India'
                        }
                    })
                });
                toast({ title: "Success", description: "Address synced to your profile." });
            }
        } catch (err) {
            console.error("Failed to sync address", err);
        }

        toast({ title: editingAddress ? "Address Updated" : "Address Added", description: editingAddress ? "Your address details have been updated." : "New address has been added to your book." });
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
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold">My Bookings</h2>
                                    <Badge variant="secondary" className="bg-maroon/10 text-maroon">
                                        {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                                    </Badge>
                                </div>

                                {ordersLoading ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <Loader2 className="h-8 w-8 animate-spin text-maroon mb-3" />
                                        <p className="text-muted-foreground">Loading your bookings...</p>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <Card className="border-border/50 shadow-sm border-dashed">
                                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="h-16 w-16 bg-maroon/10 rounded-full flex items-center justify-center mb-4">
                                                <Calendar className="h-8 w-8 text-maroon" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-900">No Bookings Yet</h3>
                                            <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                                                You haven't booked any poojas yet. Start your spiritual journey today.
                                            </p>
                                            <Button className="bg-maroon hover:bg-maroon-dark" onClick={() => window.location.href = '/'}>
                                                Book a Pooja Now
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => {
                                            const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
                                                pending: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: <AlertCircle className="h-3.5 w-3.5" />, label: 'Pending' },
                                                confirmed: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Confirmed' },
                                                out_for_delivery: { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: <Truck className="h-3.5 w-3.5" />, label: 'Out for Delivery' },
                                                delivered: { color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Delivered' },
                                                cancelled: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: <XCircle className="h-3.5 w-3.5" />, label: 'Cancelled' },
                                            };
                                            const paymentConfig: Record<string, { color: string; label: string }> = {
                                                pending: { color: 'text-amber-600', label: 'Payment Pending' },
                                                paid: { color: 'text-green-600', label: 'Paid' },
                                                failed: { color: 'text-red-600', label: 'Payment Failed' },
                                            };
                                            const sc = statusConfig[order.status] || statusConfig.pending;
                                            const pc = paymentConfig[order.paymentStatus] || paymentConfig.pending;
                                            const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                                            const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

                                            return (
                                                <Card key={order._id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer" onClick={() => { if (order.kit?.kitId) window.location.href = `/pooja-kit/${order.kit.kitId}`; }}>
                                                    {/* Order Header */}
                                                    <div className="bg-slate-50 border-b border-border/50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-mono font-semibold text-slate-500">{order.orderId}</span>
                                                            <span className="text-xs text-muted-foreground">Ordered on {orderDate}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className={`${sc.bg} ${sc.color} border gap-1 text-xs font-medium`}>
                                                                {sc.icon} {sc.label}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <CardContent className="p-4">
                                                        <div className="flex gap-4">
                                                            {/* Kit Image */}
                                                            <div className="flex-shrink-0">
                                                                <div className="h-20 w-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                                                    {order.kit?.image ? (
                                                                        <img src={order.kit.image} alt={order.kit.title} className="h-full w-full object-cover" />
                                                                    ) : (
                                                                        <div className="h-full w-full flex items-center justify-center">
                                                                            <Package className="h-8 w-8 text-slate-300" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Order Details */}
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold text-slate-900 truncate">{order.kit?.title || 'Pooja Kit'}</h3>
                                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-slate-600">
                                                                    {order.plan?.label && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Package className="h-3.5 w-3.5 text-slate-400" />
                                                                            {order.plan.label}
                                                                        </span>
                                                                    )}
                                                                    <span className="flex items-center gap-1">
                                                                        Qty: {order.quantity}
                                                                    </span>
                                                                </div>

                                                                {/* Delivery Info */}
                                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                                                                    {deliveryDate && (
                                                                        <span className="flex items-center gap-1 text-slate-600">
                                                                            <Calendar className="h-3.5 w-3.5 text-maroon/60" />
                                                                            {deliveryDate}
                                                                        </span>
                                                                    )}
                                                                    {order.deliverySlot?.label && (
                                                                        <span className="flex items-center gap-1 text-slate-600">
                                                                            <Clock className="h-3.5 w-3.5 text-maroon/60" />
                                                                            {order.deliverySlot.label}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Tracking Info */}
                                                                {(order.trackingId || order.courierName) && (
                                                                    <div className="mt-2 p-2 bg-slate-50 rounded-md border border-slate-100 text-sm">
                                                                        {order.courierName && (
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Courier</span>
                                                                                <span className="text-slate-900 font-medium">{order.courierName}</span>
                                                                            </div>
                                                                        )}
                                                                        {order.trackingId && (
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Tracking #</span>
                                                                                <span className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-xs">
                                                                                    {order.trackingId}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Address */}
                                                                {order.deliveryAddress && (
                                                                    <div className="flex items-start gap-1 mt-2 text-xs text-slate-500">
                                                                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                                        <span>
                                                                            {order.deliveryAddress.line1}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Price & Payment */}
                                                            <div className="flex-shrink-0 text-right">
                                                                <div className="flex items-center justify-end gap-0.5 text-lg font-bold text-slate-900">
                                                                    <IndianRupee className="h-4 w-4" />
                                                                    {order.totalAmount?.toLocaleString('en-IN')}
                                                                </div>
                                                                <span className={`text-xs font-medium ${pc.color}`}>{pc.label}</span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
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

                                {/* Address Modal - Shared Component */}
                                <AddressFormModal
                                    open={isAddressModalOpen}
                                    onOpenChange={setIsAddressModalOpen}
                                    onSave={handleAddressSave}
                                    editAddress={editingAddress}
                                />
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
