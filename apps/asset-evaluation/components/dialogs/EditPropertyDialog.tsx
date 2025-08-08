"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { useState } from "react";
import { toast } from "sonner";

interface EditPropertyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: {
    id: number;
    propertyName: string | null;
    propertyLocation: string | null;
  };
  onSuccess: () => void;
}

export default function EditPropertyDialog({
  isOpen,
  onClose,
  evaluation,
  onSuccess,
}: EditPropertyDialogProps) {
  const [propertyName, setPropertyName] = useState(
    evaluation.propertyName || "",
  );
  const [propertyLocation, setPropertyLocation] = useState(
    evaluation.propertyLocation || "",
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/evaluation/${evaluation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyName: propertyName.trim() || null,
          propertyLocation: propertyLocation.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update property");
      }

      toast.success("Property details updated successfully!");

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error("Failed to update property details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Property Details</DialogTitle>
          <DialogDescription>
            Update the name and location for this property evaluation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="propertyName">Property Name</Label>
            <Input
              id="propertyName"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="e.g., My Dream House, Downtown Apartment"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyLocation">Location</Label>
            <Input
              id="propertyLocation"
              value={propertyLocation}
              onChange={(e) => setPropertyLocation(e.target.value)}
              placeholder="e.g., 123 Main St, New York, NY"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary hover:bg-primary-dark"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
