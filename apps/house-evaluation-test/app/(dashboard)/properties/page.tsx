'use client';

import { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { Search, MapPin, Bed, Bath, Ruler, Euro, Filter } from 'lucide-react';
import Link from 'next/link';
import { Property } from '@/lib/db/schema';
import { PropertyQualityScore } from '@/components/evaluation/property-quality-score';

const ALL_VALUES = 'all';

const romanianCounties = [
  'Alba',
  'Arad',
  'Argeş',
  'Bacău',
  'Bihor',
  'Bistriţa-Năsăud',
  'Botoşani',
  'Braşov',
  'Brăila',
  'Bucureşti',
  'Buzău',
  'Caraş-Severin',
  'Călăraşi',
  'Cluj',
  'Constanţa',
  'Covasna',
  'Dâmboviţa',
  'Dolj',
  'Galaţi',
  'Giurgiu',
  'Gorj',
  'Harghita',
  'Hunedoara',
  'Ialomiţa',
  'Iaşi',
  'Ilfov',
  'Maramureş',
  'Mehedinţi',
  'Mureş',
  'Neamţ',
  'Olt',
  'Prahova',
  'Satu Mare',
  'Sălaj',
  'Sibiu',
  'Suceava',
  'Teleorman',
  'Timiş',
  'Tulcea',
  'Vaslui',
  'Vâlcea',
  'Vrancea',
];

const propertyTypes = [
  { value: 'apartment', label: 'Apartament' },
  { value: 'house', label: 'Casă' },
  { value: 'villa', label: 'Vilă' },
  { value: 'studio', label: 'Studio' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'townhouse', label: 'Casă în șir' },
  { value: 'commercial', label: 'Spaţiu comercial' },
  { value: 'office', label: 'Birou' },
  { value: 'land', label: 'Teren' },
];

const listingTypes = [
  { value: 'sale', label: 'Vânzare' },
  { value: 'rent', label: 'Închiriere' },
];

interface Filters {
  propertyType: string;
  listingType: string;
  city: string;
  county: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  rooms: string;
  bedrooms: string;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    propertyType: ALL_VALUES,
    listingType: ALL_VALUES,
    city: '',
    county: ALL_VALUES,
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    rooms: '',
    bedrooms: ALL_VALUES,
  });

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value === ALL_VALUES ? '' : value);
      });

      const response = await fetch(`/api/properties?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    fetchProperties();
  };

  const clearFilters = () => {
    setFilters({
      propertyType: ALL_VALUES,
      listingType: ALL_VALUES,
      city: '',
      county: ALL_VALUES,
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      rooms: '',
      bedrooms: ALL_VALUES,
    });
  };

  const formatPrice = (price: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeLabel = (type: string) => {
    return propertyTypes.find((pt) => pt.value === type)?.label || type;
  };

  const getListingTypeLabel = (type: string) => {
    return listingTypes.find((lt) => lt.value === type)?.label || type;
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto py-8 px-4'>
        {/* Header */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Proprietăți imobiliare
            </h1>
            <p className='text-gray-600'>
              Descoperă proprietățile perfecte pentru tine
            </p>
          </div>
          <div className='flex gap-3 mt-4 md:mt-0'>
            <Link href='/evaluation-test'>
              <Button variant='outline'>Test Evaluation</Button>
            </Link>
            <Link href='/properties/add'>
              <Button>Add Property with Rating</Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className='mb-8'>
          <CardHeader className='pb-4 px-6 pt-6'>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-2'>
                <Search className='h-5 w-5' />
                Caută proprietăți
              </CardTitle>
              <Button
                variant='outline'
                onClick={() => setShowFilters(!showFilters)}
                size='sm'
              >
                <Filter className='h-4 w-4 mr-2' />
                {showFilters ? 'Ascunde filtre' : 'Afișează filtre'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-4 px-6 pb-6'>
            {/* Basic Search */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='propertyType'>Tip proprietate</Label>
                <Select
                  value={filters.propertyType}
                  onValueChange={(value) =>
                    handleFilterChange('propertyType', value)
                  }
                >
                  <SelectTrigger
                    id='propertyType'
                    className='h-10 border-2 border-blue-200 focus:border-blue-500 bg-white'
                  >
                    <SelectValue placeholder='Toate tipurile' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUES}>Toate tipurile</SelectItem>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='listingType'>Tip anunț</Label>
                <Select
                  value={filters.listingType}
                  onValueChange={(value) =>
                    handleFilterChange('listingType', value)
                  }
                >
                  <SelectTrigger
                    id='listingType'
                    className='h-10 border-2 border-blue-200 focus:border-blue-500 bg-white'
                  >
                    <SelectValue placeholder='Toate' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUES}>Toate</SelectItem>
                    {listingTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='city'>Oraș</Label>
                <Input
                  id='city'
                  value={filters.city}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleFilterChange('city', e.target.value)
                  }
                  placeholder='ex. București'
                  className='h-10 border-2 border-blue-200 focus:border-blue-500 bg-white'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='county'>Județ</Label>
                <Select
                  value={filters.county}
                  onValueChange={(value) => handleFilterChange('county', value)}
                >
                  <SelectTrigger
                    id='county'
                    className='h-10 border-2 border-blue-200 focus:border-blue-500 bg-white'
                  >
                    <SelectValue placeholder='Toate județele' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUES}>Toate județele</SelectItem>
                    {romanianCounties.map((county) => (
                      <SelectItem key={county} value={county}>
                        {county}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <>
                <Separator className='my-4' />
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='minPrice'>Preț minim (EUR)</Label>
                    <Input
                      id='minPrice'
                      type='number'
                      value={filters.minPrice}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFilterChange('minPrice', e.target.value)
                      }
                      placeholder='0'
                      className='h-10 border-2 border-blue-200 focus:border-blue-500 bg-white'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='maxPrice'>Preț maxim (EUR)</Label>
                    <Input
                      id='maxPrice'
                      type='number'
                      value={filters.maxPrice}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFilterChange('maxPrice', e.target.value)
                      }
                      placeholder='1000000'
                      className='h-10 border-2 border-blue-200 focus:border-blue-500 bg-white'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='minArea'>Suprafață min (mp)</Label>
                    <Input
                      id='minArea'
                      type='number'
                      value={filters.minArea}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFilterChange('minArea', e.target.value)
                      }
                      placeholder='0'
                      className='h-10 border-2 border-blue-200 focus:border-blue-500 bg-white'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='maxArea'>Suprafață max (mp)</Label>
                    <Input
                      id='maxArea'
                      type='number'
                      value={filters.maxArea}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFilterChange('maxArea', e.target.value)
                      }
                      placeholder='500'
                      className='h-10 border-2 border-blue-200 focus:border-blue-500 bg-white'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='rooms'>Numărul de camere</Label>
                    <Select
                      value={filters.rooms}
                      onValueChange={(value) =>
                        handleFilterChange('rooms', value)
                      }
                    >
                      <SelectTrigger
                        id='rooms'
                        className='h-10 border-2 border-blue-200 focus:border-blue-500 bg-white'
                      >
                        <SelectValue placeholder='Orice' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=''>Orice</SelectItem>
                        <SelectItem value='1'>1 cameră</SelectItem>
                        <SelectItem value='2'>2 camere</SelectItem>
                        <SelectItem value='3'>3 camere</SelectItem>
                        <SelectItem value='4'>4 camere</SelectItem>
                        <SelectItem value='5'>5+ camere</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='bedrooms'>Numărul de dormitoare</Label>
                    <Select
                      value={filters.bedrooms}
                      onValueChange={(value) =>
                        handleFilterChange('bedrooms', value)
                      }
                    >
                      <SelectTrigger
                        id='bedrooms'
                        className='h-10 border-2 border-blue-200 focus:border-blue-500 bg-white'
                      >
                        <SelectValue placeholder='Orice' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='0'>Orice</SelectItem>
                        <SelectItem value='1'>1 dormitor</SelectItem>
                        <SelectItem value='2'>2 dormitoare</SelectItem>
                        <SelectItem value='3'>3 dormitoare</SelectItem>
                        <SelectItem value='4'>4+ dormitoare</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Search Actions */}
            <div className='flex gap-4 mt-6'>
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className='h-4 w-4 mr-2' />
                {isLoading ? 'Se caută...' : 'Caută proprietăți'}
              </Button>
              <Button variant='outline' onClick={clearFilters}>
                Resetează filtrele
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div>
          <div className='flex items-center justify-between mb-6'>
            <p className='text-gray-600'>
              {isLoading
                ? 'Se încarcă...'
                : `${properties.length} proprietăți găsite`}
            </p>
          </div>

          {isLoading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {[...Array(6)].map((_, i) => (
                <Card key={i} className='animate-pulse'>
                  <div className='h-48 bg-gray-200 rounded-t-lg'></div>
                  <CardContent className='p-4'>
                    <div className='h-4 bg-gray-200 rounded mb-2'></div>
                    <div className='h-4 bg-gray-200 rounded w-2/3 mb-4'></div>
                    <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <Card>
              <CardContent className='text-center py-12'>
                <p className='text-gray-500'>
                  Nu au fost găsite proprietăți cu criteriile selectate.
                </p>
                <Button
                  variant='outline'
                  onClick={clearFilters}
                  className='mt-4'
                >
                  Resetează filtrele
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {properties.map((property) => (
                <Link key={property.id} href={`/properties/${property.id}`}>
                  <Card className='hover:shadow-lg transition-shadow cursor-pointer'>
                    <div className='h-48 bg-gray-200 rounded-t-lg relative overflow-hidden'>
                      {property.mainImage ? (
                        <img
                          src={property.mainImage}
                          alt={property.title}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center text-gray-400'>
                          <MapPin className='h-12 w-12' />
                        </div>
                      )}
                      <div className='absolute top-2 left-2'>
                        <span className='bg-blue-600 text-white px-2 py-1 rounded text-sm'>
                          {getListingTypeLabel(property.listingType)}
                        </span>
                      </div>
                      <div className='absolute top-2 right-2'>
                        <span className='bg-white text-gray-800 px-2 py-1 rounded text-sm'>
                          {getPropertyTypeLabel(property.propertyType)}
                        </span>
                      </div>
                    </div>
                    <CardContent className='p-4'>
                      <h3 className='font-semibold text-lg mb-2 line-clamp-2'>
                        {property.title}
                      </h3>

                      <div className='flex items-center text-gray-600 mb-2'>
                        <MapPin className='h-4 w-4 mr-1' />
                        <span className='text-sm'>
                          {property.city}, {property.county}
                        </span>
                      </div>

                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center text-blue-600 font-bold text-xl'>
                          <Euro className='h-5 w-5 mr-1' />
                          {formatPrice(property.price, property.currency)}
                        </div>
                        <PropertyQualityScore
                          propertyId={property.id}
                          compact={true}
                        />
                      </div>

                      <div className='flex items-center justify-between text-sm text-gray-600'>
                        <div className='flex items-center space-x-4'>
                          {property.area && (
                            <div className='flex items-center'>
                              <Ruler className='h-4 w-4 mr-1' />
                              {property.area} mp
                            </div>
                          )}
                          {property.bedrooms && (
                            <div className='flex items-center'>
                              <Bed className='h-4 w-4 mr-1' />
                              {property.bedrooms}
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className='flex items-center'>
                              <Bath className='h-4 w-4 mr-1' />
                              {property.bathrooms}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
