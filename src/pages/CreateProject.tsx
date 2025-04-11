
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Layout/Navbar';
import Sidebar from '@/components/Layout/Sidebar';
import { createProject } from '@/services/projectService';

const CreateProject = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [status, setStatus] = useState('inprogress');
  const [progress, setProgress] = useState(0);
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: (projectData: any) => createProject(projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(t('projects.createSuccess'));
      navigate('/projects');
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast.error(t('projects.createError'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData = {
      name,
      status,
      progress: Number(progress),
      location,
      start_date: startDate ? new Date(startDate).toISOString() : undefined,
      end_date: endDate ? new Date(endDate).toISOString() : undefined,
    };

    createMutation.mutate(projectData);
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
            <h1 className="text-2xl font-bold text-fossil-900">{t('projects.createProject')}</h1>
            <Button variant="outline" onClick={() => navigate('/projects')}>
              {t('common.cancel')}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('projects.newProject')}</CardTitle>
              <CardDescription>{t('projects.createDescription')}</CardDescription>
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

export default CreateProject;
