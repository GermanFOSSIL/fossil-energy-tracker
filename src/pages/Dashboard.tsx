
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  LayoutDashboard, 
  ClipboardList, 
  FileCheck, 
  Users, 
  Clock,
  AlertTriangle,
  CheckCircle,
  FileBarChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Layout/Navbar';
import Sidebar from '@/components/Layout/Sidebar';
import KPICard from '@/components/Dashboard/KPICard';
import GanttChart from '@/components/Dashboard/GanttChart';
import ProjectOverview from '@/components/Dashboard/ProjectOverview';
import AlertsPanel from '@/components/Dashboard/AlertsPanel';
import { getProjects } from '@/services/projectService';
import { getSystems } from '@/services/systemService';
import { getItrs } from '@/services/itrService';
import { getTestPacks } from '@/services/testPackService';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Fetch data for KPI cards
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects
  });

  const { data: systems, isLoading: systemsLoading } = useQuery({
    queryKey: ['systems'],
    queryFn: () => getSystems()
  });

  const { data: itrs, isLoading: itrsLoading } = useQuery({
    queryKey: ['itrs'],
    queryFn: () => getItrs()
  });

  const { data: testPacks, isLoading: testPacksLoading } = useQuery({
    queryKey: ['testPacks'],
    queryFn: () => getTestPacks()
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Calculate KPI metrics
  const activeProjects = projects?.filter(p => p.status !== 'completed')?.length || 0;
  
  const itrStats = {
    total: itrs?.length || 0,
    pending: itrs?.filter(i => i.status === 'pending')?.length || 0,
    inProgress: itrs?.filter(i => i.status === 'inprogress')?.length || 0,
    completed: itrs?.filter(i => i.status === 'complete')?.length || 0,
  };
  
  const testPackStats = {
    total: testPacks?.length || 0,
    pending: testPacks?.filter(tp => tp.estado === 'pendiente')?.length || 0,
    inProgress: testPacks?.filter(tp => tp.estado !== 'pendiente' && tp.estado !== 'listo')?.length || 0,
    completed: testPacks?.filter(tp => tp.estado === 'listo')?.length || 0,
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        <main 
          className={`flex-1 overflow-y-auto p-6 transition-all ${
            sidebarOpen ? 'md:ml-64' : 'md:ml-20'
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-fossil-900">Dashboard</h1>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => navigate('/reports')}>
                <FileBarChart className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button onClick={() => navigate('/projects/new')}>
                New Project
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Active Projects"
              value={activeProjects}
              icon={<LayoutDashboard className="h-5 w-5" />}
              change={{ value: 0, isPositive: true }}
              footer={`Total of ${activeProjects} active projects`}
            />
            <KPICard
              title="ITRs"
              value={itrStats.total}
              icon={<ClipboardList className="h-5 w-5" />}
              description={`${itrStats.pending} pending, ${itrStats.inProgress} in progress, ${itrStats.completed} completed`}
              footer={`${itrStats.pending} ITRs pending approval`}
            />
            <KPICard
              title="Test Packs"
              value={testPackStats.total}
              icon={<FileCheck className="h-5 w-5" />}
              description={`${testPackStats.pending} pending, ${testPackStats.inProgress} in progress, ${testPackStats.completed} completed`}
              change={{ value: 0, isPositive: true }}
            />
            <KPICard
              title="Systems"
              value={systems?.length || 0}
              icon={<Users className="h-5 w-5" />}
              description={`${systems?.length || 0} systems across ${activeProjects} active projects`}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ProjectOverview />
            </div>
            <div>
              <AlertsPanel />
            </div>
          </div>

          <div className="mt-6">
            <GanttChart />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
