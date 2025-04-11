
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface AlertProps {
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  entity?: string;
}

const AlertItem = ({ message, level, timestamp, entity }: AlertProps) => {
  const getIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelClass = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="mb-3 flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
      <div className="mt-0.5 rounded-full bg-gray-100 p-1">
        {getIcon(level)}
      </div>
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium">{message}</p>
          <div className="mt-1 sm:mt-0">
            <Badge className={getLevelClass(level)} variant="outline">
              {level}
            </Badge>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <span>{timestamp}</span>
          {entity && (
            <>
              <span>•</span>
              <span>{entity}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Mock data - will be replaced with real API data
const alerts = [
  {
    message: 'Test Pack T-001 is overdue',
    level: 'error' as const,
    timestamp: '10 minutes ago',
    entity: 'ITR-1A-201',
  },
  {
    message: 'ITR I-123 approaching deadline',
    level: 'warning' as const,
    timestamp: '1 hour ago',
    entity: 'System 1A',
  },
  {
    message: 'New system added to Project Alpha',
    level: 'info' as const,
    timestamp: '3 hours ago',
    entity: 'Project Alpha',
  },
  {
    message: 'Subsystem 1A-1 completed successfully',
    level: 'success' as const,
    timestamp: '1 day ago',
    entity: 'System 1A',
  },
];

interface AlertsPanelProps {
  title?: string;
  description?: string;
}

const AlertsPanel = ({ 
  title = "Alerts & Notifications", 
  description = "Recent alerts and notifications from your projects" 
}: AlertsPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.map((alert, index) => (
          <AlertItem
            key={index}
            message={alert.message}
            level={alert.level}
            timestamp={alert.timestamp}
            entity={alert.entity}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;
