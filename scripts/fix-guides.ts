import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const dummyGuides = [
  { email: "g1@nadeem.local", name: "أحمد عبدالله", city: "الرياض" },
  { email: "g2@nadeem.local", name: "سارة خالد", city: "جدة" },
  { email: "g3@nadeem.local", name: "محمد فهد", city: "العلا" },
  { email: "guide1@nadeem.local", name: "Guide 1", city: "الرياض" },
  { email: "guide2@nadeem.local", name: "Guide 2", city: "جدة" },
  { email: "guide3@nadeem.local", name: "Guide 3", city: "العلا" }
];

async function fix() {
  const { data: users } = await supabase.auth.admin.listUsers();
  for (const u of dummyGuides) {
    const user = users.users.find(x => x.email === u.email);
    if (user) {
      // 1. Ensure metadata is guide
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, account_type: "guide" }
      });
      
      // 2. Ensure profile role is guide
      await supabase.from("profiles").update({ role: "guide" }).eq("id", user.id);
      
      // 3. Upsert guide_profiles with status = 'approved'
      const { error } = await supabase.from("guide_profiles").upsert({
         user_id: user.id,
         city: u.city,
         bio: `أنا مرشد سياحي من ${u.city}. أمتلك خبرة واسعة في الأماكن السياحية وأحب مشاركة ثقافتنا.`,
         languages: ["العربية", "English"],
         service_areas: [u.city],
         hourly_rate: 150,
         max_participants: 10,
         inclusions: ["مواصلات", "تذاكر الدخول"],
         status: "approved"
      }, { onConflict: "user_id" });
      
      if (error) {
        console.error("Error upserting guide_profile for", u.email, error);
      } else {
        console.log("Fixed guide", u.email);
      }
    }
  }
}
fix();
