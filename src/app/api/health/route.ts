import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "run02-energy-inspection",
      timestamp: new Date().toISOString(),
      vercel: {
        env: process.env.VERCEL_ENV ?? null,
        region: process.env.VERCEL_REGION ?? null,
        url: process.env.VERCEL_URL ?? null,
      },
      supabaseEnv: {
        hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      },
    },
    { status: 200 }
  )
}
