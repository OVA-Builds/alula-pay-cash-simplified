import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { hashPin, verifyPin } from "./pin-hash";

export type SignupInput = {
  phone: string;
  firstName: string;
  lastName: string;
  pin: string;
  email: string;
  incomeSource: string;
};
export type SignupResult = { ok: true } | { ok: false; error: string };

export const signupUser = createServerFn({ method: "POST" })
  .validator((data: SignupInput) => data)
  .handler(async ({ data }): Promise<SignupResult> => {
    const existing = await env.DB.prepare("SELECT id FROM users WHERE phone = ?").bind(data.phone).first();
    if (existing) return { ok: false, error: "An account with this mobile number already exists." };

    const pinHash = await hashPin(data.pin);
    const now = Date.now();
    await env.DB.prepare(
      `INSERT INTO users (id, phone, first_name, last_name, email, income_source, app_pin_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(crypto.randomUUID(), data.phone, data.firstName, data.lastName, data.email || null, data.incomeSource || null, pinHash, now, now)
      .run();
    return { ok: true };
  });

export type LoginInput = { phone: string; pin: string };
export type LoginUser = { phone: string; firstName: string; lastName: string; email: string; incomeSource: string };
export type LoginResult = { ok: true; user: LoginUser } | { ok: false; error: string };

export const loginUser = createServerFn({ method: "POST" })
  .validator((data: LoginInput) => data)
  .handler(async ({ data }): Promise<LoginResult> => {
    const row = await env.DB.prepare(
      "SELECT phone, first_name, last_name, email, income_source, app_pin_hash FROM users WHERE phone = ?",
    )
      .bind(data.phone)
      .first<{ phone: string; first_name: string; last_name: string; email: string | null; income_source: string | null; app_pin_hash: string }>();
    if (!row) return { ok: false, error: "No account found with that mobile number." };

    const valid = await verifyPin(data.pin, row.app_pin_hash);
    if (!valid) return { ok: false, error: "Incorrect PIN." };

    return {
      ok: true,
      user: {
        phone: row.phone,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email ?? "",
        incomeSource: row.income_source ?? "",
      },
    };
  });
