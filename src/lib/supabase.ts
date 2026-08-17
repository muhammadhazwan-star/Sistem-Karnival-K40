import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wyuyhozqvpcdcluoqnbm.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_ir81DdGWqkaqS90wG6GdKg_1uJ4XwcV'

// Server-side Supabase client for storage uploads
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const BUCKET = 'uploads'

// Upload an image buffer to Supabase Storage and return the public URL
export async function uploadImage(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, {
      contentType,
      upsert: false,
    })

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filename)

  return urlData.publicUrl
}
