import { DashboardConfig } from '@workspace/types';
import { DashboardNav } from '@workspace/ui/components/nav';
import { NavigationMenu } from '@workspace/ui/components/navigation-menu';
import { dashboardConfig } from '../../../../config/dashboard';

interface EditorPageProps {
  params: { compositionId: string };
}

export default async function EditorPage({ params }: EditorPageProps) {
  return (
    <div className='w-full grid flex-1 gap-12 md:grid-cols-[200px_1fr]'>
      <aside className='hidden w-[200px] flex-col md:flex'>
        <DashboardNav items={dashboardConfig.sidebarNav} />
      </aside>
      {/* <PlayerNavContainer /> */}
      <NavigationMenu
        className='md:hidden sticky bottom-0'
        //items={dashboardConfig.sidebarNav}
      />
    </div>
  );
}
