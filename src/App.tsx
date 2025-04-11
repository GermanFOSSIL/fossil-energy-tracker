
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import "./i18n"; // Import i18n configuration

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Systems from "./pages/Systems";
import Subsystems from "./pages/Subsystems";
import Itrs from "./pages/Itrs";
import TestPacks from "./pages/TestPacks";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-fossil-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Index />} />
            <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <Login />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/projects" element={session ? <Projects /> : <Navigate to="/login" />} />
            <Route path="/systems" element={session ? <Systems /> : <Navigate to="/login" />} />
            <Route path="/subsystems" element={session ? <Subsystems /> : <Navigate to="/login" />} />
            <Route path="/itrs" element={session ? <Itrs /> : <Navigate to="/login" />} />
            <Route path="/test-packs" element={session ? <TestPacks /> : <Navigate to="/login" />} />
            <Route path="/users" element={session ? <Users /> : <Navigate to="/login" />} />
            <Route path="/reports" element={session ? <Reports /> : <Navigate to="/login" />} />
            <Route path="/settings" element={session ? <Settings /> : <Navigate to="/login" />} />
            <Route path="/profile" element={session ? <Profile /> : <Navigate to="/login" />} />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
