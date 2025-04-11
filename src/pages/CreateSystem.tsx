
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Layout/Navbar';
import Sidebar from '@/components/Layout/Sidebar';
import { createSystem } from '@/services/systemService';
import { getProjects } from '@/services/projectService';

const CreateSystem = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [completionRate, setCompletionRate] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch projects for dropdown
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  // Create system mutation
  const createMutation = useMutation({
    mutationFn: (systemData: any) => createSystem(systemData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systems'] });
      toast.success(t('systems.createSuccess'));
      navigate('/systems');
    },
    onError: (error) => {
      console.error('Error creating system:', error);
      toast.error(t('systems.createError'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId) {
      toast.error(t('systems.selectProject'));
      return;
    }
    
    const systemData = {
      name,
      project_id: projectId,
      completion_rate: Number(completionRate),
      start_date: startDate ? new Date(startDate).toISOString() : undefined,
      end_date: endDate ? new Date(endDate).toISOString() : undefined,
    };

    createMutation.mutate(systemData);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50">
      <Navbar toggleSidebar={toggleSidebar} currentUser={currentUser} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`flex-1 overflow-y-auto p-6 transition-all ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-fossil-900">{t('systems.createSystem')}</h1>
            <Button variant="outline" onClick={() => navigate('/systems')}>
              {t('common.cancel')}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('systems.newSystem')}</CardTitle>
              <CardDescription>{t('systems.createDescription')}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('systems.name')}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectId">{t('systems.project')}</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('systems.selectProject')} />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completionRate">{t('systems.completionRate')}</Label>
                  <Input
                    id="completionRate"
                    type="number"
                    min="0"
                    max="100"
                    value={completionRate}
                    onChange={(e) => setCompletionRate(Number(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">{t('systems.startDate')}</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">{t('systems.endDate')}</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? t('common.creating') : t('common.create')}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default CreateSystem;
