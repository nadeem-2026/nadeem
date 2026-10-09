import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const email = 'zeyad.mohammed.abotaher@gmail.com';
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === email);
  if (user) {
    console.log(`Found user ${user.id}, deleting...`);
    await supabase.auth.admin.deleteUser(user.id);
    console.log('Deleted.');
  } else {
    console.log('User not found, good to go.');
  }
}
run();
