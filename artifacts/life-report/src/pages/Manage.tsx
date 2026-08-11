import { useState } from 'react';
import { 
  useGetProfile, 
  useUpdateProfile,
  useListAccomplishments,
  useCreateAccomplishment,
  useUpdateAccomplishment,
  useDeleteAccomplishment,
  useToggleFeatured,
  getGetProfileQueryKey,
  getListAccomplishmentsQueryKey,
  getGetSummaryQueryKey,
  getGetTimelineQueryKey,
  getGetFeaturedQueryKey
} from '@workspace/api-client-react';
import { Category } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit2, Trash2, Award, MoreVertical, X, Paperclip } from 'lucide-react';
import { CategoryBadge, getCategoryLabel } from '@/components/CategoryBadge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useUpload } from '@workspace/object-storage-web';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  headline: z.string().min(1, 'Headline is required'),
  summary: z.string().min(1, 'Summary is required'),
  affiliation: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  email: z.string().email('Invalid email').nullable().optional().or(z.literal('')),
  website: z.string().url('Invalid URL').nullable().optional().or(z.literal('')),
});

const accomplishmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.enum(['publication', 'treatise', 'software', 'patent', 'music', 'other']),
  year: z.coerce.number().min(1900).max(2100),
  description: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  metric: z.string().nullable().optional(),
  link: z.string().url('Invalid URL').nullable().optional().or(z.literal('')),
  links: z.array(z.object({
    label: z.string().min(1, 'Label required'),
    url: z.string().url('Invalid URL')
  })).default([]),
  filePath: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  featured: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type AccomplishmentFormValues = z.infer<typeof accomplishmentSchema>;

