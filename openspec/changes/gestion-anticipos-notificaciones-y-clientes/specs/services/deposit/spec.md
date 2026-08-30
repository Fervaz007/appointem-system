## Purpose

Permite configurar el valor del anticipo (depósito) requerido para cada tipo de servicio ofrecido en el estudio de belleza.

## ADDED Requirements

### Requirement: Service advance payment setting
El sistema SHALL permitir definir un monto de anticipo (ej: $100 MXN) para cada servicio registrado. Este monto representará el pago requerido para agendar el servicio en línea.

#### Scenario: Configuración de anticipo exitoso
- **WHEN** la administradora introduce un monto válido de anticipo para un servicio y guarda los cambios
- **THEN** el sistema persiste el monto asociado a ese servicio y lo expone en la interfaz pública de reserva
