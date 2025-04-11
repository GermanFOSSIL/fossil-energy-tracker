
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
import { getProject, updateProject, deleteProject } from '@/services/projectService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const EditProject = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Query project data
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => id ? getProject(id) : null,
    enabled: !!id,
  });

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: (updatedProject: any) => updateProject(id as string, updatedProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      toast.success(t('projects.updateSuccess'));
      navigate('/projects');
    },
    onError: (error) => {
      console.error('Error updating project:', error);
      toast.error(t('projects.updateError'));
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(t('projects.deleteSuccess'));
      navigate('/projects');
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      toast.error(t('projects.deleteError'));
    },
  });

  // Initialize form with project data
  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setStatus(project.status || 'inprogress');
      setProgress(project.progress || 0);
      setLocation(project.location || '');
      setStartDate(project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '');
      setEndDate(project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '');
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedProject = {
      name,
      status,
      progress: Number(progress),
      location,
      start_date: startDate ? new Date(startDate).toISOString() : undefined,
      end_date: endDate ? new Date(endDate).toISOString() : undefined,
    };

    updateMutation.mutate(updatedProject);
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

  if (error || !project) {
    return (
      <div className="flex h-screen w-full flex-col bg-gray-50">
        <Navbar toggleSidebar={toggleSidebar} currentUser={currentUser} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={sidebarOpen} />
          <main className={`flex-1 overflow-y-auto p-6 transition-all ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
            <Card>
              <CardHeader>
                <CardTitle className="text-red-500">{t('common.error')}</CardTitle>
                <CardDescription>{t('projects.loadError')}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => navigate('/projects')}>{t('common.goBack')}</Button>
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
            <h1 className="text-2xl font-bold text-fossil-900">{t('projects.editProject')}</h1>
            <Button variant="outline" onClick={() => navigate('/projects')}>
              {t('common.cancel')}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('projects.editDetails')}</CardTitle>
              <CardDescription>{t('projects.editDescription')}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('projects.name')}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">{t('projects.status')}</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('projects.selectStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t('projects.statuses.pending')}</SelectItem>
                      <SelectItem value="inprogress">{t('projects.statuses.inProgress')}</SelectItem>
                      <SelectItem value="completed">{t('projects.statuses.completed')}</SelectItem>
                      <SelectItem value="delayed">{t('projects.statuses.delayed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="progress">{t('projects.progress')}</Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">{t('projects.location')}</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">{t('projects.startDate')}</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">{t('projects.endDate')}</Label>
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
                      <AlertDialogTitle>{t('projects.confirmDelete')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('projects.deleteWarning')}
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

export default EditProject;
