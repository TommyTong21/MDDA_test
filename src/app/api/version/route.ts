import { NextResponse } from "next/server"
import pkg from "../../../../package.json"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json(
    {
      name: pkg.name ?? "run02-energy-inspection",
      version: pkg.version ?? "0.0.0",
      vercel: {
        env: process.env.VERCEL_ENV ?? null,
        url: process.env.VERCEL_URL ?? null,
      },
      git: {
        commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
        commitRef: process.env.VERCEL_GIT_COMMIT_REF ?? null,
        commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE ?? null,
        commitAuthorLogin: process.env.VERCEL_GIT_COMMIT_AUTHOR_LOGIN ?? null,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}
