import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { FAMILY_ROLE_LABELS, FamilyRole } from '@/types/family';
import { UserPlus, Mail, User, Shield } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['parent', 'child', 'spouse', 'sibling', 'guardian', 'caregiver', 'other'] as const),
  customRole: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddFamilyMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddFamilyMemberDialog: React.FC<AddFamilyMemberDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { addFamilyMember, isAddingMember } = useFamilyMembers();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'parent',
      customRole: '',
    },
  });

  const watchRole = form.watch('role');

  const onSubmit = (data: FormData) => {
    addFamilyMember({
      name: data.name,
      email: data.email,
      role: data.role,
      customRole: data.role === 'other' ? data.customRole : undefined,
    });
    
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add Family Member
          </DialogTitle>
          <DialogDescription>
            Invite a family member to access your health information. They will receive an email 
            invitation to create their own secure account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter their full name" 
                      {...field} 
                      className="bg-card"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="Enter their email address" 
                      {...field}
                      className="bg-card"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Family Relationship
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-card">
                        <SelectValue placeholder="Select their relationship to you" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(FAMILY_ROLE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchRole === 'other' && (
              <FormField
                control={form.control}
                name="customRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify Relationship</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Family Friend, Neighbor" 
                        {...field}
                        className="bg-card"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="bg-accent/50 p-4 rounded-lg border">
              <h4 className="font-medium text-sm mb-2 text-accent-foreground">What happens next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• An invitation email will be sent to this address</li>
                <li>• They must create their own secure password</li>
                <li>• Access permissions are based on their relationship role</li>
                <li>• You can revoke access at any time</li>
              </ul>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isAddingMember}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isAddingMember}
                className="bg-gradient-primary"
              >
                {isAddingMember ? 'Sending Invitation...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};