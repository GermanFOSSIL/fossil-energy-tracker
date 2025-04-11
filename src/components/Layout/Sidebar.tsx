
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Workflow,
  Layers,
  ClipboardList,
  FileCheck,
  Users,
  FileBarChart,
  Settings,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface SidebarProps {
  isOpen: boolean;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive?: boolean;
  isNested?: boolean;
}

interface SidebarGroupProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

const SidebarItem = ({ icon, label, path, isActive, isNested }: SidebarItemProps) => {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
          isActive
            ? 'bg-fossil-700 text-white'
            : 'text-gray-300 hover:bg-fossil-800 hover:text-white',
          isNested && 'ml-8 text-xs'
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

const SidebarGroup = ({ icon, label, children }: SidebarGroupProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-fossil-800 hover:text-white">
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
};

const Sidebar = ({ isOpen }: SidebarProps) => {
  const { t } = useTranslation();
  
  return (
    <div
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 flex-col bg-fossil-900 transition-all duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0',
        isOpen ? 'md:w-64' : 'md:w-20'
      )}
    >
      <div className="flex flex-col gap-1 p-3">
        <SidebarItem
          icon={<LayoutDashboard className="h-5 w-5" />}
          label={t('navigation.dashboard')}
          path="/dashboard"
        />

        <SidebarGroup
          icon={<Workflow className="h-5 w-5" />}
          label={t('navigation.projectManagement')}
        >
          <SidebarItem
            icon={<Workflow className="h-4 w-4" />}
            label={t('navigation.projects')}
            path="/projects"
            isNested
          />
          <SidebarItem
            icon={<Layers className="h-4 w-4" />}
            label={t('navigation.systems')}
            path="/systems"
            isNested
          />
          <SidebarItem
            icon={<Layers className="h-4 w-4" />}
            label={t('navigation.subsystems')}
            path="/subsystems"
            isNested
          />
        </SidebarGroup>

        <SidebarGroup
          icon={<ClipboardList className="h-5 w-5" />}
          label={t('navigation.documentation')}
        >
          <SidebarItem
            icon={<ClipboardList className="h-4 w-4" />}
            label={t('navigation.itrs')}
            path="/itrs"
            isNested
          />
          <SidebarItem
            icon={<FileCheck className="h-4 w-4" />}
            label={t('navigation.testPacks')}
            path="/test-packs"
            isNested
          />
        </SidebarGroup>

        <SidebarItem
          icon={<Users className="h-5 w-5" />}
          label={t('navigation.users')}
          path="/users"
        />

        <SidebarItem
          icon={<FileBarChart className="h-5 w-5" />}
          label={t('navigation.reports')}
          path="/reports"
        />

        <SidebarItem
          icon={<Settings className="h-5 w-5" />}
          label={t('navigation.settings')}
          path="/settings"
        />
      </div>
    </div>
  );
};

export default Sidebar;
