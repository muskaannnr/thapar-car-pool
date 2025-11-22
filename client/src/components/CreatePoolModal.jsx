import React, { useState } from "react";
import { Calendar, Train, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { getAuthToken } from "@/utils/auth";

const CreatePoolModal = ({ isOpen, onClose, onSubmit }) => {
  const [trainNumber, setTrainNumber] = useState("");
  const [date, setDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("https://api.thaparpool.rebec.in/pool/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": getAuthToken(),
        },
        body: JSON.stringify({
          trainNo: trainNumber,
          journeyDate: date,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create pool");
      }

      const data = await response.json();

      // Show success toast
      toast({
        title: "Success!",
        description: "Pool has been created successfully.",
        variant: "default",
        className: "bg-green-50 border-green-200",
        duration: 3000,
      });

      // Call the onSubmit callback with the response data
      //   onSubmit(data);

      // Reset and close modal
      handleReset();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      toast({
        title: "Error",
        description: err.message || "Failed to create pool",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTrainNumber("");
    setDate("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Train className="w-5 h-5" />
              Create New Pool
            </DialogTitle>
          </div>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="trainNumber" className="flex items-center gap-2">
              <Train className="w-4 h-4" />
              Train Number
            </Label>
            <input
              id="trainNumber"
              type="text"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter train number"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Journey Date
            </Label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min={new Date().toISOString().split("T")[0]}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Pool"
              )}
            </Button>
            <Button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePoolModal;
