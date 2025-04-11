
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getProjects } from '@/services/projectService';
import { useQuery } from '@tanstack/react-query';

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

interface ProjectOverviewProps {
  title?: string;
  description?: string;
}

const ProjectOverview = ({ 
  title = "Project Overview", 
  description = "Current status and progress of active projects" 
}: ProjectOverviewProps) => {
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

  // Format projects for display
  const formattedProjects = projects?.map(project => ({
    name: project.name,
    progress: project.progress || 0,
    status: mapStatus(project.status),
    dueDate: project.end_date ? new Date(project.end_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : undefined
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading projects...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">Error loading projects</div>
        ) : formattedProjects.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No projects found</div>
        ) : (
          formattedProjects.map((project) => (
            <ProjectItem
              key={project.name}
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