export function Manage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'accomplishments'>('profile');
  const [editingAccomplishmentId, setEditingAccomplishmentId] = useState<number | null>(null);
  const [isAccomplishmentDialogOpen, setIsAccomplishmentDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile, isLoading: isProfileLoading } = useGetProfile();
  const { data: accomplishments, isLoading: isAccomplishmentsLoading } = useListAccomplishments();

  const updateProfile = useUpdateProfile();
  const createAccomplishment = useCreateAccomplishment();
  const updateAccomplishment = useUpdateAccomplishment();
  const deleteAccomplishment = useDeleteAccomplishment();
  const toggleFeatured = useToggleFeatured();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      headline: '',
      summary: '',
      affiliation: '',
      location: '',
      email: '',
      website: '',
    },
    values: profile ? {
      fullName: profile.fullName,
      headline: profile.headline,
      summary: profile.summary,
      affiliation: profile.affiliation || '',
      location: profile.location || '',
      email: profile.email || '',
      website: profile.website || '',
    } : undefined,
  });

  const accForm = useForm<AccomplishmentFormValues>({
    resolver: zodResolver(accomplishmentSchema),
    defaultValues: {
      title: '',
      category: 'other',
      year: new Date().getFullYear(),
      description: '',
      venue: '',
      role: '',
      metric: '',
      link: '',
      links: [],
      filePath: null,
      fileName: null,
      featured: false,
    },
  });

  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
    control: accForm.control,
    name: "links"
  });

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (response) => {
      accForm.setValue('filePath', response.objectPath);
      accForm.setValue('fileName', response.metadata.name);
    },
    onError: () => toast({ title: "Upload failed", variant: "destructive" })
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate(
      { data: {
        ...data,
        email: data.email || null,
        website: data.website || null,
        affiliation: data.affiliation || null,
        location: data.location || null,
      } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
          toast({ title: 'Profile updated successfully' });
        },
        onError: () => {
          toast({ title: 'Failed to update profile', variant: 'destructive' });
        }
      }
    );
  };

  const openNewAccomplishment = () => {
    setEditingAccomplishmentId(null);
    accForm.reset({
      title: '',
      category: 'other',
      year: new Date().getFullYear(),
      description: '',
      venue: '',
      role: '',
      metric: '',
      link: '',
      links: [],
      filePath: null,
      fileName: null,
      featured: false,
    });
    setIsAccomplishmentDialogOpen(true);
  };

  const openEditAccomplishment = (acc: any) => {
    setEditingAccomplishmentId(acc.id);
    accForm.reset({
      title: acc.title,
      category: acc.category,
      year: acc.year,
      description: acc.description || '',
      venue: acc.venue || '',
      role: acc.role || '',
      metric: acc.metric || '',
      link: acc.link || '',
      links: acc.links || [],
      filePath: acc.filePath || null,
      fileName: acc.fileName || null,
      featured: acc.featured,
    });
    setIsAccomplishmentDialogOpen(true);
  };

  const onAccomplishmentSubmit = (data: AccomplishmentFormValues) => {
    const payload = {
      ...data,
      description: data.description || null,
      venue: data.venue || null,
      role: data.role || null,
      metric: data.metric || null,
      link: data.link || null,
      links: data.links || [],
      filePath: data.filePath || null,
      fileName: data.fileName || null,
    };

    if (editingAccomplishmentId) {
      updateAccomplishment.mutate(
        { id: editingAccomplishmentId, data: payload },
        {
          onSuccess: () => {
            invalidateAllData();
            setIsAccomplishmentDialogOpen(false);
            toast({ title: 'Accomplishment updated' });
          },
          onError: () => toast({ title: 'Failed to update', variant: 'destructive' })
        }
      );
    } else {
      createAccomplishment.mutate(
        { data: payload },
        {
          onSuccess: () => {
            invalidateAllData();
            setIsAccomplishmentDialogOpen(false);
            toast({ title: 'Accomplishment added' });
          },
          onError: () => toast({ title: 'Failed to add', variant: 'destructive' })
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this accomplishment?')) {
      deleteAccomplishment.mutate(
        { id },
        {
          onSuccess: () => {
            invalidateAllData();
            toast({ title: 'Accomplishment deleted' });
          },
          onError: () => toast({ title: 'Failed to delete', variant: 'destructive' })
        }
      );
    }
  };

  const handleToggleFeature = (id: number) => {
    toggleFeatured.mutate(
      { id },
      {
        onSuccess: () => {
          invalidateAllData();
        }
      }
    );
  };

  const invalidateAllData = () => {
    queryClient.invalidateQueries({ queryKey: getListAccomplishmentsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetTimelineQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetFeaturedQueryKey() });
  };

  if (isProfileLoading || isAccomplishmentsLoading) {
    return <div className="p-12"><Skeleton className="w-full max-w-4xl h-[600px]" /></div>;
  }

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto min-h-screen">
      <div className="mb-10">
        <h1 className="font-serif text-5xl text-foreground tracking-tight mb-2">Workspace</h1>
        <p className="text-muted-foreground font-mono">Manage the dossier.</p>
      </div>

      <div className="flex gap-4 mb-8 border-b border-border pb-4">
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            "text-lg font-serif px-4 py-2 transition-colors",
            activeTab === 'profile' ? "text-primary border-b-2 border-primary -mb-[18px]" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Profile Identity
        </button>
        <button
          onClick={() => setActiveTab('accomplishments')}
          className={cn(
            "text-lg font-serif px-4 py-2 transition-colors",
            activeTab === 'accomplishments' ? "text-primary border-b-2 border-primary -mb-[18px]" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Accomplishments
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-card border border-border p-8">
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <FormField
                control={profileForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} className="bg-background rounded-none border-border" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline</FormLabel>
                    <FormControl><Input {...field} className="bg-background rounded-none border-border" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl><Textarea {...field} className="bg-background rounded-none border-border min-h-[120px]" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="affiliation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affiliation</FormLabel>
                      <FormControl><Input {...field} value={field.value || ''} className="bg-background rounded-none border-border" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl><Input {...field} value={field.value || ''} className="bg-background rounded-none border-border" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input {...field} value={field.value || ''} className="bg-background rounded-none border-border" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl><Input {...field} value={field.value || ''} className="bg-background rounded-none border-border" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={updateProfile.isPending} className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 w-full mt-4">
                {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </Form>
        </div>
      )}

      {activeTab === 'accomplishments' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-2xl text-foreground">Record Database</h2>
            <Button onClick={openNewAccomplishment} className="rounded-none gap-2">
              <Plus className="w-4 h-4" /> Add Record
            </Button>
          </div>

          <div className="border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-mono uppercase bg-background border-b border-border text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Year</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Title</th>
                    <th className="px-6 py-4 font-medium text-center">Featured</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {accomplishments?.map((acc) => (
                    <tr key={acc.id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4 font-mono">{acc.year}</td>
                      <td className="px-6 py-4"><CategoryBadge category={acc.category} /></td>
                      <td className="px-6 py-4 font-serif text-base">{acc.title}</td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleToggleFeature(acc.id)}
                          className={cn(
                            "p-2 rounded hover:bg-muted transition-colors", 
                            acc.featured ? "text-amber-500" : "text-muted-foreground"
                          )}
                        >
                          <Award className="w-5 h-5 mx-auto" />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-none">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-none shadow-md">
                            <DropdownMenuItem onClick={() => openEditAccomplishment(acc)} className="cursor-pointer">
                              <Edit2 className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(acc.id)} className="cursor-pointer text-destructive focus:text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {(!accomplishments || accomplishments.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-mono">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isAccomplishmentDialogOpen} onOpenChange={setIsAccomplishmentDialogOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-none p-0 overflow-hidden border-border shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-6 bg-card border-b border-border sticky top-0 z-10">
            <DialogTitle className="font-serif text-2xl">
              {editingAccomplishmentId ? 'Edit Record' : 'Add New Record'}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <Form {...accForm}>
              <form onSubmit={accForm.handleSubmit(onAccomplishmentSubmit)} className="space-y-6">
                <FormField
                  control={accForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl><Input {...field} className="rounded-none border-border" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={accForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-none border-border">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-none">
                            {['publication', 'treatise', 'software', 'patent', 'music', 'other'].map(cat => (
                              <SelectItem key={cat} value={cat}>{getCategoryLabel(cat as Category)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accForm.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl><Input type="number" {...field} className="rounded-none border-border font-mono" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={accForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl><Textarea {...field} value={field.value || ''} className="rounded-none border-border" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={accForm.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue/Publisher (Optional)</FormLabel>
                        <FormControl><Input {...field} value={field.value || ''} className="rounded-none border-border" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role (Optional)</FormLabel>
                        <FormControl><Input {...field} value={field.value || ''} className="rounded-none border-border" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={accForm.control}
                  name="metric"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metric/Signal (Optional)</FormLabel>
                      <FormControl><Input {...field} value={field.value || ''} className="rounded-none border-border" placeholder="e.g. 60.2K plays" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3 pt-2 border-t border-border">
                  <FormLabel className="text-base font-serif">Resource Links</FormLabel>
                  {linkFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      <FormField
                        control={accForm.control}
                        name={`links.${index}.label`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl><Input placeholder="Label (e.g. GitHub)" className="rounded-none border-border text-sm" {...field} /></FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={accForm.control}
                        name={`links.${index}.url`}
                        render={({ field }) => (
                          <FormItem className="flex-[2]">
                            <FormControl><Input placeholder="URL (https://...)" className="rounded-none border-border text-sm" {...field} /></FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" className="rounded-none px-3" onClick={() => removeLink(index)}>
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" className="rounded-none text-xs h-8" onClick={() => appendLink({ label: '', url: '' })}>
                    <Plus className="w-3 h-3 mr-1" /> Add Link
                  </Button>
                </div>

                <div className="space-y-3 pt-2 border-t border-border">
                  <FormLabel className="text-base font-serif">File Attachment (PDF, Object)</FormLabel>
                  <div className="border border-border p-3 flex items-center gap-4 bg-muted/30">
                    {accForm.watch('filePath') ? (
                      <div className="flex-1 flex justify-between items-center">
                        <div className="flex items-center gap-2 overflow-hidden">
                           <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                           <span className="font-mono text-sm truncate">{accForm.watch('fileName')}</span>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => {
                          accForm.setValue('filePath', null);
                          accForm.setValue('fileName', null);
                        }} className="text-destructive h-7 px-2">Remove</Button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-between">
                        <Input 
                          type="file" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) await uploadFile(file);
                          }} 
                          disabled={isUploading} 
                          className="text-xs file:bg-primary file:text-primary-foreground file:border-0 file:rounded-none file:px-3 file:py-1 file:mr-3 h-auto p-0 border-0 bg-transparent file:cursor-pointer" 
                        />
                        {isUploading && <span className="font-mono text-xs text-muted-foreground">{progress}%</span>}
                      </div>
                    )}
                  </div>
                </div>

                <FormField
                  control={accForm.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-none border border-border p-4 mt-2 bg-card">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-serif">Feature this record</FormLabel>
                        <div className="text-sm text-muted-foreground">Show prominently on the dossier home page.</div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter className="mt-6 pt-4 border-t border-border sticky bottom-0 bg-background/95 backdrop-blur py-4">
                  <Button type="button" variant="outline" onClick={() => setIsAccomplishmentDialogOpen(false)} className="rounded-none">
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90" disabled={createAccomplishment.isPending || updateAccomplishment.isPending}>
                    {editingAccomplishmentId ? 'Save Changes' : 'Create Record'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
