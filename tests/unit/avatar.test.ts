import assert from "node:assert/strict";
import test from "node:test";
import { resolveAvatarUrl, getInitials } from "../../src/lib/avatar";

test("avatar initials generation produces clean upper-case initials", () => {
  assert.equal(getInitials(""), "N");
  assert.equal(getInitials("   "), "N");
  assert.equal(getInitials("أحمد"), "أح");
  assert.equal(getInitials("أحمد فهد"), "أف");
  assert.equal(getInitials("Sara Smith"), "SS");
  assert.equal(getInitials("John"), "JO");
  assert.equal(getInitials("X"), "X");
});

test("resolveAvatarUrl handles relative storage paths, external URLs, and private bucket routes", () => {
  // Empty or invalid inputs
  assert.equal(resolveAvatarUrl(null), null);
  assert.equal(resolveAvatarUrl(undefined), null);
  assert.equal(resolveAvatarUrl(""), null);
  assert.equal(resolveAvatarUrl("   "), null);

  // Data URLs and blob URIs
  assert.equal(resolveAvatarUrl("data:image/jpeg;base64,abc"), "data:image/jpeg;base64,abc");
  assert.equal(resolveAvatarUrl("blob:http://localhost:3000/123"), "blob:http://localhost:3000/123");

  // Relative storage path stored in DB (e.g. guide_documents/user_id/random.jpg or user_id/random.jpg)
  assert.equal(
    resolveAvatarUrl("10000000-0000-4000-8000-000000000001/portrait_123.jpg"),
    "/api/avatar/guide_documents/10000000-0000-4000-8000-000000000001/portrait_123.jpg"
  );
  assert.equal(
    resolveAvatarUrl("guide_documents/10000000-0000-4000-8000-000000000001/portrait_123.jpg"),
    "/api/avatar/guide_documents/10000000-0000-4000-8000-000000000001/portrait_123.jpg"
  );
  assert.equal(
    resolveAvatarUrl("avatars/10000000-0000-4000-8000-000000000001/tourist_portrait.webp"),
    "/api/avatar/avatars/10000000-0000-4000-8000-000000000001/tourist_portrait.webp"
  );

  // Supabase storage HTTP/HTTPS URLs
  assert.equal(
    resolveAvatarUrl("http://127.0.0.1:54321/storage/v1/object/public/guide_documents/user_1/pic.png"),
    "/api/avatar/guide_documents/user_1/pic.png"
  );
  assert.equal(
    resolveAvatarUrl("https://nadeem-prod.supabase.co/storage/v1/object/authenticated/guide_documents/user_1/pic.png"),
    "/api/avatar/guide_documents/user_1/pic.png"
  );

  // External URLs (e.g. Google OAuth user photo)
  assert.equal(
    resolveAvatarUrl("https://lh3.googleusercontent.com/a/ACg8ocISsamplePhoto"),
    "https://lh3.googleusercontent.com/a/ACg8ocISsamplePhoto"
  );

  // Already proxied path
  assert.equal(
    resolveAvatarUrl("/api/avatar/avatars/user_1/pic.webp"),
    "/api/avatar/avatars/user_1/pic.webp"
  );
});
