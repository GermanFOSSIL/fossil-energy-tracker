
import { useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import Systems from '@/pages/Systems';
import Subsystems from '@/pages/Subsystems';
import Itrs from '@/pages/Itrs';
import TestPacks from '@/pages/TestPacks';
import Users from '@/pages/Users';
import Profile from '@/pages/Profile';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import CreateProject from '@/pages/CreateProject';
import EditProject from '@/pages/EditProject';
import CreateSystem from '@/pages/CreateSystem';
import EditSystem from '@/pages/EditSystem';
import CreateSubsystem from '@/pages/CreateSubsystem';
import EditSubsystem from '@/pages/EditSubsystem';
import CreateItr from '@/pages/CreateItr';
import EditItr from '@/pages/EditItr';
import CreateTestPack from '@/pages/CreateTestPack';
import EditTestPack from '@/pages/EditTestPack';

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 60 seconds
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <Suspense fallback={<div>Loading...</div>}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/create" element={<CreateProject />} />
              <Route path="/projects/edit/:id" element={<EditProject />} />
              <Route path="/systems" element={<Systems />} />
              <Route path="/systems/create" element={<CreateSystem />} />
              <Route path="/systems/edit/:id" element={<EditSystem />} />
              <Route path="/subsystems" element={<Subsystems />} />
              <Route path="/subsystems/create" element={<CreateSubsystem />} />
              <Route path="/subsystems/edit/:id" element={<EditSubsystem />} />
              <Route path="/itrs" element={<Itrs />} />
              <Route path="/itrs/create" element={<CreateItr />} />
              <Route path="/itrs/edit/:id" element={<EditItr />} />
              <Route path="/testpacks" element={<TestPacks />} />
              <Route path="/testpacks/create" element={<CreateTestPack />} />
              <Route path="/testpacks/edit/:id" element={<EditTestPack />} />
              <Route path="/users" element={<Users />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </Suspense>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
