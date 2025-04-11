
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Layout/Navbar';
import Sidebar from '@/components/Layout/Sidebar';
import { getSystems } from '@/services/systemService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getCurrentUser } from '@/services/authService';

const Systems = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: systems, isLoading } = useQuery({
    queryKey: ['systems'],
    queryFn: () => getSystems(),
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCreateSystem = () => {
    navigate('/systems/create');
  };

  const handleEditSystem = (id: string) => {
    navigate(`/systems/edit/${id}`);
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
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-fossil-900">{t('systems.title')}</h1>
            <Button onClick={handleCreateSystem}>
              {t('systems.newSystem')}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-fossil-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {systems?.map((system) => (
                <Card key={system.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{system.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {system.completion_rate !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{t('systems.completionRate')}</span>
                          <span>{system.completion_rate}%</span>
                        </div>
                        <Progress value={system.completion_rate} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleEditSystem(system.id)}
                    >
                      {t('common.edit')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Systems;
