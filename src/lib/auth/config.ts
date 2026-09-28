export function getAuthConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!url || !key || !siteUrl) return null;
  const provider = new URL(url);
  const site = new URL(siteUrl);
  if (provider.protocol !== "https:" && !(provider.protocol === "http:" && ["127.0.0.1", "localhost"].includes(provider.hostname))) throw new Error("Invalid Supabase URL");
  if (site.protocol !== "https:" && !(site.protocol === "http:" && ["localhost", "127.0.0.1"].includes(site.hostname))) throw new Error("Invalid site URL");
  if (!key.startsWith("sb_publishable_")) throw new Error("A Supabase publishable key is required");
  return { url: provider.origin, key, siteUrl: site.origin };
}
