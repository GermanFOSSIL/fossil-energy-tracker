
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { getAlerts, Alert as AlertType } from '@/services/alertService';

interface AlertItemProps {
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  entity?: string;
}

const AlertItem = ({ message, level, timestamp, entity }: AlertItemProps) => {
  const { i18n } = useTranslation();
  
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

  // Format date based on current language
  const formatTimestamp = (timestamp: string) => {
    const locale = i18n.language === 'es' ? 'es-ES' : 'en-US';
    return new Date(timestamp).toLocaleString(locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <span>{formatTimestamp(timestamp)}</span>
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

interface AlertsPanelProps {
  title?: string;
  description?: string;
}

const AlertsPanel = ({ 
  title,
  description
}: AlertsPanelProps) => {
  const { t } = useTranslation();
  
  const { data: alerts, isLoading, error } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => getAlerts(5)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || t('dashboard.alerts')}</CardTitle>
        <CardDescription>{description || t('dashboard.alertsDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center text-gray-500">{t('common.loading')}</div>
        ) : error ? (
          <div className="py-4 text-center text-red-500">{t('errors.generic')}</div>
        ) : alerts && alerts.length > 0 ? (
          alerts.map((alert: AlertType) => (
            <AlertItem
              key={alert.id}
              message={alert.message}
              level={alert.level}
              timestamp={alert.timestamp}
              entity={alert.entity}
            />
          ))
        ) : (
          <div className="py-4 text-center text-gray-500">{t('common.noResults')}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;
