# Portfolio — aadityakumarsah.pages.dev

Personal portfolio site built with Bun + React + Tailwind CSS. Features a dark theme, click-particle effects, and live deployment on Cloudflare Pages.

## Stack

- **Runtime:** Bun
- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + tw-animate-css
- **Bundler:** Bun's native bundler
- **Hosting:** Cloudflare Pages

## Development

```bash
bun install
bun dev        # dev server with HMR
bun run build  # build to dist/
```

## Deployment

```bash
bunx wrangler pages deploy dist --project-name aadityakumarsah
```
