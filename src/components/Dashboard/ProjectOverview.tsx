
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getProjects } from '@/services/projectService';
import { useQuery } from '@tanstack/react-query';
import { translateProjectStatus } from '@/services/projectService';

interface ProjectItemProps {
  name: string;
  progress: number;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  dueDate?: string;
}

const ProjectItem = ({ name, progress, status, dueDate }: ProjectItemProps) => {
  const { i18n } = useTranslation();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Translate status based on the current language
  const translatedStatus = translateProjectStatus(status, i18n);

  return (
    <div className="mb-4 border-b pb-4 last:border-0 last:pb-0">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">{name}</span>
            <Badge className={getStatusColor(status)} variant="outline">
              {translatedStatus}
            </Badge>
          </div>
          {dueDate && <span className="text-xs text-gray-500">{i18n.t('projects.endDate')}: {dueDate}</span>}
        </div>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
      <div className="mt-2">
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
};

interface ProjectOverviewProps {
  title?: string;
  description?: string;
}

const ProjectOverview = ({ 
  title, 
  description
}: ProjectOverviewProps) => {
  const { t, i18n } = useTranslation();
  
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects
  });

  // Helper function to map Supabase status to our status types
  const mapStatus = (status: string): 'pending' | 'in-progress' | 'completed' | 'delayed' => {
    switch (status?.toLowerCase()) {
      case 'complete':
      case 'completed':
        return 'completed';
      case 'inprogress':
      case 'in-progress':
        return 'in-progress';
      case 'pending':
        return 'pending';
      case 'delayed':
        return 'delayed';
      default:
        return 'in-progress';
    }
  };

  // Format date based on current language
  const formatDate = (dateString?: string) => {
    if (!dateString) return undefined;
    
    const locale = i18n.language === 'es' ? 'es-ES' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format projects for display
  const formattedProjects = projects?.map(project => ({
    name: project.name,
    progress: project.progress || 0,
    status: mapStatus(project.status),
    dueDate: formatDate(project.end_date)
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || t('dashboard.projectOverview')}</CardTitle>
        <CardDescription>{description || t('dashboard.projectStatus')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">{t('common.loading')}</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{t('errors.generic')}</div>
        ) : formattedProjects.length === 0 ? (
          <div className="py-8 text-center text-gray-500">{t('common.noResults')}</div>
        ) : (
          formattedProjects.map((project, index) => (
            <ProjectItem
              key={index}
              name={project.name}
              progress={project.progress}
              status={project.status}
              dueDate={project.dueDate}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectOverview;
