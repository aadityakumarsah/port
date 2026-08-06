import { serve } from "bun";
import { v2 as cloudinary } from "cloudinary";
import index from "./index.html";
import { supabaseAdmin } from "./lib/supabase-admin";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function isAdmin(req: Request) {
  return req.headers.get("x-admin-token") === ADMIN_TOKEN;
}

function slugify(text: string) {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || null;
}

function cloudinaryPublicIdFromUrl(url: string): string | null {
  const m = url.match(/res\.cloudinary\.com\/[^/"']+\/image\/upload\/(.+)/);
  if (!m) return null;
  const segments = (m[1] ?? "").split("/");
  let i = 0;
  while (i < segments.length && !/^v\d+$/.test(segments[i]!)) i++;
  if (i >= segments.length) return null;
  const id = segments.slice(i + 1).join("/");
  return id ? id.replace(/\.(png|jpe?g|webp|gif|svg|avif|bmp)$/i, "") : null;
}

function extractCloudinaryPublicIds(html: string | null | undefined) {
  if (!html) return [];
  const ids = new Set<string>();
  const re = /res\.cloudinary\.com\/[^"'\s)>]+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const id = cloudinaryPublicIdFromUrl(match[0]);
    if (id) ids.add(id);
  }
  return [...ids];
}

const server = serve({
  port: Number(process.env.PORT) || 3000,
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },

    // Admin: exchange password for a session token
    "/api/admin/verify": {
      async POST(req) {
        const { password } = await req.json();
        if (password === process.env.ADMIN_PASSWORD) {
          return Response.json({ token: ADMIN_TOKEN });
        }
        return Response.json({ error: "Wrong password" }, { status: 401 });
      },
    },

    // Admin: create a post (JSON: title, slug?, content? OR multipart: title, slug?, content?, image?)
    "/api/admin/posts": {
      async POST(req) {
        if (!isAdmin(req)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const contentType = req.headers.get("content-type") ?? "";
        let title = "";
        let slug: string | null = null;
        let content: string | null = null;
        let imageUrl: string | null = null;
        let publicId: string | null = null;

        if (contentType.includes("application/json")) {
          const body = await req.json();
          title = String(body.title ?? "").trim();
          if (!title) {
            return Response.json({ error: "title is required" }, { status: 400 });
          }
          slug = body.slug ? String(body.slug).trim() : slugify(title);
          content = body.content ? String(body.content).trim() : null;
        } else {
          const form = await req.formData();
          title = String(form.get("title") ?? "").trim();
          if (!title) {
            return Response.json({ error: "title is required" }, { status: 400 });
          }
          slug = String(form.get("slug") ?? "").trim() || null;
          content = String(form.get("content") ?? "").trim() || null;
          const image = form.get("image");

          if (image && typeof image !== "string") {
            const file = image as File;
            if (!file.type.startsWith("image/")) {
              return Response.json({ error: "image must be an image file" }, { status: 400 });
            }
            if (file.size > 10 * 1024 * 1024) {
              return Response.json({ error: "image must be under 10MB" }, { status: 400 });
            }
            const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
            const result = await cloudinary.uploader.upload(
              `data:${file.type};base64,${base64}`,
              { folder: "blog", use_filename: true, unique_filename: true }
            );
            imageUrl = result.secure_url;
            publicId = result.public_id;
          }
        }

        const { data, error } = await supabaseAdmin
          .from("posts")
          .insert({ title, slug, content, image_url: imageUrl, cloudinary_public_id: publicId })
          .select()
          .single();

        if (error) {
          if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => {});
          return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json(data, { status: 201 });
      },
    },

    // Admin: upload an image to Cloudinary (multipart: image)
    "/api/admin/upload": {
      async POST(req) {
        if (!isAdmin(req)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const form = await req.formData();
        const image = form.get("image");

        if (!image || typeof image === "string") {
          return Response.json({ error: "image is required" }, { status: 400 });
        }

        const file = image as File;
        if (!file.type.startsWith("image/")) {
          return Response.json({ error: "image must be an image file" }, { status: 400 });
        }
        if (file.size > 10 * 1024 * 1024) {
          return Response.json({ error: "image must be under 10MB" }, { status: 400 });
        }

        const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
        const result = await cloudinary.uploader.upload(
          `data:${file.type};base64,${base64}`,
          { folder: "blog", use_filename: true, unique_filename: true }
        );

        const optimized = result.secure_url.replace(
          "/image/upload/",
          "/image/upload/q_auto,f_auto,w_1600/"
        );

        return Response.json({ url: optimized, public_id: result.public_id }, { status: 201 });
      },
    },

    // Admin: delete an image from Cloudinary by URL (JSON: { url })
    "/api/admin/delete-image": {
      async POST(req) {
        if (!isAdmin(req)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { url } = await req.json();
        if (typeof url !== "string" || !url) {
          return Response.json({ error: "url is required" }, { status: 400 });
        }
        const publicId = cloudinaryPublicIdFromUrl(url);
        if (!publicId) {
          return Response.json({ error: "Not a Cloudinary image" }, { status: 400 });
        }
        await cloudinary.uploader.destroy(publicId);
        return Response.json({ ok: true });
      },
    },

    // Admin: delete a post (also removes its image from Cloudinary)
    "/api/admin/posts/:id": {
      async DELETE(req) {
        if (!isAdmin(req)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = req.params.id;

        const { data, error } = await supabaseAdmin
          .from("posts")
          .select("cloudinary_public_id, content")
          .eq("id", id)
          .single();

        if (error) {
          return Response.json({ error: error.message }, { status: 500 });
        }

        const publicIds = new Set<string>();
        if (data?.cloudinary_public_id) publicIds.add(data.cloudinary_public_id);
        for (const pid of extractCloudinaryPublicIds(data?.content)) publicIds.add(pid);

        for (const pid of publicIds) {
          await cloudinary.uploader.destroy(pid);
        }

        const { error: delError } = await supabaseAdmin.from("posts").delete().eq("id", id);

        if (delError) {
          return Response.json({ error: delError.message }, { status: 500 });
        }

        return Response.json({ ok: true });
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
