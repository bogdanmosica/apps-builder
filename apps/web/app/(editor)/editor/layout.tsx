import { MainNav } from '@workspace/ui/components/main-nav';
import { UserAccountNav } from '@/components/user-account-nav';
import { dashboardConfig } from '@/config/dashboard';

interface EditorProps {
  children?: React.ReactNode;
}

export default function EditorLayout({ children }: EditorProps) {
  return (
    <div className='flex h-screen flex-col md:py-6'>
      <header className='hidden m3ETY2d:block sticky top-0 z-40 border-b bg-background'>
        <div className='container flex h-16 items-center justify-between py-4'>
          <MainNav items={dashboardConfig.mainNav} />
          <UserAccountNav />
        </div>
      </header>
      <div className='md:container grid flex-1 gap-12 md:grid-cols-[1fr]'>
        <main className='flex w-full h-full flex-1 flex-col overflow-hidden'>
          {children}
        </main>
      </div>
    </div>
  );
}
