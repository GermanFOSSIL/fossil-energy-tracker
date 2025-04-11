
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Layout/Navbar';
import Sidebar from '@/components/Layout/Sidebar';
import { getSystem, updateSystem, deleteSystem } from '@/services/systemService';
import { getProjects } from '@/services/projectService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const EditSystem = () => {
  const { id } = useParams<{ id: string }>();
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

  // Query system data
  const { data: system, isLoading, error } = useQuery({
    queryKey: ['system', id],
    queryFn: () => id ? getSystem(id) : null,
    enabled: !!id,
  });

  // Fetch projects for dropdown
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  // Update system mutation
  const updateMutation = useMutation({
    mutationFn: (updatedSystem: any) => updateSystem(id as string, updatedSystem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systems'] });
      queryClient.invalidateQueries({ queryKey: ['system', id] });
      toast.success(t('systems.updateSuccess'));
      navigate('/systems');
    },
    onError: (error) => {
      console.error('Error updating system:', error);
      toast.error(t('systems.updateError'));
    },
  });

  // Delete system mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteSystem(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systems'] });
      toast.success(t('systems.deleteSuccess'));
      navigate('/systems');
    },
    onError: (error) => {
      console.error('Error deleting system:', error);
      toast.error(t('systems.deleteError'));
    },
  });

  // Initialize form with system data
  useEffect(() => {
    if (system) {
      setName(system.name || '');
      setProjectId(system.project_id || '');
      setCompletionRate(system.completion_rate || 0);
      setStartDate(system.start_date ? new Date(system.start_date).toISOString().split('T')[0] : '');
      setEndDate(system.end_date ? new Date(system.end_date).toISOString().split('T')[0] : '');
    }
  }, [system]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId) {
      toast.error(t('systems.selectProject'));
      return;
    }
    
    const updatedSystem = {
      name,
      project_id: projectId,
      completion_rate: Number(completionRate),
      start_date: startDate ? new Date(startDate).toISOString() : undefined,
      end_date: endDate ? new Date(endDate).toISOString() : undefined,
    };

    updateMutation.mutate(updatedSystem);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col bg-gray-50">
        <Navbar toggleSidebar={toggleSidebar} currentUser={currentUser} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={sidebarOpen} />
          <main className={`flex-1 overflow-y-auto p-6 transition-all ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-fossil-500 border-t-transparent"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !system) {
    return (
      <div className="flex h-screen w-full flex-col bg-gray-50">
        <Navbar toggleSidebar={toggleSidebar} currentUser={currentUser} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={sidebarOpen} />
          <main className={`flex-1 overflow-y-auto p-6 transition-all ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
            <Card>
              <CardHeader>
                <CardTitle className="text-red-500">{t('common.error')}</CardTitle>
                <CardDescription>{t('systems.loadError')}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => navigate('/systems')}>{t('common.goBack')}</Button>
              </CardFooter>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50">
      <Navbar toggleSidebar={toggleSidebar} currentUser={currentUser} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`flex-1 overflow-y-auto p-6 transition-all ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-fossil-900">{t('systems.editSystem')}</h1>
            <Button variant="outline" onClick={() => navigate('/systems')}>
              {t('common.cancel')}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('systems.editDetails')}</CardTitle>
              <CardDescription>{t('systems.editDescription')}</CardDescription>
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
              <CardFooter className="flex justify-between">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">{t('common.delete')}</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('systems.confirmDelete')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('systems.deleteWarning')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        {t('common.delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default EditSystem;
