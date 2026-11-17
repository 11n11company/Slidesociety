import { z } from 'zod';
import { prisma } from '../config/db.js';
import {
  hashPassword,
  comparePassword,
  generateSessionToken,
  generateRandomToken,
  hashToken
} from '../utils/security.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.service.js';
import { logger } from '../utils/logger.js';

// Input Validation Schemas
export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  email: z.string().trim().email().toLowerCase().optional()
});

/**
 * Register a new customer
 */
export async function registerCustomer(input) {
  const validated = registerSchema.parse(input);

  // Check duplicate email
  const existing = await prisma.user.findUnique({
    where: { email: validated.email }
  });

  if (existing) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  // Hash password
  const passwordHash = await hashPassword(validated.password);

  // Generate verification token (expires in 24 hours)
  const rawVerificationToken = generateRandomToken(32);
  const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Strictly enforce CUSTOMER role (ignore any supplied role parameter)
  const newUser = await prisma.user.create({
    data: {
      fullName: validated.fullName,
      email: validated.email,
      passwordHash,
      role: 'CUSTOMER',
      isVerified: false,
      verificationToken: rawVerificationToken,
      verificationTokenExpires: tokenExpires
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true
    }
  });

  // Dispatch verification email
  const emailResult = await sendVerificationEmail({
    to: newUser.email,
    fullName: newUser.fullName,
    verificationToken: rawVerificationToken
  });

  // Generate session token so the newly registered customer is immediately logged in
  const sessionToken = generateSessionToken(newUser);

  return {
    user: newUser,
    sessionToken,
    emailResult
  };
}

/**
 * Authenticate customer credentials
 */
export async function loginCustomer(input) {
  const validated = loginSchema.parse(input);

  const user = await prisma.user.findUnique({
    where: { email: validated.email }
  });

  // Protect against timing attacks by running compare even if user not found
  const dummyHash = '$2a$12$e8Y0wU37K/QvVz7jCclnO.6kU6vOaD15kF9f0f.j4Z5pC7cTzWpGy';
  const isMatch = await comparePassword(validated.password, user ? user.passwordHash : dummyHash);

  if (!user || !isMatch) {
    const error = new Error('Invalid email or password. Please verify your credentials.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  // Record login timestamp
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  const sessionToken = generateSessionToken(user);

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      phone: user.phone,
      createdAt: user.createdAt
    },
    sessionToken
  };
}

/**
 * Verify customer email address
 */
export async function verifyEmailAddress(input) {
  const validated = verifyEmailSchema.parse(input);

  // Look for user by verification token
  let user = await prisma.user.findFirst({
    where: {
      verificationToken: validated.token
    }
  });

  if (!user && validated.email) {
    user = await prisma.user.findUnique({
      where: { email: validated.email }
    });
    if (user && user.verificationToken !== validated.token) {
      user = null;
    }
  }

  if (!user) {
    const error = new Error('Invalid or expired email verification token.');
    error.statusCode = 400;
    error.code = 'INVALID_VERIFICATION_TOKEN';
    throw error;
  }

  if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
    const error = new Error('This verification token has expired. Please request a new one.');
    error.statusCode = 400;
    error.code = 'TOKEN_EXPIRED';
    throw error;
  }

  // Mark verified & clear token
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isVerified: true
    }
  });

  return updatedUser;
}

/**
 * Request Password Reset
 * Never reveals whether an email is registered to prevent user enumeration
 */
export async function requestPasswordReset(input) {
  const validated = forgotPasswordSchema.parse(input);

  const genericResponse = {
    message: 'If an account with that email address exists, password reset instructions have been dispatched.'
  };

  const user = await prisma.user.findUnique({
    where: { email: validated.email }
  });

  if (!user) {
    // Return identical message without sending email
    return genericResponse;
  }

  // Generate single-use reset token (valid for 1 hour)
  const rawResetToken = generateRandomToken(32);
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: rawResetToken,
      resetPasswordExpires: resetExpires
    }
  });

  // Dispatch reset email
  await sendPasswordResetEmail({
    to: user.email,
    fullName: user.fullName,
    resetToken: rawResetToken
  });

  return genericResponse;
}

/**
 * Reset Password using Token
 */
export async function resetPasswordWithToken(input) {
  const validated = resetPasswordSchema.parse(input);

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: validated.token
    }
  });

  if (!user) {
    const error = new Error('Invalid or expired password reset token.');
    error.statusCode = 400;
    error.code = 'INVALID_RESET_TOKEN';
    throw error;
  }

  if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
    // Clear expired token
    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: null, resetPasswordExpires: null }
    });
    const error = new Error('This password reset link has expired. Please request a new one.');
    error.statusCode = 400;
    error.code = 'RESET_TOKEN_EXPIRED';
    throw error;
  }

  // Hash new password
  const newPasswordHash = await hashPassword(validated.password);

  // Update password & clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newPasswordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null
    }
  });

  return {
    message: 'Your password has been reset successfully. You can now sign in with your new password.'
  };
}

/**
 * Retrieve User Profile by ID
 */
export async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isVerified: true,
      phone: true,
      createdAt: true,
      lastLoginAt: true,
      addresses: {
        select: {
          id: true,
          addressType: true,
          recipientName: true,
          streetLine1: true,
          streetLine2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
          isDefault: true
        }
      }
    }
  });

  if (!user) {
    const error = new Error('User account not found.');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  return user;
}
