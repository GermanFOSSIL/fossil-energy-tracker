
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
              value={3}
              icon={<LayoutDashboard className="h-5 w-5" />}
              change={{ value: 20, isPositive: true }}
              footer="Total of 3 active projects"
            />
            <KPICard
              title="ITRs"
              value={153}
              icon={<ClipboardList className="h-5 w-5" />}
              description="45 pending, 78 in progress, 30 completed"
              footer="12 ITRs pending approval"
            />
            <KPICard
              title="Test Packs"
              value={57}
              icon={<FileCheck className="h-5 w-5" />}
              description="15 pending, 32 in progress, 10 completed"
              change={{ value: 5, isPositive: true }}
            />
            <KPICard
              title="Team Members"
              value={24}
              icon={<Users className="h-5 w-5" />}
              description="4 admins, 8 supervisors, 12 technicians"
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
