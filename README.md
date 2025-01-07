# Kitty Kombat Lite

View live demo on Telegram: <a href="https://t.me/KittyKombatLiteBot/app/" target="_blank">https://t.me/KittyKombatLiteBot/app/</a>

Deploy your own onchain Telegram game powered by Flow blockchain: [1-Click Starter](https://dapp-deployer.vercel.app/)

<img src="./public/live_demo.jpg" alt="Live Demo" width="200" />

---

# Production Setup Guide

## Follow Video Tutorial

You can follow this video walkthrough on how to setup your onchain Telegram game

<iframe width="560" height="315" src="https://www.youtube.com/embed/w70ICeVh6fY?si=Ep-qjNTq6APcQZQP" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Prerequisites

1. Create accounts and gather credentials:
    - <a href="https://vercel.com" target="_blank">Vercel</a> account for deployment
    - <a href="https://magic.link" target="_blank">Magic.link</a> account for custodial wallets

## Frontend Deployment on Vercel

1. Visit <a href="https://vercel.com" target="_blank">[Vercel](https://vercel.com)</a> and sign in

2. Add a new project and import your repo

<img src="./public/image_1.png" alt="Add new project" width="500" />

<img src="./public/image_2.png" alt="Import repo" width="500" />

3. Before you click deploy, choose `build and output settings` and add the following custom `install command`

```sh
npm install --legacy-peer-deps
```

<img src="./public/image_3.png" alt="Custom install command" width="500" />

4. Click on the Deploy button and save your domain URL

<img src="./public/image_4.png" alt="Save domain url" width="500" />

## Magic Link Setup

1. Visit <a href="https://magic.link" target="_blank">https://magic.link</a> and sign in

2. Create a `new app` and enable `email` and `sms` login

<img src="./public/image_10.png" alt="create new app" width="500" />

<img src="./public/image_5.png" alt="enable email and sms login" width="500" />

3. Go to `Settings` and `Add Domain` from your Vercel deployment to `Allowed Origins & Redirects` and press `Save`

<img src="./public/image_6.png" alt="add domain" width="500" />

4. Save your publishable api key and add it to your Vercel `Environment Variables` under your Vercel project's `Settings`. Remember to press `Save`

```
NEXT_PUBLIC_MAGIC_API_KEY
```

<img src="./public/image_7.png" alt="publishable api key" width="500" />

<img src="./public/image_8.png" alt="environment variables" width="500" />

5. Redeploy your latest build to make sure the magic api key environment variable gets added to your app.

<img src="./public/image_9.png" alt="redeploy latest build" width="500" />

## Telegram Web App Setup

1. Go to [BotFather on Telegram](https://t.me/BotFather), the official bot for managing Telegram bots and web apps.

2. Create a Telegram Bot

Use the command 

```
/newbot
```

3. Create a Telegram App

Use the command 

```
/newapp
```

4. Configure Menu Button

Use the command `/mybots`, choose your Telegram bot to access `Bot Settings` -> `Menu Button` -> `Configure menu button`, type in your domain URL and enter the text to be displayed on your button (E.g. "Play")

5. Configure Mini App

Go to `Bot Settings` -> `Configure Mini App` -> `Enable Mini App` and type in your domain URL.

## Security Notes

-   Your Magic.link publishable key `NEXT_PUBLIC_MAGIC_API_KEY` is safe to commit

-   Add `.env` to your `.gitignore` file if it's not already there

## Environment Setup

1. Create a `.env` file in your project root:

```properties
NEXT_PUBLIC_MAGIC_API_KEY=your_magic_publishable_key
```

## Run locally

1. Install dependencies:

```sh
npm install
```

2. Run the project:

```sh
npm run dev
```
