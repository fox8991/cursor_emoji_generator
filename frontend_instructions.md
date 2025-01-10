# Project overview 

Use this guide to build a Next.js app with app router, where users can give a text prompt to generate emoj using model hosted on Replicate.

# Feature requirements

We will use Next.js, Shadcn, Lucid, Supabase, Clerk

- Create a form where users can put in prompt, and clicking on button that calls the replicate model to generate emoji
- Have a nice UI & animation when the emoji is blank or generating
- Display all the images ever generated in grid
- When hover each emoj img, an icon button for download, and an icon button for like should be shown up

# Relevant docs

## How to run the emoji generator model

Install Replicate’s Node.js client library

npm install replicate

Run fofr/sdxl-emoji using Replicate’s API. Check out the model's schema for an overview of inputs and outputs.

import Replicate from "replicate";
const replicate = new Replicate();

const input = {
    prompt: "A TOK emoji of a man",
    apply_watermark: false
};

const output = await replicate.run("fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e", { input });

import { writeFile } from "node:fs/promises";
for (const [index, item] of Object.entries(output)) {
  await writeFile(`output_${index}.png`, item);
}
//=> output_0.png written to disk

# Rules 
- All new components should go in /components and be named like example-component.tsx unless otherwise specified 
- All new pages go in /app
