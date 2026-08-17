import pg from 'pg'

// Session mode pooler with project ref in username
const connectionString = 'postgresql://postgres.wyuyhozqvpcdcluoqnbm:Hazwanrais12@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres'

async function main() {
  const client = new pg.Client({ 
    connectionString,
    connectionTimeoutMillis: 15000,
  })
  await client.connect()
  console.log('📦 Connected to Supabase. Creating storage bucket + policies...\n')

  // 1. Create the 'uploads' bucket (public, 10MB, images only)
  await client.query(`
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'uploads', 'uploads', true, 10485760,
      ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
    )
    ON CONFLICT (id) DO UPDATE SET 
      public = true, 
      file_size_limit = 10485760,
      allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
  `)
  console.log('  ✓ Bucket "uploads" created (public, 10MB, images only)')

  // 2. Policy: anyone can upload (INSERT)
  await client.query(`
    CREATE POLICY IF NOT EXISTS "uploads_public_insert" 
    ON storage.objects FOR INSERT 
    TO anon, authenticated 
    WITH CHECK (bucket_id = 'uploads')
  `)
  console.log('  ✓ Policy: public INSERT enabled')

  // 3. Policy: anyone can read (SELECT)
  await client.query(`
    CREATE POLICY IF NOT EXISTS "uploads_public_select" 
    ON storage.objects FOR SELECT 
    TO anon, authenticated 
    USING (bucket_id = 'uploads')
  `)
  console.log('  ✓ Policy: public SELECT enabled')

  // 4. Policy: anyone can delete
  await client.query(`
    CREATE POLICY IF NOT EXISTS "uploads_public_delete" 
    ON storage.objects FOR DELETE 
    TO anon, authenticated 
    USING (bucket_id = 'uploads')
  `)
  console.log('  ✓ Policy: public DELETE enabled')

  // Verify
  const res = await client.query("SELECT id, name, public FROM storage.buckets WHERE id = 'uploads'")
  console.log('\n✅ Storage bucket ready:', JSON.stringify(res.rows[0]))

  const policies = await client.query("SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'")
  console.log('   Policies:', policies.rows.map((r: any) => r.policyname).join(', '))

  await client.end()
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1) })
