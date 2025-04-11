
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/Layout/Navbar';
import Sidebar from '@/components/Layout/Sidebar';

import { getSystems } from '@/services/systemService';
import { createSubsystem } from '@/services/subsystemService';
import { getCurrentUser } from '@/services/authService';

const CreateSubsystem = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const form = useForm({
    defaultValues: {
      name: '',
      system_id: '',
    },
  });

  const { data: systems, isLoading: systemsLoading } = useQuery({
    queryKey: ['systems'],
    queryFn: () => getSystems(),
  });

  const createSubsystemMutation = useMutation({
    mutationFn: (data: { name: string; system_id: string }) => {
      return createSubsystem({
        name: data.name,
        system_id: data.system_id,
      });
    },
    onSuccess: () => {
      toast.success(t('subsystems.createSuccess'));
      navigate('/subsystems');
    },
    onError: (error) => {
      console.error('Error creating subsystem:', error);
      toast.error(t('subsystems.createError'));
    },
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const onSubmit = (data: { name: string; system_id: string }) => {
    createSubsystemMutation.mutate(data);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50">
      <Navbar toggleSidebar={toggleSidebar} currentUser={currentUser} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        <main 
          className={`flex-1 overflow-y-auto p-6 transition-all ${
            sidebarOpen ? 'md:ml-64' : 'md:ml-20'
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-fossil-900">{t('subsystems.createSubsystem')}</h1>
          </div>

          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>{t('subsystems.createNew')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('subsystems.name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('subsystems.enterName')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="system_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('subsystems.system')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('subsystems.selectSystem')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {systems?.map((system) => (
                              <SelectItem key={system.id} value={system.id}>
                                {system.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => navigate('/subsystems')}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createSubsystemMutation.isPending}
                    >
                      {createSubsystemMutation.isPending ? t('common.saving') : t('common.save')}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default CreateSubsystem;
