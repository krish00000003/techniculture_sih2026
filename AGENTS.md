# AGENTS.md

## Source of truth
- Read all files in /docs before any task. They are the source of truth.
- Do not add features that are not in the docs.

## Stack
- Client: React + Material UI (MUI), React Router, Axios
- Server: Node.js + Express + Mongoose
- Database: MongoDB Atlas
- Auth: Google Sign-In (employer, provider, admin) and magic link (trainee)

## Rules
- Follow the file structure in docs/4_Technical_Requirements.md.
- Use only the colour theme in docs/3_UI_UX_Requirements.md.
- Build one release phase at a time and show a plan before coding.
- Never hardcode secrets. Use .env and keep it out of Git.
- Use mock or sandbox services for payouts, IVR, WhatsApp and GST/MCA until told otherwise.
- Ask before deleting files or running destructive commands.