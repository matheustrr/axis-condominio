import { z } from 'zod';

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
export const bootstrapSchema = z.object({
  condominium: z.object({ name: z.string().min(2), document: z.string().optional(), address: z.string().optional(), email: z.string().email().optional(), phone: z.string().optional() }),
  admin: z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) })
});
export const reservationSchema = z.object({ area: z.string().min(2), startAt: z.coerce.date(), endAt: z.coerce.date(), residentId: z.string().optional() }).refine(v => v.endAt > v.startAt, { message: 'endAt must be after startAt' });
export const noticeSchema = z.object({ title: z.string().min(2), content: z.string().min(2), publishedAt: z.coerce.date().optional() });
export const incidentSchema = z.object({ title: z.string().min(2), description: z.string().min(2) });
export const chargeSchema = z.object({ description: z.string().min(2), amount: z.coerce.number().positive(), dueDate: z.coerce.date(), unitId: z.string().uuid() });
