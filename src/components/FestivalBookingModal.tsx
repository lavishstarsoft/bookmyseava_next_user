import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, PartyPopper, User, Sparkles } from "lucide-react";

interface FestivalBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    festivalData: any;
}

const FestivalBookingModal = ({ isOpen, onClose, festivalData }: FestivalBookingModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    // Handled separately because shadcn Select/Switch/Checkbox don't work natively with register
    const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const { API_URL } = await import("@/config");

            // Format formData based on enquiry type
            const formattedFormData = festivalData.type === 'panchangam'
                ? Object.entries({ ...data, ...dynamicValues }).map(([key, value]) => ({
                    label: key,
                    value: value
                }))
                : { ...data, ...dynamicValues };

            const payload = {
                type: festivalData.type || 'festival', // Enquiry type for categorization
                festivalId: festivalData.identifier || "upcoming-festival",
                festivalName: festivalData.name,
                userDetails: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone
                },
                formData: formattedFormData
            };

            const response = await fetch(`${API_URL.replace('/api', '/api/v1')}/enquiries`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Booking failed");

            toast.success("Booking Successful!", {
                description: "May the divine blessings be with you. We will contact you shortly."
            });

            reset();
            setDynamicValues({});
            onClose();
        } catch (error) {
            toast.error("Booking Failed", { description: "Please try again later." });
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!festivalData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-lg max-h-[90vh] p-0 overflow-hidden bg-[#FFF9F0] gap-0 border-[#8D0303]/20 shadow-xl">

                {/* Header */}
                <div className="p-6 pb-0 bg-[#FFF9F0]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-[#8D0303] flex items-center gap-2 font-bold font-serif">
                            <PartyPopper className="h-6 w-6" />
                            Booking Details
                        </DialogTitle>
                        <DialogDescription className="text-base text-[#8D0303]/80 pt-1">
                            Review and fill the details to confirm your booking.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full bg-[#FFF9F0]">

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto max-h-[60vh] px-6 pb-6 pt-4 space-y-6 flex-1">

                        {/* User Information Card */}
                        <div className="bg-white p-5 rounded-lg border border-[#8D0303]/10 shadow-sm">
                            <h3 className="text-xs font-bold text-[#8D0303]/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <User className="h-3.5 w-3.5" /> User Information
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name" className="text-xs font-semibold text-[#8D0303]/70 uppercase mb-1.5 block">Name</Label>
                                    <Input
                                        id="name"
                                        {...register("name", { required: true })}
                                        placeholder="e.g. Rahul Sharma"
                                        className="bg-[#FFF9F0] border-[#8D0303]/20 focus-visible:ring-[#8D0303] focus-visible:ring-offset-0 focus-visible:border-[#8D0303] h-9"
                                    />
                                    {errors.name && <span className="text-red-500 text-[10px] font-medium">Name is required</span>}
                                </div>

                                <div>
                                    <Label htmlFor="phone" className="text-xs font-semibold text-[#8D0303]/70 uppercase mb-1.5 block">Phone</Label>
                                    <Input
                                        id="phone"
                                        {...register("phone", { required: true })}
                                        placeholder="+91"
                                        className="bg-[#FFF9F0] border-[#8D0303]/20 focus-visible:ring-[#8D0303] focus-visible:ring-offset-0 focus-visible:border-[#8D0303] h-9"
                                    />
                                    {errors.phone && <span className="text-red-500 text-[10px] font-medium">Phone is required</span>}
                                </div>

                                <div>
                                    <Label htmlFor="email" className="text-xs font-semibold text-[#8D0303]/70 uppercase mb-1.5 block">Email (Optional)</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register("email")}
                                        placeholder="name@example.com"
                                        className="bg-[#FFF9F0] border-[#8D0303]/20 focus-visible:ring-[#8D0303] focus-visible:ring-offset-0 focus-visible:border-[#8D0303] h-9"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pooja Preferences Section */}
                        {festivalData.formFields && festivalData.formFields.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-[#8D0303] uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Sparkles className="h-3.5 w-3.5" /> Pooja Preferences
                                </h3>

                                <div className="space-y-4 px-1">
                                    {festivalData.formFields.map((field: any) => (
                                        <div
                                            key={field.id}
                                            className="space-y-2"
                                        >
                                            <Label htmlFor={field.id} className="text-sm font-medium text-[#8D0303]/90">
                                                {field.label} {field.required && <span className="text-red-500 text-xs">*</span>}
                                            </Label>

                                            {/* Render Input based on type */}
                                            {field.type === 'textarea' ? (
                                                <Textarea
                                                    id={field.id}
                                                    required={field.required}
                                                    onChange={(e) => setDynamicValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                                                    className="min-h-[80px] bg-white border-[#8D0303]/20 focus-visible:ring-[#8D0303] focus-visible:ring-offset-0 focus-visible:border-[#8D0303] resize-none"
                                                />
                                            ) : field.type === 'select' ? (
                                                <Select onValueChange={(val) => setDynamicValues(prev => ({ ...prev, [field.id]: val }))}>
                                                    <SelectTrigger className="bg-white border-[#8D0303]/20 focus:ring-[#8D0303] focus:ring-offset-0">
                                                        <SelectValue placeholder={`Select ${field.label}`} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {field.options?.split(',')
                                                            .map((opt: string) => opt.trim())
                                                            .filter((opt: string) => opt !== "")
                                                            .map((opt: string) => (
                                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : field.type === 'radio' ? (
                                                <RadioGroup
                                                    onValueChange={(val) => setDynamicValues(prev => ({ ...prev, [field.id]: val }))}
                                                    className="flex flex-row flex-wrap gap-3 pt-1"
                                                >
                                                    {field.options?.split(',')
                                                        .map((opt: string) => opt.trim())
                                                        .filter((opt: string) => opt !== "")
                                                        .map((opt: string) => (
                                                            <div key={opt} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-md border border-[#8D0303]/20 hover:border-[#8D0303]/40 transition-colors cursor-pointer shadow-sm">
                                                                <RadioGroupItem value={opt} id={`${field.id}-${opt}`} className="text-[#8D0303] border-[#8D0303]" />
                                                                <Label htmlFor={`${field.id}-${opt}`} className="cursor-pointer font-normal text-sm">{opt}</Label>
                                                            </div>
                                                        ))}
                                                </RadioGroup>
                                            ) : field.type === 'checkbox' ? (
                                                <div className="flex items-center space-x-3 bg-white p-3 rounded-md border border-[#8D0303]/20 hover:border-[#8D0303]/40 transition-colors shadow-sm">
                                                    <Checkbox
                                                        id={field.id}
                                                        onCheckedChange={(checked) => setDynamicValues(prev => ({ ...prev, [field.id]: checked }))}
                                                        className="data-[state=checked]:bg-[#8D0303] data-[state=checked]:border-[#8D0303] border-[#8D0303]/50"
                                                    />
                                                    <Label htmlFor={field.id} className="cursor-pointer font-medium text-sm">
                                                        {field.options || "Yes, I agree"}
                                                    </Label>
                                                </div>
                                            ) : (
                                                <Input
                                                    id={field.id}
                                                    type={field.type}
                                                    required={field.required}
                                                    onChange={(e) => setDynamicValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                                                    className="bg-white border-[#8D0303]/20 focus-visible:ring-[#8D0303] focus-visible:ring-offset-0 focus-visible:border-[#8D0303] h-9"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Footer Actions */}
                    <div className="p-4 border-t border-[#8D0303]/10 bg-[#FFF9F0] flex justify-end gap-3 sticky bottom-0 backdrop-blur-sm">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="text-[#8D0303] border-[#8D0303]/30 hover:bg-[#8D0303]/10 bg-transparent"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#8D0303] hover:bg-[#720202] text-white shadow-md shadow-red-900/10 min-w-[140px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Confirming...
                                </>
                            ) : (
                                <>
                                    Confirm Booking
                                    <Sparkles className="ml-2 h-4 w-4 opacity-70" />
                                </>
                            )}
                        </Button>
                    </div>

                </form>
            </DialogContent>
        </Dialog>
    );
};

export default FestivalBookingModal;
