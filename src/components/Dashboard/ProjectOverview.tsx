
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ProjectItemProps {
  name: string;
  progress: number;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  dueDate?: string;
}

const ProjectItem = ({ name, progress, status, dueDate }: ProjectItemProps) => {
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

  return (
    <div className="mb-4 border-b pb-4 last:border-0 last:pb-0">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">{name}</span>
            <Badge className={getStatusColor(status)} variant="outline">
              {status.replace('-', ' ')}
            </Badge>
          </div>
          {dueDate && <span className="text-xs text-gray-500">Due: {dueDate}</span>}
        </div>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
      <div className="mt-2">
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
};

// Mock data - will be replaced with real API data
const projects = [
  {
    name: 'Project Alpha',
    progress: 45,
    status: 'in-progress' as const,
    dueDate: 'Aug 30, 2025',
  },
  {
    name: 'System 1A',
    progress: 70,
    status: 'in-progress' as const,
    dueDate: 'Jun 15, 2025',
  },
  {
    name: 'System 1B',
    progress: 30,
    status: 'in-progress' as const,
    dueDate: 'Jul 20, 2025',
  },
  {
    name: 'Subsystem 1A-1',
    progress: 100,
    status: 'completed' as const,
    dueDate: 'May 15, 2025',
  },
  {
    name: 'Subsystem 1A-2',
    progress: 60,
    status: 'in-progress' as const,
    dueDate: 'Jun 15, 2025',
  },
];

interface ProjectOverviewProps {
  title?: string;
  description?: string;
}

const ProjectOverview = ({ 
  title = "Project Overview", 
  description = "Current status and progress of active projects" 
}: ProjectOverviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {projects.map((project) => (
          <ProjectItem
            key={project.name}
            name={project.name}
            progress={project.progress}
            status={project.status}
            dueDate={project.dueDate}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default ProjectOverview;
