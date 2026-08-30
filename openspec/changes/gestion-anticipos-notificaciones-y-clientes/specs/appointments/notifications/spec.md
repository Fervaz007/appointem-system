## Purpose

Gestiona el envío de correos electrónicos automáticos de confirmación tras confirmarse la cita y de recordatorios programados 24 horas antes del evento.

## ADDED Requirements

### Requirement: Email confirmation dispatch
El sistema SHALL enviar un correo electrónico de confirmación al cliente inmediatamente después de que su cita sea confirmada (pago verificado).

#### Scenario: Envío de correo de confirmación
- **WHEN** la cita cambia a estado "confirmada" tras el pago
- **THEN** el sistema envía un correo al cliente utilizando Resend con la fecha, hora, servicio y monto de anticipo pagado

### Requirement: Email reminder dispatch
El sistema SHALL enviar un correo electrónico de recordatorio al cliente 24 horas antes del inicio programado de la cita.

#### Scenario: Envío de recordatorio 24 horas antes
- **WHEN** falten exactamente 24 horas para la cita confirmada del cliente
- **THEN** el sistema envía un correo de recordatorio para reducir el índice de inasistencias
