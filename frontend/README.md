# Frontend - Philly Campus Cleanups

React + Vite + Tailwind + shadcn/ui style components (Radix + utilities) starter.

## Cleanup Submission Flow (Updated)
Users must now provide a before and after image. The frontend sends a multipart/form-data POST with:
- description (text)
- before_image (File)
- after_image (File)

Backend should perform AI diff / validation and respond with success + awarded points or an error message.

## Scripts
- `pnpm dev` or `npm run dev` - start dev server
- `npm run build` - production build
- `npm run preview` - preview build

## Env
Create `.env` with:
```
VITE_API_BASE=http://localhost:8000
```
