
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
import Navbar from '@/components/Layout/Navbar';
import Sidebar from '@/components/Layout/Sidebar';

import { getSubsystems } from '@/services/subsystemService';
import { getSystems } from '@/services/systemService';
import { getItrs } from '@/services/itrService';
import { getTestPack, updateTestPack, deleteTestPack } from '@/services/testPackService';
import { getCurrentUser } from '@/services/authService';

const EditTestPack = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const form = useForm({
    defaultValues: {
      nombre_paquete: '',
      itr_asociado: '',
      sistema: '',
      subsistema: '',
      estado: '',
    },
  });

  const { data: testPack, isLoading: testPackLoading } = useQuery({
    queryKey: ['testPack', id],
    queryFn: () => getTestPack(id!),
    enabled: !!id,
  });

  const { data: systems } = useQuery({
    queryKey: ['systems'],
    queryFn: () => getSystems(),
  });

  const { data: subsystems } = useQuery({
    queryKey: ['subsystems'],
    queryFn: () => getSubsystems(),
  });

  const { data: itrs } = useQuery({
    queryKey: ['itrs'],
    queryFn: () => getItrs(),
  });

  useEffect(() => {
    if (testPack) {
      form.reset({
        nombre_paquete: testPack.nombre_paquete,
        itr_asociado: testPack.itr_asociado,
        sistema: testPack.sistema,
        subsistema: testPack.subsistema,
        estado: testPack.estado,
      });
    }
  }, [testPack, form]);

  const updateTestPackMutation = useMutation({
    mutationFn: (data: { nombre_paquete: string; itr_asociado: string; sistema: string; subsistema: string; estado: string }) => {
      return updateTestPack(id!, data);
    },
    onSuccess: () => {
      toast.success(t('testPacks.updateSuccess'));
      navigate('/testpacks');
    },
    onError: (error) => {
      console.error('Error updating Test Pack:', error);
      toast.error(t('testPacks.updateError'));
    },
  });

  const deleteTestPackMutation = useMutation({
    mutationFn: () => deleteTestPack(id!),
    onSuccess: () => {
      toast.success(t('testPacks.deleteSuccess'));
      navigate('/testpacks');
    },
    onError: (error) => {
      console.error('Error deleting Test Pack:', error);
      toast.error(t('testPacks.deleteError'));
    },
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const onSubmit = (data: { nombre_paquete: string; itr_asociado: string; sistema: string; subsistema: string; estado: string }) => {
    updateTestPackMutation.mutate(data);
  };

  const handleDelete = () => {
    if (window.confirm(t('testPacks.confirmDelete'))) {
      deleteTestPackMutation.mutate();
    }
  };

  // When the user selects a system, filter subsystems
  const selectedSystem = form.watch('sistema');
  const filteredSubsystems = subsystems?.filter(
    (subsystem) => {
      const system = systems?.find(s => s.id === subsystem.system_id);
      return system?.name === selectedSystem;
    }
  );

  if (testPackLoading) {
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
            <h1 className="text-2xl font-bold text-fossil-900">{t('testPacks.editTestPack')}</h1>
            <Button variant="destructive" onClick={handleDelete}>
              {t('common.delete')}
            </Button>
          </div>

          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>{t('testPacks.editDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="nombre_paquete"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('testPacks.name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('testPacks.enterName')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sistema"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('testPacks.system')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('testPacks.selectSystem')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {systems?.map((system) => (
                              <SelectItem key={system.id} value={system.name}>
                                {system.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subsistema"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('testPacks.subsystem')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={!selectedSystem}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('testPacks.selectSubsystem')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredSubsystems?.map((subsystem) => (
                              <SelectItem key={subsystem.id} value={subsystem.name}>
                                {subsystem.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="itr_asociado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('testPacks.itr')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('testPacks.selectItr')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {itrs?.map((itr) => (
                              <SelectItem key={itr.id} value={itr.name}>
                                {itr.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('testPacks.status')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('testPacks.selectStatus')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pendiente">{t('testPacks.statuses.pendiente')}</SelectItem>
                            <SelectItem value="en_progreso">{t('testPacks.statuses.en_progreso')}</SelectItem>
                            <SelectItem value="listo">{t('testPacks.statuses.listo')}</SelectItem>
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
                      onClick={() => navigate('/testpacks')}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button 
                      type="submit"
                      disabled={updateTestPackMutation.isPending}
                    >
                      {updateTestPackMutation.isPending ? t('common.saving') : t('common.save')}
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

export default EditTestPack;
