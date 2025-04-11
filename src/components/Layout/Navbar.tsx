
import { useTranslation } from 'react-i18next';
import { Menu, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UserMenu from '@/components/Layout/UserMenu';
import { Profile } from '@/types/profile';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  toggleSidebar: () => void;
  currentUser?: Profile | null;
}

const Navbar = ({ toggleSidebar, currentUser }: NavbarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h1 className="text-xl font-bold text-fossil-600">FOSSIL</h1>
          <span className="ml-2 text-xl font-light text-fossil-500">Energies</span>
        </div>
      </div>
      <div className="flex-1 px-8">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder={t('common.search')}
            className="w-full bg-gray-50 pl-8 focus:bg-white"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500"></span>
        </Button>
        <UserMenu user={currentUser || null} />
      </div>
    </header>
  );
};

export default Navbar;
