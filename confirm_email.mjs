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
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listUsers', listError);
    process.exit(1);
  }
  
  const user = users.find(u => u.email === email);
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }
  
  const { error } = await supabase.auth.admin.updateUserById(user.id, { email_confirm: true });
  if (error) {
    console.error('Error confirming email', error);
    process.exit(1);
  }
  
  console.log(`Successfully confirmed email for ${email}`);
}

run();
