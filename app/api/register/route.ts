// app/api/register/route.ts

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const schema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = schema.parse(body);

    // 🔍 Check if user exists
    const { data: existingUser, error: findError } = await supabase
      .from('User')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Account already exists with this email' },
        { status: 409 }
      );
    }

    // 🔐 Hash password
    const hashed = await bcrypt.hash(password, 12);

    // 📝 Insert user
    const { data: user, error: insertError } = await supabase
      .from('User')
      .insert([
        {
          name,
          email,
          password: hashed,
        },
      ])
      .select('id, email, name')
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json(
      { success: true, user },
      { status: 201 }
    );

  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.errors[0]?.message ?? 'Validation error' },
        { status: 400 }
      );
    }

    console.error('[REGISTER]', e);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
