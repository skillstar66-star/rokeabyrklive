# ROKEA by RK - API Key Management

## Setup
This project now uses environment variables for Firebase and Razorpay API keys.

1. **.env**: Contains the master list of keys. This file is ignored by Git.
2. **config.js**: A bridge file that makes the keys available to the browser via `process.env`. This file is also ignored by Git.
3. **script.js**: Refactored to access keys using `process.env`.

## How to update keys
To change an API key, update the value in both `.env` and `config.js`.

## Production Deployment
For production, it is recommended to use a build tool like **Vite** or **Webpack**. 
- These tools can automatically inject values from `.env` into your code during the build process.
- Once you set up a bundler, you can remove `<script src="config.js"></script>` from your HTML files.
- The `process.env` references in `script.js` will be replaced with actual values during the build.