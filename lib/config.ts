/**
 * Centralized configuration for the LinkSave extension.
 * Reads from environment variables set in .env.local
 *
 * Development (.env.local):  VITE_API_BASE=http://localhost:3001/api
 * Production (.env.local):   VITE_API_BASE=https://your-app.onrender.com/api
 */
export const API_BASE = import.meta.env.VITE_API_BASE as string;
