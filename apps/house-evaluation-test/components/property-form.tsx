"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import { Bath, Bed, Euro, Home, MapPin, Ruler, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LISTING_TYPE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  ROMANIAN_COUNTIES,
} from "../lib/constants";

interface PropertyFormData {
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
  price: string;
  area: string;
  rooms: string;
  bedrooms: string;
  bathrooms: string;
  floor: string;
  totalFloors: string;
  yearBuilt: string;
  features: string;
  amenities: string;
}

export function PropertyForm({
  initialData,
  propertyId,
}: {
  initialData?: Partial<PropertyFormData>;
  propertyId?: number;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    propertyType: initialData?.propertyType || "apartment",
    listingType: initialData?.listingType || "sale",
    address: initialData?.address || "",
    city: initialData?.city || "",
    county: initialData?.county || "",
    postalCode: initialData?.postalCode || "",
    price: initialData?.price || "",
    area: initialData?.area || "",
    rooms: initialData?.rooms || "",
    bedrooms: initialData?.bedrooms || "",
    bathrooms: initialData?.bathrooms || "",
    floor: initialData?.floor || "",
    totalFloors: initialData?.totalFloors || "",
    yearBuilt: initialData?.yearBuilt || "",
    features: initialData?.features || "",
    amenities: initialData?.amenities || "",
  });

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = propertyId
        ? `/api/properties/${propertyId}`
        : "/api/properties";
      const method = propertyId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          area: formData.area ? parseInt(formData.area) : null,
          rooms: formData.rooms ? parseInt(formData.rooms) : null,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          floor: formData.floor ? parseInt(formData.floor) : null,
          totalFloors: formData.totalFloors
            ? parseInt(formData.totalFloors)
            : null,
          yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
        }),
      });

      if (response.ok) {
        const property = await response.json();
        router.push(`/properties/${property.id}`);
      } else {
        console.error("Failed to save property");
      }
    } catch (error) {
      console.error("Error saving property:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-6 w-6" />
            {propertyId ? "Editează proprietatea" : "Adaugă proprietate nouă"}
          </CardTitle>
          <CardDescription>
            {propertyId
              ? "Modifică detaliile proprietății tale"
              : "Completează formularul pentru a adăuga o proprietate nouă"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informații de bază</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titlu anunț *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("title", e.target.value)
                    }
                    placeholder="ex. Apartament 2 camere, zona centrală"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preț (EUR) *</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      placeholder="150000"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Tip proprietate *</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) =>
                      handleInputChange("propertyType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează tipul" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPE_OPTIONS.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="listingType">Tip anunț *</Label>
                  <Select
                    value={formData.listingType}
                    onValueChange={(value) =>
                      handleInputChange("listingType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează tipul" />
                    </SelectTrigger>
                    <SelectContent>
                      {LISTING_TYPE_OPTIONS.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descriere</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Descrie proprietatea în detaliu..."
                  rows={4}
                />
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Locație
              </h3>

              <div className="space-y-2">
                <Label htmlFor="address">Adresa *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Strada și numărul"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Oraș *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="București"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="county">Județ *</Label>
                  <Select
                    value={formData.county}
                    onValueChange={(value) =>
                      handleInputChange("county", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează județul" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROMANIAN_COUNTIES.map((county) => (
                        <SelectItem key={county} value={county}>
                          {county}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Cod poștal</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) =>
                      handleInputChange("postalCode", e.target.value)
                    }
                    placeholder="010101"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Detalii proprietate
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Suprafață (mp)</Label>
                  <Input
                    id="area"
                    type="number"
                    value={formData.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    placeholder="75"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rooms">Camere</Label>
                  <Input
                    id="rooms"
                    type="number"
                    value={formData.rooms}
                    onChange={(e) => handleInputChange("rooms", e.target.value)}
                    placeholder="3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Dormitoare</Label>
                  <div className="relative">
                    <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) =>
                        handleInputChange("bedrooms", e.target.value)
                      }
                      placeholder="2"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Băi</Label>
                  <div className="relative">
                    <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) =>
                        handleInputChange("bathrooms", e.target.value)
                      }
                      placeholder="1"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="floor">Etaj</Label>
                  <Input
                    id="floor"
                    type="number"
                    value={formData.floor}
                    onChange={(e) => handleInputChange("floor", e.target.value)}
                    placeholder="2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalFloors">Total etaje</Label>
                  <Input
                    id="totalFloors"
                    type="number"
                    value={formData.totalFloors}
                    onChange={(e) =>
                      handleInputChange("totalFloors", e.target.value)
                    }
                    placeholder="4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearBuilt">An construcție</Label>
                  <Input
                    id="yearBuilt"
                    type="number"
                    value={formData.yearBuilt}
                    onChange={(e) =>
                      handleInputChange("yearBuilt", e.target.value)
                    }
                    placeholder="2010"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Features & Amenities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Caracteristici și facilități
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="features">Caracteristici</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) =>
                      handleInputChange("features", e.target.value)
                    }
                    placeholder="ex. Balcon, Boxă, Loc parcare"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amenities">Facilități</Label>
                  <Textarea
                    id="amenities"
                    value={formData.amenities}
                    onChange={(e) =>
                      handleInputChange("amenities", e.target.value)
                    }
                    placeholder="ex. Lift, Interfon, Securitate"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Anulează
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Se salvează..."
                  : propertyId
                    ? "Actualizează proprietatea"
                    : "Adaugă proprietatea"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
