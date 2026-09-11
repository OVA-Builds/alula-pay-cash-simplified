import type { CapacitorConfig } from "@capacitor/cli";

// The demo APK loads the real deployed site in a native WebView shell —
// everything (including the D1-backed signup/login server functions) needs
// a live server to talk to, so this can't be a bundled static copy. The
// placeholder below gets replaced with the real workers.dev URL once
// .github/workflows/deploy.yml has actually deployed the Worker.
const config: CapacitorConfig = {
  appId: "com.alulapay.app",
  appName: "Alula Pay",
  webDir: "dist",
  server: {
    url: "https://tanstack-start-app.PLACEHOLDER.workers.dev",
    cleartext: false,
  },
};

export default config;
