## Why

Vanessa Gonzalez Studio es un negocio de belleza con una sola estilista. Para optimizar su flujo de citas, reducir las inasistencias ("no-shows") y mejorar el seguimiento de los clientes sin añadir complejidad innecesaria, se requiere:
1. Permitir definir y exigir un anticipo monetario para confirmar las citas públicas.
2. Enviar notificaciones automáticas por correo electrónico para confirmaciones y recordatorios.
3. Permitir a la administradora visualizar el historial de visitas y detalles de cada cliente desde el panel.

## What Changes

* **CRUD de Servicios**: Se agrega el campo `deposit_amount` (anticipo) a los servicios, permitiendo definir cuánto debe pagar el cliente para agendar.
* **Flujo de Pago y Confirmación**: Se introduce un estado de cita `"pago_pendiente"`. Al agendar, el espacio se pre-reserva temporalmente. Una vez recibido el webhook de la pasarela de pago, el estado cambia a `"confirmada"`.
* **Notificaciones por Email**: Se integra **Resend** para despachar correos automáticos al cliente (Confirmación al pagar y Recordatorio 24 horas antes).
* **Historial de Clientes**: Nueva vista y base de datos para perfiles de clientes que consolida su historial de citas y notas de atención de forma automática.

## Capabilities

### New Capabilities
- `services/deposit`: Capacidad de configurar un monto de anticipo requerido para cada servicio ofrecido por el salón.
- `appointments/deposit-payment`: Flujo de reserva temporal, validación de pago mediante pasarela de pagos (Stripe/MercadoPago) y cambio de estado a confirmado tras recibir el webhook.
- `appointments/notifications`: Envío automático de notificaciones por correo de confirmación de cita y recordatorios pre-cita programados.
- `clients/history`: Módulo en el panel de administración que recopila la información de contacto de los clientes y muestra un histórico detallado de todas sus citas anteriores y notas asociadas.

### Modified Capabilities
*(Ninguna)*

## Impact

* **Supabase**: Modificación de la tabla `services` (columna `deposit_amount`). Nuevas tablas para el manejo de transacciones de pago (`payments` o similar) y optimización en las consultas de clientes.
* **Backend (Next.js App Router)**: Nuevas APIs para webhooks de pago y para el envío de correos (Resend SDK).
* **Frontend**:
  * Pestaña "Clientes" en el panel `/admin`.
  * Campo de anticipo en el modal de servicios en `/admin`.
  * Integración del checkout de pago en el flujo de reserva en `/`.
