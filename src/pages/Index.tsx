
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle, Shield, Clock, FileText } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-fossil-800">FOSSIL</span>
            <span className="text-lg font-medium text-fossil-600">Energies</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => window.open('mailto:contact@fossil-energies.com')}
            >
              Contact Us
            </Button>
            <Button onClick={() => navigate('/dashboard')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="bg-gradient-to-b from-fossil-50 to-fossil-100 py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-fossil-900 sm:text-4xl md:text-5xl">
              Precommissioning Management Platform for Oil & Gas
            </h1>
            <p className="max-w-[42rem] text-muted-foreground sm:text-xl">
              Comprehensive solution for planning, tracking, and closing precommissioning activities
              in industrial projects.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" onClick={() => navigate('/dashboard')}>
                View Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/projects')}>
                Browse Projects
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Key Features
            </h2>
            <p className="max-w-[58rem] text-muted-foreground sm:text-xl">
              Optimized for industrial operations with powerful management tools
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="fossil-card flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-fossil-100 p-3 text-fossil-700">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Hierarchical Management</h3>
              <p className="text-muted-foreground">
                Complete organization of projects, systems, subsystems, ITRs, and test packs in a hierarchical structure.
              </p>
            </div>
            <div className="fossil-card flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-fossil-100 p-3 text-fossil-700">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Interactive Gantt</h3>
              <p className="text-muted-foreground">
                Powerful project visualization with dynamic Gantt charts for better planning and tracking.
              </p>
            </div>
            <div className="fossil-card flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-fossil-100 p-3 text-fossil-700">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Role-Based Access</h3>
              <p className="text-muted-foreground">
                Secure operations with detailed permissions for administrators, supervisors, technicians, and viewers.
              </p>
            </div>
            <div className="fossil-card flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-fossil-100 p-3 text-fossil-700">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Digital Signatures</h3>
              <p className="text-muted-foreground">
                Electronic sign-off process for ITRs and test packs with complete audit trail.
              </p>
            </div>
            <div className="fossil-card flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-fossil-100 p-3 text-fossil-700">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Automated Reporting</h3>
              <p className="text-muted-foreground">
                Daily reports sent by email with project status, upcoming deadlines, and pending approvals.
              </p>
            </div>
            <div className="fossil-card flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-fossil-100 p-3 text-fossil-700">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Proactive Alerts</h3>
              <p className="text-muted-foreground">
                Automatic notifications for delays, pending approvals, and upcoming deadlines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-fossil-900 py-20 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to streamline your precommissioning process?
            </h2>
            <p className="max-w-[42rem] text-fossil-200 sm:text-xl">
              Get started with FOSSIL Energies today and experience a comprehensive solution for managing all your industrial projects.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-fossil-900 hover:bg-fossil-50"
              onClick={() => navigate('/dashboard')}
            >
              Open Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="container flex flex-col items-center gap-4 px-4 md:flex-row md:justify-between md:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-fossil-800">FOSSIL</span>
            <span className="text-lg font-medium text-fossil-600">Energies</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 FOSSIL Energies. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
