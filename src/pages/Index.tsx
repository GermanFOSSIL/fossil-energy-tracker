
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    navigate('/login');
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-fossil-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-fossil-600">FOSSIL Energy Tracker</h1>
        <p className="mt-2 text-fossil-500">{t('common.loading')}...</p>
      </div>
    </div>
  );
};

export default Index;
