## 1. Actualización de Base de Datos y Modelos de Dominio

- [x] 1.1 Agregar columna `deposit_amount` (numérico, default 0) a la tabla `services` en Supabase y verificar su presencia con una consulta select
- [x] 1.2 Actualizar la interfaz de dominio `Service` en `src/domain/entities/Service.ts` para incluir `depositAmount?: number` y verificar que el tipado compile sin errores
- [x] 1.3 Modificar `SupabaseServiceRepository.ts` para mapear `deposit_amount` de la base de datos hacia `depositAmount` y viceversa, verificando mediante pruebas locales del CRUD de servicios
- [x] 1.4 Agregar el estado `"pago_pendiente"` a `AppointmentStatus` en `src/domain/entities/Appointment.ts` y validar que el compilador no reporte errores en repositorios existentes

## 2. Flujo de Reserva Temporal y Webhooks de Pago

- [x] 2.1 Modificar `BookingSystem.tsx` para insertar la cita con estado `"pago_pendiente"` al iniciar el checkout, verificando la inserción de registros temporales en Supabase
- [x] 2.2 Crear el endpoint API en `/api/webhooks/payment` para cambiar el estado de la cita a `"confirmada"` al recibir un mock exitoso de pago y verificar enviando una petición POST con Postman/cURL
- [x] 2.3 Implementar lógica de expiración de pre-reservas (ej: liberar citas `"pago_pendiente"` creadas hace más de 15 minutos) y verificar mediante un script de prueba local o Edge Function en Supabase

## 3. Integración de Notificaciones (Resend)

- [x] 3.1 Instalar la librería `resend` en `package.json` y verificar que esté agregada a `node_modules` tras correr `npm install`
- [x] 3.2 Crear una utilidad en `src/lib/notifications.ts` para despachar correos usando Resend y verificar mediante el envío de un correo de prueba a una cuenta personal
- [x] 3.3 Integrar el envío del correo de confirmación dentro del webhook de pago verificado y verificar visualizando la llegada del email al completar la simulación de pago
- [x] 3.4 Configurar el programador/cron para buscar y despachar el email de recordatorio 24 horas antes de cada cita confirmada, verificando que los correos de prueba se encolen correctamente

## 4. Interfaz de Administración e Historial de Clientes

- [x] 4.1 Modificar `ServicesAdmin.tsx` para agregar la entrada del campo "Anticipo" en el formulario de creación/edición de servicios y verificar que se guarde correctamente en Supabase
- [x] 4.2 Crear una consulta en Supabase/repositorios para agrupar citas y consolidar perfiles de clientes únicos por email, verificando que retorne la agregación correcta sin duplicar emails
- [x] 4.3 Crear el componente `ClientsAdmin.tsx` con una lista de clientes y buscador, y verificar que renderice la lista de forma responsiva en el panel de administrador
- [x] 4.4 Agregar la pestaña "Clientes" en `AdminDashboard.tsx`, conectar el componente `ClientsAdmin.tsx`, y verificar que al hacer clic en un cliente se muestre su historial de citas y notas de servicio
