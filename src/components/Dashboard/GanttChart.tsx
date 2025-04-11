
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

// Mocked data for now - will be replaced with real data from API
const projectTasks = [
  { name: 'Project Alpha', start: '2025-04-01', end: '2025-08-30', completion: 45, status: 'in-progress' },
  { name: 'System 1A', start: '2025-04-01', end: '2025-06-15', completion: 70, status: 'in-progress' },
  { name: 'System 1B', start: '2025-05-15', end: '2025-07-20', completion: 30, status: 'in-progress' },
  { name: 'Subsystem 1A-1', start: '2025-04-01', end: '2025-05-15', completion: 100, status: 'completed' },
  { name: 'Subsystem 1A-2', start: '2025-04-15', end: '2025-06-15', completion: 60, status: 'in-progress' },
  { name: 'Subsystem 1B-1', start: '2025-05-15', end: '2025-06-30', completion: 40, status: 'in-progress' },
  { name: 'Subsystem 1B-2', start: '2025-06-01', end: '2025-07-20', completion: 10, status: 'pending' },
  { name: 'ITR-1A-101', start: '2025-04-01', end: '2025-04-15', completion: 100, status: 'completed' },
  { name: 'ITR-1A-102', start: '2025-04-15', end: '2025-05-01', completion: 100, status: 'completed' },
  { name: 'ITR-1A-201', start: '2025-05-01', end: '2025-05-15', completion: 80, status: 'in-progress' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return '#14B8A6';
    case 'in-progress':
      return '#0E9DE9';
    case 'pending':
      return '#FFB020';
    case 'delayed':
      return '#D14343';
    default:
      return '#CBD5E1';
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
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

  // Generate date range for X-axis
  const today = new Date();
  const startDate = new Date('2025-04-01');
  const endDate = new Date('2025-08-30');
  
  // Format data for Recharts
  const chartData = projectTasks.map(task => {
    const startTimestamp = new Date(task.start).getTime();
    const endTimestamp = new Date(task.end).getTime();
    
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
            {formatDate(new Date(data.start))} - {formatDate(new Date(data.start + data.duration))}
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
                tickFormatter={(timestamp) => formatDate(new Date(timestamp))}
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
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Last updated: April 11, 2025
      </CardFooter>
    </Card>
  );
};

export default GanttChart;
