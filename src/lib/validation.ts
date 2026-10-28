import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(3).max(100),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  gender: z.enum(['MALE', 'FEMALE', 'OTHERS', 'NOT_DEFINED']).optional(),
})

export const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
})

export const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(12),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
export type LoginFormValues = z.infer<typeof loginSchema>
export type OtpFormValues = z.infer<typeof otpSchema>
