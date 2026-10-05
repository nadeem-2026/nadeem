import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function reset() {
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error fetching users:", error);
    return;
  }
  
  for (const u of users.users) {
    if (u.email?.endsWith("@nadeem.local")) {
      await supabase.auth.admin.deleteUser(u.id);
      console.log(`Deleted user ${u.email}`);
    }
  }
  console.log("Done deleting.");
}
reset();
