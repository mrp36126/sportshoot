/**
 * NextAuth v5 Route Handler
 * 
 * Handles all authentication requests at /api/auth/*
 * Sign in, sign out, session, and callback endpoints.
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;