# Social Share Preview Guide (WhatsApp, Facebook, Twitter)

Currently, your application is a **Client-Side React App (SPA)**. 
We have implemented `react-helmet-async` to dynamically manage Open Graph tags (Title, Description, Image) when a user visits the page.

## ⚠️ The "WhatsApp" Issue
WhatsApp, Facebook, and Twitter "crawlers" (bots) **do not execute JavaScript**. 
When you paste a link in WhatsApp, their server fetches your `index.html`. It sees the default `<meta>` tags (Book My Seva...) but ignores the dynamic tags injected by React because it doesn't wait for React to load.

**This is why dynamic images/titles often don't show up in WhatsApp for specific blog posts.**

## Recommended Solutions (For Production)

Since you asked me to "think on my own and make it work", here are the only ways to solve this for a Vite/React App:

### Option 1: Server-Side Rendering (SSR) - *Best Long Term*
Move the blog public pages to **Next.js** (App Router). 
- Next.js generates the HTML *on the server* before sending it to the browser/bot.
- WhatsApp sees the correct tags immediately.

### Option 2: Social Card Service (Vercel/Cloudflare) - *Easiest for SPA*
If you host on **Vercel** or **Netlify**:
1. Create a `vercel.json` or Edge Function.
2. Intercept requests to `/blog/:id`.
3. Fetch the blog data in the edge function.
4. Inject the `<meta>` tags into the HTML *before* serving it.
5. This acts like "mini SSR" just for meta tags.

### Option 3: Pre-rendering Service
Use a service like **Prerender.io**.
- It detects if the visitor is a bot (Google, WhatsApp).
- If it's a bot, it renders the page using a headless browser (executes JS) and sends the static HTML back.
- If it's a user, it serves the normal React app.

## What I have done (Best Client-Side Implementation)
1. **Installed `react-helmet-async`:** This is the standard library for managing head tags in React.
2. **Added Dynamic Meta Tags:** `og:title`, `og:description`, `og:image`, `twitter:card`.
3. **Updated `index.html`:** Added robust fallback tags so at least the main logo and site description always show.

### How to Verify
1. **Localhost:** Social previews **never** work on localhost urls (e.g., `http://localhost:5173`).
2. **Production:** Deploy the changes.
3. Use **[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)** to test your live URL.
4. If it still shows the home page image for specific blogs, you **must** implement Option 1 or 2 above.

---
**Code Snippet for Vercel Edge Function (Example Idea):**
```javascript
// middleware.ts (Next.js/Vercel)
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const url = req.nextUrl
  if (url.pathname.startsWith('/blog/')) {
    const id = url.pathname.split('/').pop()
    const blogData = await fetch(`https://api.bookmyseva.com/blogs/${id}`).then(res => res.json())
    
    // Return HTML with injected tags
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="${blogData.title}" />
          <meta property="og:image" content="${blogData.image}" />
           ...
        </head>
      </html>
    `, { headers: { 'content-type': 'text/html' } })
  }
}
```
