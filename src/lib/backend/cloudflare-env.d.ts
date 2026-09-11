// Hand-written, minimal ambient types for exactly what this project's
// server code touches — deliberately NOT the full `wrangler types` output.
// That generated file redeclares hundreds of workerd-runtime globals
// (addEventListener, etc.) that collide with the browser DOM lib this same
// tsconfig also needs for the React client code, since both share one
// program. This file only augments the "cloudflare:workers" module itself,
// so it can't leak into unrelated global types.
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<unknown>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

declare module "cloudflare:workers" {
  export const env: { DB: D1Database };
}
