
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Layout/Navbar';
import Sidebar from '@/components/Layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getCurrentUser } from '@/services/authService';
import { Profile } from '@/types/profile';

const UserProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50">
      <Navbar toggleSidebar={toggleSidebar} currentUser={currentUser} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        <main 
          className={`flex-1 overflow-y-auto p-6 transition-all ${
            sidebarOpen ? 'md:ml-64' : 'md:ml-20'
          }`}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-fossil-900">{t('auth.profile')}</h1>
          </div>

          {!currentUser ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-fossil-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>{t('auth.profilePicture')}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={currentUser.avatar_url || ''} />
                    <AvatarFallback className="bg-fossil-100 text-fossil-700 text-xl">
                      {getInitials(currentUser.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" className="mt-4">
                    {t('auth.changePhoto')}
                  </Button>
                </CardContent>
              </Card>

              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>{t('auth.personalInfo')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                      <Input id="fullName" defaultValue={currentUser.full_name || ''} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('auth.email')}</Label>
                      <Input id="email" type="email" defaultValue={currentUser.email || ''} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">{t('auth.role')}</Label>
                      <Input id="role" defaultValue={currentUser.role || ''} readOnly />
                    </div>
                    <Button type="submit">{t('common.save')}</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
