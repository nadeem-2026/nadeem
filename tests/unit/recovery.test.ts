import assert from "node:assert/strict";
import test from "node:test";
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { resolveAuthCallback } from "../../src/lib/auth/callback";
import { establishRecoverySession, recoveryRequestClient } from "../../src/lib/auth/recovery";

const user = { id: "10000000-0000-4000-8000-000000000001", aud: "authenticated", role: "authenticated", email_confirmed_at: "2026-09-30T00:00:00Z" };
const jwt = ["e30", Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url"), "test"].join(".");
function fixture(options: { reject?: boolean; verifier?: boolean; server?: boolean } = {}) {
  const cookies = new Map<string, string>();
  if (options.verifier) cookies.set("sb-recovery-test-auth-token-code-verifier", JSON.stringify("test-verifier"));
  const requests: string[] = [];
  const config = {
    isSingleton: false,
    auth: { detectSessionInUrl: false, autoRefreshToken: false },
    cookies: {
      getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
      setAll: (values: { name: string; value: string }[]) => values.forEach(({ name, value }) => cookies.set(name, value)),
    },
    global: { fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = new URL(String(input)).pathname;
      requests.push(path);
      const body = JSON.parse(String(init?.body ?? "{}"));
      if (options.reject || (path === "/auth/v1/token" && body.code_verifier !== "test-verifier")) {
        return Response.json({ code: "bad_jwt", msg: "Invalid credentials" }, { status: 403 });
      }
      if (path === "/auth/v1/user") return Response.json(user);
      assert.equal(path, "/auth/v1/token");
      return Response.json({ access_token: jwt, refresh_token: "test-refresh", token_type: "bearer", expires_in: 3600, user });
    } },
  };
  const client = options.server
    ? createServerClient("https://recovery-test.supabase.co", "sb_publishable_test", config)
    : createBrowserClient("https://recovery-test.supabase.co", "sb_publishable_test", config);
  return { auth: client.auth, cookies, requests };
}

test("recovery email requests have no browser-bound PKCE challenge", async (t) => {
  let body: Record<string, unknown> = {};
  t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
    assert.equal(new URL(String(input)).pathname, "/auth/v1/recover");
    body = JSON.parse(String(init?.body));
    return Response.json({});
  });
  const client = recoveryRequestClient("https://recovery-test.supabase.co", "sb_publishable_test");
  const result = await client.auth.resetPasswordForEmail("test@example.invalid", { redirectTo: "https://nadeem.test/ar/auth/callback?next=/ar/update-password" });
  assert.equal(result.error, null);
  assert.equal(body.email, "test@example.invalid");
  assert.ok(!body.code_challenge);
});

test("fresh browser validates recovery credentials and writes SSR session cookies", async () => {
  const f = fixture();
  assert.equal(f.cookies.size, 0);
  assert.equal(await establishRecoverySession(f.auth, `#access_token=${jwt}&refresh_token=test-refresh&type=recovery`), true);
  assert.deepEqual(f.requests, ["/auth/v1/user"]);
  assert.ok([...f.cookies].some(([name, value]) => name.startsWith("sb-recovery-test-auth-token") && value.startsWith("base64-")));
});

test("rejected bearer credentials cannot establish a recovery session", async () => {
  const f = fixture({ reject: true });
  assert.equal(await establishRecoverySession(f.auth, `#access_token=${jwt}&refresh_token=test-refresh&type=recovery`), false);
  assert.equal(f.cookies.size, 0);
});

test("missing credentials, provider errors and non-recovery fragments are rejected before verification", async () => {
  const f = fixture();
  for (const hash of ["", "#type=recovery", "#access_token=x&type=recovery", "#access_token=x&refresh_token=y&type=signup", "#access_token=x&refresh_token=y&type=recovery&error=expired"]) {
    assert.equal(await establishRecoverySession(f.auth, hash), false);
  }
  assert.equal(f.requests.length, 0);
});

for (const locale of ["ar", "en"] as const) {
  test(`${locale}: callback hands recovery fragments to browser without trusting next`, async () => {
    const f = fixture({ server: true });
    assert.equal(await resolveAuthCallback(f.auth, locale, new URLSearchParams({ next: `/${locale}/update-password` })), `/${locale}/auth/recovery`);
    assert.equal(await resolveAuthCallback(f.auth, locale, new URLSearchParams({ next: "https://attacker.invalid" })), `/${locale}/login?notice=expired`);
    assert.equal(await resolveAuthCallback(f.auth, locale, new URLSearchParams({ next: `/${locale}/update-password`, error: "expired" })), `/${locale}/forgot-password?notice=expired`);
  });
}

test("old recovery PKCE links without verifier return to recovery, not sign in", async () => {
  const f = fixture({ server: true });
  assert.equal(await resolveAuthCallback(f.auth, "ar", new URLSearchParams({ code: "old-code", next: "/ar/update-password" })), "/ar/forgot-password?notice=expired");
});

test("signup and existing same-browser recovery PKCE keep allowlisted destinations", async () => {
  for (const next of ["/en/update-password", "https://attacker.invalid"]) {
    const f = fixture({ server: true, verifier: true });
    assert.equal(await resolveAuthCallback(f.auth, "en", new URLSearchParams({ code: "valid-code", next })), next === "/en/update-password" ? next : "/en/account");
  }
});
