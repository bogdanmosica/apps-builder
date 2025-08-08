"use client";

import { Badge } from "@workspace/ui/components/badge";
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
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Bath,
  Bed,
  Calendar,
  Euro,
  Eye,
  Heart,
  Home,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Ruler,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PropertyEvaluationForm } from "@/components/evaluation/property-evaluation-form";
import { PropertyQualityScore } from "@/components/evaluation/property-quality-score";
import type { Property } from "@/lib/db/schema";

interface PropertyDetailClientProps {
  property: Property;
}

export function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const propertyTypes = {
    apartment: "Apartament",
    house: "Casă",
    villa: "Vilă",
    studio: "Studio",
    duplex: "Duplex",
    penthouse: "Penthouse",
    townhouse: "Casă în șir",
    commercial: "Spaţiu comercial",
    office: "Birou",
    land: "Teren",
  };

  const listingTypes = {
    sale: "Vânzare",
    rent: "Închiriere",
  };

  const formatPrice = (price: number, currency: string = "EUR") => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/property-inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: property.id,
          ...contactData,
        }),
      });

      if (response.ok) {
        toast.success("Mesajul a fost trimis cu succes!");
        setContactData({ name: "", email: "", phone: "", message: "" });
        setShowContactForm(false);
      } else {
        toast.error("A apărut o eroare. Încercați din nou.");
      }
    } catch (error) {
      console.error("Error sending inquiry:", error);
      toast.error("A apărut o eroare. Încercați din nou.");
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      const response = await fetch("/api/property-favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ propertyId: property.id }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: property.title,
        text: `Verifică această proprietate: ${property.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link-ul a fost copiat în clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          ← Înapoi la listă
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl md:text-3xl mb-2">
                      {property.title}
                    </CardTitle>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>
                        {property.address}, {property.city}, {property.county}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary">
                        {
                          listingTypes[
                            property.listingType as keyof typeof listingTypes
                          ]
                        }
                      </Badge>
                      <Badge variant="outline">
                        {
                          propertyTypes[
                            property.propertyType as keyof typeof propertyTypes
                          ]
                        }
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {formatPrice(property.price, property.currency)}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Eye className="h-4 w-4 mr-1" />
                      {property.views} vizualizări
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleFavoriteToggle}
                    className="flex items-center gap-2"
                  >
                    <Heart
                      className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
                    />
                    {isFavorite ? "Elimină din favorite" : "Adaugă la favorite"}
                  </Button>
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Distribuie
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Property Images */}
            <Card>
              <CardContent className="p-0">
                <div className="h-64 md:h-96 bg-gray-200 rounded-lg overflow-hidden">
                  {property.mainImage ? (
                    <img
                      src={property.mainImage}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Home className="h-16 w-16" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalii proprietate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {property.area && (
                    <div className="flex items-center gap-2">
                      <Ruler className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-semibold">{property.area} mp</div>
                        <div className="text-sm text-gray-500">Suprafață</div>
                      </div>
                    </div>
                  )}

                  {property.rooms && (
                    <div className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-semibold">{property.rooms}</div>
                        <div className="text-sm text-gray-500">Camere</div>
                      </div>
                    </div>
                  )}

                  {property.bedrooms && (
                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-semibold">{property.bedrooms}</div>
                        <div className="text-sm text-gray-500">Dormitoare</div>
                      </div>
                    </div>
                  )}

                  {property.bathrooms && (
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-semibold">
                          {property.bathrooms}
                        </div>
                        <div className="text-sm text-gray-500">Băi</div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.floor && (
                    <div>
                      <span className="font-semibold">Etaj:</span>{" "}
                      {property.floor}
                      {property.totalFloors && ` din ${property.totalFloors}`}
                    </div>
                  )}

                  {property.yearBuilt && (
                    <div>
                      <span className="font-semibold">An construcție:</span>{" "}
                      {property.yearBuilt}
                    </div>
                  )}

                  {property.postalCode && (
                    <div>
                      <span className="font-semibold">Cod poștal:</span>{" "}
                      {property.postalCode}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {property.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Descriere</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Features & Amenities */}
            {(property.features || property.amenities) && (
              <Card>
                <CardHeader>
                  <CardTitle>Caracteristici și facilități</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.features && (
                    <div>
                      <h4 className="font-semibold mb-2">Caracteristici:</h4>
                      <p className="text-gray-700">{property.features}</p>
                    </div>
                  )}

                  {property.amenities && (
                    <div>
                      <h4 className="font-semibold mb-2">Facilități:</h4>
                      <p className="text-gray-700">{property.amenities}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Property Quality Score */}
            <PropertyQualityScore
              propertyId={property.id}
              showBreakdown={true}
            />

            {/* Property Evaluation Form */}
            {!showEvaluationForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>Evaluează această proprietate</CardTitle>
                  <CardDescription>
                    Contribuie la evaluarea calității acestei proprietăți
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setShowEvaluationForm(true)}
                    className="w-full"
                  >
                    Începe evaluarea
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <PropertyEvaluationForm
                propertyId={property.id}
                propertyTitle={property.title}
                onComplete={() => {
                  setShowEvaluationForm(false);
                  // You could also refresh the quality score here
                }}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contactează proprietarul</CardTitle>
                <CardDescription>
                  Trimite o întrebare despre această proprietate
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showContactForm ? (
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowContactForm(true)}
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Trimite mesaj
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Sună acum
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Trimite email
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Numele tău *</Label>
                      <Input
                        id="name"
                        value={contactData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setContactData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactData.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setContactData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={contactData.phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setContactData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Mesaj *</Label>
                      <Textarea
                        id="message"
                        value={contactData.message}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setContactData((prev) => ({
                            ...prev,
                            message: e.target.value,
                          }))
                        }
                        placeholder="Sunt interessat de această proprietate..."
                        required
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Trimite
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowContactForm(false)}
                      >
                        Anulează
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Property Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informații proprietate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID proprietate:</span>
                  <span className="font-semibold">#{property.id}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Publicat la:</span>
                  <span className="font-semibold">
                    {formatDate(property.createdAt)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Actualizat la:</span>
                  <span className="font-semibold">
                    {formatDate(property.updatedAt)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="outline" className="capitalize">
                    {property.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Similar Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Proprietăți similare</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  În curând vei putea vedea proprietăți similare cu aceasta.
                </p>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/properties">Vezi toate proprietățile</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
