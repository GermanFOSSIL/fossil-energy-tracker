
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Layout/Navbar';
import Sidebar from '@/components/Layout/Sidebar';
import { getProjects } from '@/services/projectService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/services/authService';

const Projects = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'inprogress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'delayed': 'bg-red-100 text-red-800',
    };
    
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const handleCreateProject = () => {
    navigate('/projects/create');
  };

  const handleEditProject = (id: string) => {
    navigate(`/projects/edit/${id}`);
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
            <h1 className="text-2xl font-bold text-fossil-900">{t('projects.title')}</h1>
            <Button onClick={handleCreateProject}>
              {t('projects.newProject')}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-fossil-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects?.map((project) => (
                <Card key={project.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <span>{project.name}</span>
                      <Badge className={getStatusBadge(project.status)}>
                        {t(`projects.statuses.${project.status}`)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project.location && (
                      <p className="text-sm text-muted-foreground mb-2">{project.location}</p>
                    )}
                    {project.progress !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{t('projects.progress')}</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleEditProject(project.id)}
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

export default Projects;
