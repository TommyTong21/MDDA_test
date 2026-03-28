import type { User } from "@supabase/supabase-js"

type DbWithAuth = {
  auth: {
    getUser: () => Promise<{ data: { user: User | null }; error: unknown | null }>
  }
}

/**
 * 从 Supabase SSR session 中获取当前用户；未登录则返回 null。
 */
export async function getAuthUser(db: DbWithAuth): Promise<User | null> {
  const { data, error } = await db.auth.getUser()
  if (error) return null
  return data.user
}

