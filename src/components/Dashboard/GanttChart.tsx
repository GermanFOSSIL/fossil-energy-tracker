
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/services/projectService';
import { getSystems } from '@/services/systemService';
import { getSubsystems } from '@/services/subsystemService';
import { getItrs } from '@/services/itrService';

// Helper function to format dates consistently
const formatDate = (dateString: string | number) => {
  // Convert timestamp to string if it's a number
  const dateInput = typeof dateString === 'number' 
    ? new Date(dateString).toISOString() 
    : dateString;
    
  return new Date(dateInput).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
    case 'complete':
      return '#14B8A6';
    case 'in-progress':
    case 'inprogress':
      return '#0E9DE9';
    case 'pending':
      return '#FFB020';
    case 'delayed':
      return '#D14343';
    default:
      return '#CBD5E1';
  }
};

interface GanttChartProps {
  title?: string;
  description?: string;
}

const GanttChart: React.FC<GanttChartProps> = ({ 
  title = "Project Timeline", 
  description = "Gantt chart showing project activities and their completion status" 
}) => {
  const [filter, setFilter] = useState('all');
  
  // Fetch project data
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects
  });
  
  // Fetch systems data
  const { data: systems } = useQuery({
    queryKey: ['systems'],
    queryFn: () => getSystems()
  });
  
  // Fetch subsystems data
  const { data: subsystems } = useQuery({
    queryKey: ['subsystems'],
    queryFn: () => getSubsystems()
  });
  
  // Fetch ITRs data
  const { data: itrs } = useQuery({
    queryKey: ['itrs'],
    queryFn: () => getItrs()
  });
  
  // Generate date range for X-axis
  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - 1);
  const endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() + 5);
  
  // Combine all data for the chart
  const allTasks = [
    ...(projects || []).map(p => ({
      name: p.name,
      start: p.start_date ? new Date(p.start_date).getTime() : startDate.getTime(),
      end: p.end_date ? new Date(p.end_date).getTime() : endDate.getTime(),
      completion: p.progress || 0,
      status: p.status || 'in-progress'
    })),
    ...(systems || []).map(s => ({
      name: s.name,
      start: s.start_date ? new Date(s.start_date).getTime() : startDate.getTime(),
      end: s.end_date ? new Date(s.end_date).getTime() : endDate.getTime(),
      completion: s.completion_rate || 0,
      status: 'in-progress'
    })),
    ...(subsystems || []).map(ss => ({
      name: ss.name,
      start: ss.start_date ? new Date(ss.start_date).getTime() : startDate.getTime(),
      end: ss.end_date ? new Date(ss.end_date).getTime() : endDate.getTime(),
      completion: ss.completion_rate || 0,
      status: 'in-progress'
    })),
    ...(itrs || []).map(itr => ({
      name: itr.name,
      start: itr.start_date ? new Date(itr.start_date).getTime() : startDate.getTime(),
      end: itr.end_date ? new Date(itr.end_date).getTime() : endDate.getTime(),
      completion: itr.progress || 0,
      status: itr.status || 'in-progress'
    })),
  ];
  
  // Format data for Recharts
  const chartData = allTasks.map(task => {
    const startTimestamp = task.start;
    const endTimestamp = task.end;
    
    return {
      name: task.name,
      start: startTimestamp,
      duration: endTimestamp - startTimestamp,
      end: endTimestamp,
      completion: task.completion,
      status: task.status
    };
  });

  const filteredData = filter === 'all' 
    ? chartData 
    : chartData.filter(task => task.status === filter);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-md bg-white p-3 shadow-md border">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">
            <span className="font-medium">Period:</span>{' '}
            {formatDate(data.start)} - {formatDate(data.start + data.duration)}
          </p>
          <p className="text-sm">
            <span className="font-medium">Completion:</span> {data.completion}%
          </p>
          <p className="text-sm">
            <span className="font-medium">Status:</span>{' '}
            <span
              className={`capitalize ${
                data.status === 'completed'
                  ? 'text-green-600'
                  : data.status === 'in-progress'
                  ? 'text-blue-600'
                  : data.status === 'pending'
                  ? 'text-amber-600'
                  : 'text-red-600'
              }`}
            >
              {data.status}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="mb-4">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setFilter('all')}>All</TabsTrigger>
            <TabsTrigger value="completed" onClick={() => setFilter('completed')}>Completed</TabsTrigger>
            <TabsTrigger value="in-progress" onClick={() => setFilter('in-progress')}>In Progress</TabsTrigger>
            <TabsTrigger value="pending" onClick={() => setFilter('pending')}>Pending</TabsTrigger>
            <TabsTrigger value="delayed" onClick={() => setFilter('delayed')}>Delayed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="h-[400px] w-full">
          {filteredData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              No data available for the selected filter
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={filteredData}
                margin={{ top: 10, right: 30, left: 100, bottom: 20 }}
                barSize={20}
              >
                <XAxis
                  type="number"
                  domain={[startDate.getTime(), endDate.getTime()]}
                  tickFormatter={(timestamp) => formatDate(timestamp)}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="duration" background={{ fill: '#eee' }}>
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Last updated: {new Date().toLocaleDateString()}
      </CardFooter>
    </Card>
  );
};

export default GanttChart;
