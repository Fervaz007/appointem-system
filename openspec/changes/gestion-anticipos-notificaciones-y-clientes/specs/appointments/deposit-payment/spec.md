## Purpose

Administra el flujo de confirmación de citas mediante el pago previo de un anticipo monetario y su validación mediante webhooks de la pasarela de pagos.

## ADDED Requirements

### Requirement: Appointment pre-reservation
El sistema SHALL crear la cita en estado "pendiente" (o "pago_pendiente") y reservar el espacio del calendario temporalmente mientras el cliente realiza el pago.

#### Scenario: Creación de pre-reserva al pagar
- **WHEN** el cliente selecciona una hora disponible e inicia el flujo de pago
- **THEN** el sistema guarda la cita con estado "pago_pendiente" y bloquea ese espacio para evitar doble reserva durante 15 minutos

### Requirement: Confirmation via payment webhook
El sistema SHALL procesar el evento webhook de la pasarela de pagos para confirmar y completar el proceso de la cita.

#### Scenario: Pago exitoso recibido
- **WHEN** la pasarela de pagos notifica un pago exitoso asociado a la cita
- **THEN** el sistema cambia el estado de la cita a "confirmada"

### Requirement: Auto-release unpaid pre-reservations
El sistema SHALL liberar las citas en estado "pago_pendiente" que no hayan sido pagadas tras 15 minutos.

#### Scenario: Expiración de pre-reserva no pagada
- **WHEN** pasan más de 15 minutos sin confirmación de pago para una cita "pago_pendiente"
- **THEN** el sistema elimina o cancela la cita y libera el espacio del calendario
