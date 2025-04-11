
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import Navbar from '@/components/Layout/Navbar';
import Sidebar from '@/components/Layout/Sidebar';

import { getSubsystems } from '@/services/subsystemService';
import { getItr, updateItr, deleteItr } from '@/services/itrService';
import { getCurrentUser } from '@/services/authService';

const EditItr = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const form = useForm({
    defaultValues: {
      name: '',
      quantity: 1,
      status: 'pending',
      progress: 0,
      subsystem_id: '',
    },
  });

  const { data: itr, isLoading: itrLoading } = useQuery({
    queryKey: ['itr', id],
    queryFn: () => getItr(id!),
    enabled: !!id,
  });

  const { data: subsystems, isLoading: subsystemsLoading } = useQuery({
    queryKey: ['subsystems'],
    queryFn: () => getSubsystems(),
  });

  useEffect(() => {
    if (itr) {
      form.reset({
        name: itr.name,
        quantity: itr.quantity,
        status: itr.status,
        progress: itr.progress || 0,
        subsystem_id: itr.subsystem_id,
      });
    }
  }, [itr, form]);

  const updateItrMutation = useMutation({
    mutationFn: (data: { name: string; quantity: number; status: string; progress: number; subsystem_id: string }) => {
      return updateItr(id!, data);
    },
    onSuccess: () => {
      toast.success(t('itrs.updateSuccess'));
      navigate('/itrs');
    },
    onError: (error) => {
      console.error('Error updating ITR:', error);
      toast.error(t('itrs.updateError'));
    },
  });

  const deleteItrMutation = useMutation({
    mutationFn: () => deleteItr(id!),
    onSuccess: () => {
      toast.success(t('itrs.deleteSuccess'));
      navigate('/itrs');
    },
    onError: (error) => {
      console.error('Error deleting ITR:', error);
      toast.error(t('itrs.deleteError'));
    },
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const onSubmit = (data: { name: string; quantity: number; status: string; progress: number; subsystem_id: string }) => {
    updateItrMutation.mutate(data);
  };

  const handleDelete = () => {
    if (window.confirm(t('itrs.confirmDelete'))) {
      deleteItrMutation.mutate();
    }
  };

  if (itrLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-fossil-500 border-t-transparent"></div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-fossil-900">{t('itrs.editItr')}</h1>
            <Button variant="destructive" onClick={handleDelete}>
              {t('common.delete')}
            </Button>
          </div>

          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>{t('itrs.editDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('itrs.name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('itrs.enterName')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('itrs.quantity')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            placeholder={t('itrs.enterQuantity')} 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('itrs.status')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('itrs.selectStatus')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">{t('itrs.statuses.pending')}</SelectItem>
                            <SelectItem value="inprogress">{t('itrs.statuses.inprogress')}</SelectItem>
                            <SelectItem value="complete">{t('itrs.statuses.complete')}</SelectItem>
                            <SelectItem value="delayed">{t('itrs.statuses.delayed')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="progress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('itrs.progress')}: {field.value}%</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subsystem_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('itrs.subsystem')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('itrs.selectSubsystem')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subsystems?.map((subsystem) => (
                              <SelectItem key={subsystem.id} value={subsystem.id}>
                                {subsystem.name}
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
                      onClick={() => navigate('/itrs')}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button 
                      type="submit"
                      disabled={updateItrMutation.isPending}
                    >
                      {updateItrMutation.isPending ? t('common.saving') : t('common.save')}
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

export default EditItr;
