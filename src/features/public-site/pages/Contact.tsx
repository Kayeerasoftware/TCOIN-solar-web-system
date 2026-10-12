import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { submitLead } from '@/api/endpoints/crm';
import { SuccessBanner } from '@/components/feedback/SuccessBanner';
import { FormField } from '@/components/forms/FormField';
import { Select, TextInput, Textarea } from '@/components/forms/controls';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { applyServerErrors } from '@/lib/forms';
import { requiredText } from '@/lib/validators';

const schema = z
  .object({
    full_name: requiredText('Name'),
    phone: z.string().trim().optional(),
    email: z.string().trim().email('Enter a valid email address').or(z.literal('')).optional(),
    location: z.string().trim().optional(),
    service_interest: z.string().optional(),
    message: z.string().trim().optional(),
  })
  .refine((v) => !!v.phone || !!v.email, {
    path: ['phone'],
    message: 'Give a phone number or an email address',
  });
type Form = z.infer<typeof schema>;

export default function Contact() {
  useDocumentTitle('Contact and quote request');
  const p = useCompanyProfile();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { service_interest: 'design' } });
  const send = useMutation({
    mutationFn: (v: Form) =>
      submitLead({ ...v, phone: v.phone || undefined, email: v.email || undefined, source_code: 'web_form' }),
    onSuccess: () => reset(),
    onError: (e) => applyServerErrors(e, setError),
  });
  return (
    <div className="mx-auto grid max-w-5xl gap-4 p-4 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card title="Request a quote">
          {send.isSuccess && (
            <div className="mb-3">
              <SuccessBanner
                title="Request received"
                message={`Your reference is ${send.data.lead_no}. We will contact you soon.`}
              />
            </div>
          )}
          <form onSubmit={handleSubmit((v) => send.mutate(v))} noValidate aria-label="Request a quote">
            {errors.root && (
              <p role="alert" className="mb-2 text-brand-red">
                {errors.root.message}
              </p>
            )}
            <FormField label="Full name" htmlFor="full_name" error={errors.full_name?.message}>
              <TextInput id="full_name" invalid={!!errors.full_name} {...register('full_name')} />
            </FormField>
            <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
              <TextInput id="phone" type="tel" invalid={!!errors.phone} {...register('phone')} />
            </FormField>
            <FormField label="Email" htmlFor="email" error={errors.email?.message}>
              <TextInput id="email" type="email" invalid={!!errors.email} {...register('email')} />
            </FormField>
            <FormField label="Location" htmlFor="location">
              <TextInput id="location" {...register('location')} />
            </FormField>
            <FormField label="Service" htmlFor="service_interest">
              <Select id="service_interest" {...register('service_interest')}>
                <option value="design">Design</option>
                <option value="installation">Installation</option>
                <option value="maintenance">Maintenance</option>
                <option value="consultancy">Consultancy</option>
                <option value="components">Components</option>
              </Select>
            </FormField>
            <FormField label="Message" htmlFor="message">
              <Textarea id="message" {...register('message')} />
            </FormField>
            <Button type="submit" busy={send.isPending}>
              Send request
            </Button>
          </form>
        </Card>
      </div>
      <Card title="Talk to us">
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-ink-muted">Phone</dt>
            <dd>
              {p.tel}
              <br />
              {p.mobile}
            </dd>
          </div>
          <div>
            <dt className="text-ink-muted">Hotlines</dt>
            <dd>{p.hotlines.join(', ')}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Email</dt>
            <dd>{p.email}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Address</dt>
            <dd>
              {p.address}, {p.po_box}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
