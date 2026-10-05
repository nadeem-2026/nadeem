import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const dummyGuides = [
  { email: "g1@nadeem.local", password: "password123", name: "أحمد عبدالله", city: "الرياض", role: "guide" },
  { email: "g2@nadeem.local", password: "password123", name: "سارة خالد", city: "جدة", role: "guide" },
  { email: "g3@nadeem.local", password: "password123", name: "محمد فهد", city: "العلا", role: "guide" }
];

const dummyTourists = [
  { email: "t1@nadeem.local", password: "password123", name: "جون دو", city: "", role: "tourist" },
  { email: "t2@nadeem.local", password: "password123", name: "آنا ماري", city: "", role: "tourist" }
];

async function seed() {
  console.log("Seeding dummy users...");
  const users = [...dummyGuides, ...dummyTourists];

  for (const u of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: {
        display_name: u.name,
        account_type: u.role
      }
    });

    if (error) {
      console.error(`Error creating ${u.email}:`, error.message);
      continue;
    }

    console.log(`Created user ${u.email} with ID: ${data.user.id}`);
    
    // We wait 1s so the database trigger has time to insert the profile row.
    await new Promise(r => setTimeout(r, 1000));
    
    if (u.role === "guide") {
      await supabase.from("profiles").update({
        bio: `أنا مرشد سياحي من ${u.city}. أمتلك خبرة واسعة في الأماكن السياحية وأحب مشاركة ثقافتنا.`,
        city: u.city,
        languages: ["العربية", "English"],
        service_areas: [u.city],
        hourly_rate: 150,
        max_participants: 10,
        inclusions: ["مواصلات", "تذاكر الدخول"],
        verification_status: "verified" // auto-verify them for testing
      }).eq("id", data.user.id);
      
      console.log(`Updated guide profile for ${u.name}`);
    }
  }

  console.log("Done seeding!");
}

seed();
