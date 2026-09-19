import { z } from 'zod'

const band = z.enum(['leve', 'media', 'pesada'])
export const setLogSchema = z.object({
  n: z.number(), suggestedLoadKg: z.number().nullable(), suggestedReps: z.number(),
  actualLoadKg: z.number().nullable(), actualReps: z.number().nullable(), rir: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).nullable(),
  done: z.boolean(), amrap: z.boolean().optional(), assist: band.nullable().optional(), holdSec: z.number().nullable().optional()
})
export const sessionSchema = z.object({
  id: z.string(), date: z.string(), templateId: z.string(), startedAt: z.string(), finishedAt: z.string().optional(), durationSec: z.number().optional(),
  exercises: z.array(z.object({ exerciseId: z.string(), sets: z.array(setLogSchema), painScore: z.number().optional(), stage: z.number().optional() })),
  rowingMin: z.number().optional(), notes: z.string().optional(), light: z.boolean().optional()
})
export const weekSchema = z.object({
  weekStart: z.string(), light: z.boolean().optional(),
  days: z.array(z.object({ date: z.string(), templateId: z.string(), status: z.enum(['planned', 'done', 'skipped', 'swapped']), sourceTemplateId: z.string().optional() }))
})
export const inventorySchema = z.object({
  plates: z.array(z.object({ kg: z.number(), count: z.number() })), handleKg: z.number(), handles: z.number(),
  adjustable: z.array(z.object({ minKg: z.number(), maxKg: z.number(), stepKg: z.number(), pair: z.boolean() })),
  kettlebells: z.array(z.number()), bands: z.array(band), dipBelt: z.boolean()
})
export const settingsSchema = z.object({
  startDate: z.string(), inventory: inventorySchema, rowingRestDay: z.boolean(), sessionCapMin: z.number(),
  weekMode: z.enum(['6x30', '4x45']), bodyweightKg: z.number(), stretchNoteSeen: z.boolean()
})
export const appStateSchema = z.object({
  schemaVersion: z.number(), settings: settingsSchema, weeks: z.array(weekSchema), sessions: z.array(sessionSchema),
  pullup: z.object({ stage: z.number(), consecutiveHits: z.number(), tests: z.array(z.object({ date: z.string(), strictReps: z.number() })) }),
  body: z.array(z.object({ date: z.string(), bodyweightKg: z.number().optional(), armLeftCm: z.number().optional(), armRightCm: z.number().optional() })),
  active: sessionSchema.nullable()
})
