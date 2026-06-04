# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # Run ESLint
```

## Architecture

Clean Architecture with four layers — each layer only depends inward:

```
domain/          → Entities (Appointment, Client, Service) and repository interfaces
application/     → Use cases (CreateAppointment, GetAppointments) with Zod validation
infrastructure/  → InMemoryAppointmentRepository; dependencies.ts wires all use cases
presentation/    → React components, hooks; BookingSystem is the main UI entry point
app/             → Next.js App Router: page.tsx renders BookingSystem, api/appointments/route.ts
```

The dependency injection container is `src/infrastructure/dependencies.ts` — it instantiates repositories and use cases once and exports them. API routes import from there.

## Data Layer

Currently **in-memory only** (`InMemoryAppointmentRepository`). No database or auth. All data is lost on server restart. Seed data in the repository file provides two mock appointments.

## Key Business Rules

- Beauty salon (Vanessa Gonzalez Studio): 4 services (haircut, balayage, color correction, tint)
- Max 3 concurrent clients per time slot; business hours 9 AM–4 PM
- Services have variable durations (1–5 hours) defined in `src/domain/entities/Service.ts`

## UI Stack

Tailwind CSS 4 + shadcn/ui (radix-nova style). Path alias `@/*` maps to `src/*`. shadcn components live in `src/presentation/ui/`.
