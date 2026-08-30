## Purpose

Agrupa el historial de visitas, datos de contacto y notas técnicas de cada cliente en un perfil unificado dentro del panel de administrador para el seguimiento personalizado del salón.

## ADDED Requirements

### Requirement: Client profile consolidation
El sistema SHALL identificar automáticamente a los clientes por su correo electrónico y teléfono para consolidar sus registros de citas en un perfil único.

#### Scenario: Consolidación automática por email
- **WHEN** un cliente genera una nueva cita usando un correo existente en la base de datos
- **THEN** el sistema asocia la nueva cita al perfil existente del cliente en lugar de crear un cliente duplicado

### Requirement: Client history display in Admin
El sistema SHALL mostrar una lista de clientes en el panel de administrador y permitir ver el desglose de sus citas previas y notas.

#### Scenario: Visualización del historial en el panel
- **WHEN** la administradora ingresa a la pestaña "Clientes" y selecciona un cliente específico
- **THEN** el sistema despliega todas las citas (pasadas y futuras), estados de pago, y las notas técnicas asociadas a sus servicios anteriores
