import { createClient } from '@/utils/supabase/server'

export async function UserInfo() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user ? (
    <div className="text-gray-400">
      Hello, {user.email}
    </div>
  ) : null
} 