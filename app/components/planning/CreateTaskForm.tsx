'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';

// Schéma de validation du formulaire
const formSchema = z.object({
  title: z.string().min(1, { message: "Le titre est requis." }),
  description: z.string().optional(),
  startTime: z.date({ required_error: "La date de début est requise." }),
  endTime: z.date({ required_error: "La date de fin est requise." }),
  resourceId: z.string().optional(), // Conservé si besoin, mais non modifiable dans ce form simple
  // Valeurs par défaut pour type et status, car non modifiables dans ce formulaire simple
  type: z.string().default('AUTRE'), 
  status: z.string().default('PLANIFIE'),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateTaskFormProps {
  initialData: {
    startTime: Date;
    endTime: Date;
    resourceId?: string;
  };
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      startTime: initialData.startTime,
      endTime: initialData.endTime,
      resourceId: initialData.resourceId,
      type: 'AUTRE', // Valeur par défaut
      status: 'PLANIFIE', // Valeur par défaut
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Titre *</Label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => <Input id="title" {...field} />}
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => <Textarea id="description" {...field} />}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Début *</Label>
          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, 'PPP HH:mm', { locale: fr }) : <span>Choisir date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={fr} />
                  {/* Basic time picker - can be improved */}
                  <div className="p-2 border-t">
                     <Input type="time" defaultValue={format(field.value || new Date(), 'HH:mm')} 
                        onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            const newDate = new Date(field.value);
                            newDate.setHours(hours, minutes);
                            field.onChange(newDate);
                        }}
                     />
                  </div>
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime.message}</p>}
        </div>
        <div>
          <Label htmlFor="endTime">Fin *</Label>
           <Controller
            name="endTime"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, 'PPP HH:mm', { locale: fr }) : <span>Choisir date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={fr} />
                   <div className="p-2 border-t">
                     <Input type="time" defaultValue={format(field.value || new Date(), 'HH:mm')}
                        onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            const newDate = new Date(field.value);
                            newDate.setHours(hours, minutes);
                            field.onChange(newDate);
                        }}
                     />
                  </div>
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime.message}</p>}
        </div>
      </div>
      
      {/* resourceId is part of the form data but not shown/editable in this simple form */}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit">Créer Tâche</Button>
      </div>
    </form>
  );
};

export default CreateTaskForm;
