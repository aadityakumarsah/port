import { serve } from "bun";
import index from "./index.html";

// Development server: serves the SPA (HTML imports with HMR). All admin
// logic runs client-side via Supabase (auth, RLS, storage) — no server APIs.
const server = serve({
  port: Number(process.env.PORT) || 3000,
  routes: {
    "/*": index,
  },
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
