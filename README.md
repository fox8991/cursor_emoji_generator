This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Overview

The Next.js Emoji Generator is an application where users can provide a text prompt to generate unique emojis. The emoji generation is powered by an AI model hosted on Replicate. Users can sign up, sign in, view their generated emojis, and see public emojis created by others.

## Key Features & Technology Stack

### Core Functionality
- **Emoji Generation:** Users input text prompts to create custom emojis.
- **User Authentication:** Secure sign-up and sign-in using email/password or Google OAuth.
- **Emoji Display:** View a gallery of personally generated emojis and a separate gallery for public emojis.
- **Interaction:** Download generated emojis and "like" emojis.

### Technology Stack
- **Frontend:**
    - [Next.js](https://nextjs.org/) (App Router)
    - [TypeScript](https://www.typescriptlang.org/)
    - [Tailwind CSS](https://tailwindcss.com/)
    - [Shadcn UI](https://ui.shadcn.com/)
    - [Lucide React](https://lucide.dev/) (for icons)
- **Backend:**
    - Next.js (API Routes)
    - [Supabase](https://supabase.com/):
        - **Authentication:** Manages user sign-up, sign-in, and sessions.
        - **Database:** Stores emoji metadata (prompts, storage paths, likes) and user-like relationships.
        - **Storage:** Securely stores the generated emoji image files.
- **AI / LLM:**
    - [Replicate](https://replicate.com/): Hosts the AI model for emoji generation.
        - Model: `fofr/sdxl-emoji`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
