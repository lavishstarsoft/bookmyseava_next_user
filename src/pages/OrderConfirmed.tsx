import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, Package } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const OrderConfirmed = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const { title, amount } = location.state || {}; // Retrieve passed state

    // Redirect if no state (direct access protection)
    useEffect(() => {
        if (!location.state) {
           // Optional: Redirect to home if accessed directly without state
           // navigate('/'); 
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-border/50 shadow-lg animate-in fade-in zoom-in duration-500">
                <CardHeader className="flex flex-col items-center pb-2">
                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center text-green-800">Order Confirmed!</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4 pt-4">
                    <p className="text-slate-600">
                        Thank you for your purchase. Your order for <span className="font-semibold text-slate-800">{title || 'Pooja Kit'}</span> has been successfully placed.
                    </p>
                    
                    {amount && (
                        <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 mt-4">
                            <p className="text-sm text-slate-500 mb-1">Total Amount Paid</p>
                            <p className="text-2xl font-bold text-slate-900">₹{amount.toLocaleString('en-IN')}</p>
                        </div>
                    )}

                    <p className="text-sm text-muted-foreground mt-4">
                        You will receive a confirmation email and SMS shortly with the order details.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-4">
                    <Button 
                        className="w-full bg-maroon hover:bg-maroon-dark gap-2" 
                        onClick={() => navigate('/profile')}
                    >
                        <Package className="h-4 w-4" /> View My Orders
                    </Button>
                    <Button 
                        variant="outline" 
                        className="w-full gap-2" 
                        onClick={() => navigate('/')}
                    >
                        <Home className="h-4 w-4" /> Back to Home
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default OrderConfirmed;