import { MainNav } from '@workspace/ui/components/main-nav';
import { ModeToggle } from '@workspace/ui/components/mode-toggle';
import { SiteFooter } from '@workspace/ui/components/site-footer';
import { LoginAvatarBtn } from '@/components/login-avatar-btn';
import { marketingConfig } from '../../config/marketing';
import { auth } from '@/auth';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  const session = await auth();
  console.log({ session });
  return (
    <div className='flex min-h-screen flex-col'>
      <header className='container z-40 bg-background sticky top-0'>
        <div className='flex h-20 items-center justify-between py-6'>
          <MainNav items={marketingConfig?.mainNav} />
          <nav className='flex items-center'>
            <ModeToggle />
            <LoginAvatarBtn user={session?.user} />
          </nav>
        </div>
      </header>
      <main className='flex-1'>{children}</main>
      <SiteFooter />
    </div>
  );
}
