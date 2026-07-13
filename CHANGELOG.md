# Changelog

## 2026-07-13

### Panel de administración
- Nueva ruta `/admin` (sin autenticación, acceso abierto) con pestañas: Servicios, Sillas, Horarios y Citas.
- Botón "Panel Admin" en la esquina superior de la pantalla principal (`BookingSystem.tsx`) para entrar al panel.
- **Servicios**: crear, editar, activar/desactivar y eliminar. El identificador interno se genera automáticamente a partir del nombre (ya no se pide como campo técnico).
- **Sillas**: crear, editar, activar/desactivar y eliminar. Mismo identificador automático que Servicios.
- **Horarios especiales**: cerrar uno o varios días (vacaciones/festivos), cambiar la hora de **apertura** y de **cierre** de un día específico, y ajustar cuántas sillas hay disponibles ese día. Se puede aplicar a un rango de fechas de una sola vez (ej. botón "Toda la semana") en lugar de agregar día por día.
- **Citas**: CRUD completo — agregar citas manualmente, editar todos sus datos (cliente, servicio, silla, fecha, hora, estado, notas), y eliminarlas. Antes solo se podía cambiar el estado o eliminar.
- Se agregaron los componentes shadcn `tabs`, `table`, `dialog`, `switch` y `textarea` en `src/presentation/ui/`.

### Corrección de condición de carrera al reservar citas
- Se agregó una restricción a nivel de base de datos (`exclusion constraint` con `btree_gist` sobre `chair_id` y el rango de tiempo de la cita) que impide que dos citas ocupen la misma silla en horarios que se traslapan, sin importar cuántas peticiones concurrentes lleguen al mismo tiempo.
- `CreateAppointment.ts` ahora calcula todas las sillas libres y reintenta con la siguiente si la base de datos rechaza una por conflicto real, en vez de fallar con una sola silla candidata.
- Nuevo tipo de error `ChairConflictError` para diferenciar ese caso y devolver un mensaje claro al usuario.

### Horario de apertura configurable por día
- `day_schedules` ahora soporta también `open_hour` (antes solo permitía cambiar la hora de **cierre**).
- La pantalla principal y la validación de creación de citas (`CreateAppointment.ts`) respetan la hora de apertura de cada día, con 9 AM como valor por defecto si no hay override.

### Base de datos (Supabase)
Cambios aplicados manualmente vía el SQL Editor de Supabase (no hay migraciones versionadas en el repo):
- Creación inicial de tablas: `clients`, `chairs`, `services`, `day_schedules`, `Appointments`.
- `alter table "Appointments" add column time_range ...` + `exclusion constraint` para evitar traslape de citas por silla.
- `alter table day_schedules add column open_hour int;`
