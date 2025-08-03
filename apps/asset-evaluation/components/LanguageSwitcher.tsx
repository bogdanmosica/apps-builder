'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Languages, Globe } from 'lucide-react';
import { useDropdownFix } from '../hooks/useDropdownFix';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Use our custom hook to prevent scrollbar issues
  useDropdownFix(isOpen);

  const changeLanguage = (language: 'ro' | 'en') => {
    i18n.changeLanguage(language);
    setIsOpen(false);
  };

  const getCurrentLanguageLabel = () => {
    return i18n.language === 'en' ? t('english', { ns: 'common' }) : t('romanian', { ns: 'common' });
  };

  const getCurrentLanguageFlag = () => {
    return i18n.language === 'en' ? '🇺🇸' : '🇷🇴';
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-2 text-text-base hover:text-primary"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{getCurrentLanguageLabel()}</span>
          <span className="sm:hidden">{getCurrentLanguageFlag()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-40"
        sideOffset={4}
        alignOffset={0}
        avoidCollisions={true}
        collisionPadding={8}
      >
        <DropdownMenuItem
          onClick={() => changeLanguage('ro')}
          className={`flex items-center gap-3 ${
            i18n.language === 'ro' ? 'bg-bg-base font-medium' : ''
          }`}
        >
          <span className="text-lg">🇷🇴</span>
          <span>{t('romanian', { ns: 'common' })}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage('en')}
          className={`flex items-center gap-3 ${
            i18n.language === 'en' ? 'bg-bg-base font-medium' : ''
          }`}
        >
          <span className="text-lg">🇺🇸</span>
          <span>{t('english', { ns: 'common' })}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
