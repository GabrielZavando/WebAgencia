# Contrato de Datos JSONB - Estándar de Ecosistema

## 1. Propósito

Establecer una estructura de datos inmutable para el transporte de identidades digitales desde la frontera (Imán) hacia el núcleo de procesamiento (Pulso). Este contrato asegura la integridad de la atribución de marketing y la extensibilidad de los formularios según la importancia de cada campo.

## 2. Estructura Global del Payload

Cada registro debe seguir este esquema, dividiendo la información por su peso en el proceso de conversión.

```json
{
  "metadata": {
    "event_id": "UUID-v4",
    "timestamp": "ISO-8601",
    "form_id": "string",
    "version": "1.1"
  },
  "attribution": {
    "utm_source": "string",
    "utm_campaign": "string",
    "utm_content": "string",
    "utm_medium": "string",
    "utm_term": "string",
    "landing_url": "url_completa"
  },
  "payload": {
    "identity_critical": {
      "email": "string",
      "full_name": "string"
    },
    "profile_optional": {
      "job_title": "string",
      "company": "string",
      "phone": "string",
      "address": "string",
      "industry_sector": "string"
    },
    "custom_fields": {
      "otros_datos_variables": "any"
    }
  }
}
```

## 3. Diccionario de Campos y Reglas de Negocio

### 3.1. Bloque: Atribución (Crítico)

- **utm_source** (Canal): Origen del tráfico (ej. Google, Meta, LinkedIn). Obligatorio para reportes de ROI.
- **utm_campaign** (Campaña): Nombre de la campaña específica (ej. transformacion_pyme_2024).
- **utm_content** (Publicación/Anuncio): Identificador del anuncio o post específico. Permite saber qué arte o copy convirtió.

### 3.2. Bloque: Identidad (Crítico)

- **email**: Identificador único. Validación estricta, lowercase y trim.
- **full_name**: Nombre completo para personalización de comunicaciones.

### 3.3. Bloque: Perfil y Contacto (Opcional)

Datos capturados en formularios extendidos o integraciones de Lead Ads.

- **job_title / company** (Perfil Pro): Cargo y empresa para segmentación B2B.
- **phone / address** (Contacto): Información para contacto directo o geolocalización.
- **industry_sector** (Contexto): Sector industrial (Select) para asignar el lead a un flujo especializado.

## 4. Reglas de Validación y Calidad

- **Prioridad de Rechazo**: Si falta cualquier campo del bloque identity_critical o los campos utm_source/utm_campaign, el registro no debe ingresar al flujo de Pulso.
- **Normalización de Atribución**: Si utm_source es nulo, el sistema debe autodefinirlo como "organic" o "direct".
- **Sanitización**: Limpieza automática de etiquetas HTML en todos los campos string para evitar XSS.
- **Preservación de Tipos**: Los campos opcionales no presentes deben viajar como null, no como string vacío "".

## 5. Resumen de Importancia para el Negocio

| Categoría | Importancia | Acción de Sistema |
|-----------|-------------|-------------------|
| Identidad & Atribución | Crítico | Bloqueante (Sin estos datos no hay Lead). |
| Perfil, Contacto & Contexto | Opcional | Enriquecimiento (Mejora la conversión en Pulso). |
