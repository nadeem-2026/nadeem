import { authClient } from "@/lib/auth/server";

export type PublicGuide = {
  id: string; display_name: string; city: string; bio: string;
  hourly_rate: number; languages: string[]; service_areas: string[];
  max_participants: number; inclusions: string[];
};

export async function publicGuides(): Promise<PublicGuide[]> {
  const client = await authClient();
  if (!client) return [];
  const { data, error } = await client.rpc("list_public_guides");
  if (error) throw new Error("Guide search is temporarily unavailable. Please try again.");
  return (data ?? []) as PublicGuide[];
}
