## Context

Ver `proposal.md` para la motivación general del cambio.
El sistema actual cuenta con un esquema de base de datos en Supabase y una arquitectura limpia en Next.js (con rutas de API en `src/app/api`). Las citas se guardan directamente con los datos básicos del cliente (nombre, apellido, teléfono, email) embebidos en el objeto de dominio `Appointment`.

## Goals / Non-Goals

**Goals:**
* Actualizar el esquema de base de datos de Supabase y las interfaces locales del repositorio para incluir el campo `deposit_amount`.
* Implementar un flujo transaccional donde las citas nuevas inicien en estado `"pago_pendiente"`.
* Crear una ruta API de webhook para simular/recibir notificaciones de pago exitosas.
* Configurar la integración con Resend para el envío automático de confirmaciones y recordatorios por email.
* Agregar una pestaña de "Clientes" en `/admin` que liste a los clientes consolidados por email y permita ver su historial completo de visitas.

**Non-Goals:**
* Implementar autenticación o login para los clientes (las reservas siguen siendo públicas).
* Integrar sistemas complejos de contabilidad o facturación.

## Decisions

### 1. Consolidación de Clientes por Email
* **Decisión:** En lugar de tener una tabla `clients` pesada con CRUD independiente, cada vez que se guarda una cita, se buscará en Supabase si ya existe un registro en una vista o tabla de `clients` por `email`. Si existe, se asociará al mismo identificador; si no, se registrará un nuevo cliente. Esto evita que la estilista tenga registros duplicados.
* **Alternativa considerada:** Crear un flujo de registro obligatorio para el cliente. Descartado porque rompe el requerimiento de agendar de forma simple y sin login.

### 2. Manejo de Reserva Temporal (Pre-reserva de 15 minutos)
* **Decisión:** Al iniciar la reserva, la cita se inserta en Supabase con `status = 'pendiente'` y se almacena la marca de tiempo `created_at`. Un script recurrente o una consulta filtrará las citas que tengan más de 15 minutos en estado `'pendiente'` sin confirmación de pago para no mostrarlas como ocupadas.
* **Alternativa considerada:** Mantener las reservas solo en memoria/sesión del cliente. Descartado porque otro cliente podría tomar el espacio durante el checkout.

### 3. Servicio de Correo: Resend
* **Decisión:** Usar el SDK de Resend por su facilidad de integración en Next.js App Router mediante API Routes. Las credenciales se configurarán en `.env.local` (`RESEND_API_KEY`).
* **Alternativa considerada:** SendGrid o Nodemailer SMTP básico. Resend ofrece una mejor capa gratuita y soporte nativo para componentes React Email.

## Risks / Trade-offs

* **[Riesgo] El webhook de pago tarda en llegar y expira la reserva**
  * *Mitigación:* Si llega un webhook de pago para una cita expirada/cancelada, el sistema la restaurará automáticamente a "confirmada" enviando una alerta a la administradora.
* **[Riesgo] Correos enviados van a la carpeta de Spam**
  * *Mitigación:* Se configurará el dominio SPF/DKIM en la cuenta de Resend de Vanessa Gonzalez Studio para garantizar la entregabilidad.
