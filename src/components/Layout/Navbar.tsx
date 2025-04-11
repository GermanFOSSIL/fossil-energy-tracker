
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  Menu, 
  Search, 
  User,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Test Pack T-001 is overdue", time: "10 minutes ago" },
    { id: 2, message: "ITR I-123 has been signed", time: "1 hour ago" },
    { id: 3, message: "New system added to Project Alpha", time: "3 hours ago" },
  ]);

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="mr-4"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-fossil-800">{t('common.appName').split(' ')[0]}</span>
          <span className="text-lg font-medium text-fossil-600">{t('common.appName').split(' ')[1]}</span>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative hidden md:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('common.search')}
            className="w-64 rounded-md border pl-10 pr-4 py-2 text-sm focus:border-fossil-500 focus:outline-none focus:ring-1 focus:ring-fossil-500"
          />
        </div>

        <LanguageSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-red-500 text-xs font-medium text-white flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>{t('dashboard.alerts')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex flex-col items-start py-2">
                <span className="font-medium">{notification.message}</span>
                <span className="text-xs text-gray-500">{notification.time}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sm font-medium text-fossil-600">
              {t('common.seeAll')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-fossil-700 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-gray-500">{t('users.roles.admin')}</p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('settings.profile.title')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{t('settings.profile.title')}</DropdownMenuItem>
            <DropdownMenuItem>{t('settings.title')}</DropdownMenuItem>
            <DropdownMenuItem>{t('projects.title')}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
