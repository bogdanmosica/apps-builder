'use client';

import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Building, Home, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePropertyTypes } from '@/hooks/use-property-types';

interface AddPropertyButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'fab';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  hideTextOnMobile?: boolean;
  showLabel?: boolean;
  buttonText?: string; // Custom button text
}

export function AddPropertyButton({
  variant = 'default',
  size = 'default',
  className,
  hideTextOnMobile = true,
  showLabel = true,
  buttonText,
}: AddPropertyButtonProps) {
  const { t } = useTranslation('property');
  const { propertyTypes, loading: propertyTypesLoading } = usePropertyTypes();

  const getPropertyIcon = (propertyType: any) => {
    const name = propertyType.name_ro?.toLowerCase() || propertyType.name_en?.toLowerCase() || '';
    if (name.includes('cas') || name.includes('house') || name.includes('vila')) {
      return <Home className="h-4 w-4 mr-2" />;
    }
    return <Building className="h-4 w-4 mr-2" />;
  };

  const getPropertyName = (propertyType: any) => {
    // Use Romanian name by default, fallback to English
    return propertyType.name_ro || propertyType.name_en || `Property Type ${propertyType.id}`;
  };

  // FAB variant for mobile floating action button
  if (variant === 'fab') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className={cn(
              'fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50',
              'bg-primary hover:bg-primary/90 text-primary-foreground',
              className
            )}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {showLabel && (
            <>
              <DropdownMenuLabel>{t('addProperty')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          {propertyTypesLoading ? (
            <DropdownMenuItem disabled>
              <span className="text-sm text-muted-foreground">Loading...</span>
            </DropdownMenuItem>
          ) : propertyTypes.length > 0 ? (
            propertyTypes.map((propertyType) => (
              <DropdownMenuItem key={propertyType.id} asChild>
                <Link href={`/evaluation?type=${propertyType.id}`} className="flex items-center">
                  {getPropertyIcon(propertyType)}
                  {getPropertyName(propertyType)}
                </Link>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>
              <span className="text-sm text-muted-foreground">{t('noPropertyTypes')}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Standard dropdown button variants
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Plus className="h-4 w-4 mr-1" />
          <span className={hideTextOnMobile ? 'hidden sm:inline' : ''}>
            {buttonText || t('addProperty')}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {showLabel && (
          <>
            <DropdownMenuLabel>{t('addProperty')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {propertyTypesLoading ? (
          <DropdownMenuItem disabled>
            <span className="text-sm text-muted-foreground">Loading...</span>
          </DropdownMenuItem>
        ) : propertyTypes.length > 0 ? (
          propertyTypes.map((propertyType) => (
            <DropdownMenuItem key={propertyType.id} asChild>
              <Link href={`/evaluation?type=${propertyType.id}`} className="flex items-center">
                {getPropertyIcon(propertyType)}
                {getPropertyName(propertyType)}
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            <span className="text-sm text-muted-foreground">{t('noPropertyTypes')}</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
