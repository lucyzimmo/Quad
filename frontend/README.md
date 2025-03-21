## NOTES AND TODOS
- Alex removed images from all the files, any image related code is currently commented out, will add images in the future

# The Quad Frontend

ui stuff for our quad app

## Prerequisites

need [Node.js](https://nodejs.org/) (version 18 or higher), install. npm comes with it.

## Running the app

```bash
npm install
npm run dev
```

## Deploying the app (NOT YET)

```bash
npm run build
npm run deploy
```

## Project Structure

```bash
src/
├── assets/ # images, icons, etc.
├── components/ # reusable ui components
├── data/ # data files
├── lib/ # library files
├── screens/ # pages
├── App.tsx # main app component
├── main.tsx # entry point
├── vite-env.d.ts # vite environment variables (ignore rn?)
└── index.css # global css
```