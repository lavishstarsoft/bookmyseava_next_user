import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export interface AddressData {
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

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

interface AddressFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (address: AddressData) => void;
    editAddress?: AddressData | null;
}

const emptyForm = { name: '', houseNo: '', area: '', landmark: '', city: '', state: '', pincode: '', phone: '' };

const AddressFormModal: React.FC<AddressFormModalProps> = ({ open, onOpenChange, onSave, editAddress }) => {
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        if (open) {
            if (editAddress) {
                setForm({
                    name: editAddress.name || '',
                    houseNo: editAddress.houseNo || '',
                    area: editAddress.area || '',
                    landmark: editAddress.landmark || '',
                    city: editAddress.city || '',
                    state: editAddress.state || '',
                    pincode: editAddress.pincode || '',
                    phone: editAddress.phone || '',
                });
            } else {
                setForm(emptyForm);
            }
        }
    }, [open, editAddress]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!form.name || !form.houseNo || !form.city || !form.phone || !form.pincode) return;
        const address: AddressData = {
            ...form,
            id: editAddress?.id || Math.random().toString(36).substr(2, 9),
            label: editAddress?.label || 'Home',
            isDefault: editAddress?.isDefault ?? false,
        };
        onSave(address);
        setForm(emptyForm);
    };

    const isEditing = !!editAddress;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-[#FFF9F0] border-[#8D0303]/20 shadow-xl p-0 gap-0">

                {/* Header */}
                <div className="p-6 pb-0 bg-[#FFF9F0]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-[#8D0303] font-bold font-serif">
                            {isEditing ? 'Edit Address' : 'Add New Address'}
                        </DialogTitle>
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
                                value={form.name}
                                onChange={handleChange}
                                className="bg-[#FFF9F0] border-[#8D0303]/20 focus-visible:ring-[#8D0303] focus-visible:ring-offset-0 focus-visible:border-[#8D0303] h-9"
                            />
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <Label htmlFor="phone" className="text-xs font-semibold text-[#8D0303]/70 uppercase mb-1.5 block">Mobile number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
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
                                value={form.pincode}
                                onChange={handleChange}
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
                                value={form.houseNo}
                                onChange={handleChange}
                                className="bg-[#FFF9F0] border-[#8D0303]/20 focus-visible:ring-[#8D0303] focus-visible:ring-offset-0 focus-visible:border-[#8D0303] h-9"
                            />
                        </div>

                        {/* Area */}
                        <div>
                            <Label htmlFor="area" className="text-xs font-semibold text-[#8D0303]/70 uppercase mb-1.5 block">Area, Street, Sector, Village</Label>
                            <Input
                                id="area"
                                name="area"
                                value={form.area}
                                onChange={handleChange}
                                className="bg-[#FFF9F0] border-[#8D0303]/20 focus-visible:ring-[#8D0303] focus-visible:ring-offset-0 focus-visible:border-[#8D0303] h-9"
                            />
                        </div>

                        {/* Landmark */}
                        <div>
                            <Label htmlFor="landmark" className="text-xs font-semibold text-[#8D0303]/70 uppercase mb-1.5 block">Landmark</Label>
                            <Input
                                id="landmark"
                                name="landmark"
                                value={form.landmark}
                                onChange={handleChange}
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
                                    value={form.city}
                                    onChange={handleChange}
                                    className="bg-[#FFF9F0] border-[#8D0303]/20 focus-visible:ring-[#8D0303] focus-visible:ring-offset-0 focus-visible:border-[#8D0303] h-9"
                                />
                            </div>
                            <div>
                                <Label htmlFor="state" className="text-xs font-semibold text-[#8D0303]/70 uppercase mb-1.5 block">State</Label>
                                <select
                                    id="state"
                                    name="state"
                                    value={form.state}
                                    onChange={handleChange}
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
                        onClick={() => onOpenChange(false)}
                        className="text-[#8D0303] border-[#8D0303]/30 hover:bg-[#8D0303]/10 bg-transparent"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-[#8D0303] hover:bg-[#720202] text-white shadow-md shadow-red-900/10"
                    >
                        Save Address
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddressFormModal;
