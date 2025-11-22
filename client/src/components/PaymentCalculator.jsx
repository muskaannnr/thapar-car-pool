import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

const PaymentCalculator = ({ numberOfMembers }) => {
  // Base calculations
  const baseFare = 1200;
  const farePerPerson = baseFare / numberOfMembers;
  const serviceFee = farePerPerson * 0.05; // 5% service fee
  const gst = (farePerPerson + serviceFee) * 0.05; // 5% GST
  const totalFare = farePerPerson + serviceFee + gst;

  // Payment links for different number of members
  const paymentLinks = {
    1: "https://buy.stripe.com/test_6oEdTzf1L1hT8NidQZ",
    2: "https://buy.stripe.com/test_9AQbLr5rb3q10gM6oy",
    3: "https://buy.stripe.com/test_cN27vb5rb4u5gfK28j",
    4: "https://buy.stripe.com/test_00g3eV8Dn1hTe7C3co",
  };

  const handlePayment = () => {
    window.location.href = paymentLinks[numberOfMembers];
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-orange-500" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Base Fare</span>
            <span>₹{baseFare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Your Share ({numberOfMembers} members)</span>
            <span>₹{farePerPerson.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Service Fee (5%)</span>
            <span>₹{serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>GST (5%)</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>
          <div className="h-px bg-gray-200 my-2" />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total Amount</span>
            <span className="text-orange-600">₹{totalFare.toFixed(2)}</span>
          </div>
          <button
            onClick={handlePayment}
            className="w-full mt-4 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Pay Now
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentCalculator;
