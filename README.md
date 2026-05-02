# Team Task Manager

A MERN Team Task Manager built with Vite, React, JavaScript, Tailwind CSS, Node.js, Express, MongoDB, Mongoose, JWT auth, bcrypt password hashing, role-based access control, and Axios API integration.

## Local Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create `server/.env` from `server/.env.example`.

3. Run the app:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` and the API runs on `http://localhost:5000`.

## Railway

Set these Railway variables:

```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
CLIENT_URL=https://your-railway-domain.up.railway.app
```

Railway uses `railway.json`, runs `npm run build`, then starts the server with `npm start`.
