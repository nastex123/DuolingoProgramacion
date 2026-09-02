# ADR-003: Pipeline de Certificación en Backend y Storage en Google Drive API v3

> **Estado:** Aprobado  
> **Fecha:** 2026-09-02  
> **Autores:** Equipo de Arquitectura Koda  
> **Trazabilidad:** `17_CERTIFICATION.md`, `11_SYSTEM_ARCHITECTURE.md`, `RF-CERT-001–006`, `RF-PDF-001–004`  

---

## 1. Contexto y Problema
El sistema de certificación emite certificados de finalización acreditando que el estudiante aprobó con $\ge 80\%$ todos los módulos y exámenes de un lenguaje. El diseño anterior evaluaba almacenamiento en buckets S3/MinIO. Sin embargo, se requiere una solución de almacenamiento cloud sin costo de egress recurrente para el MVP, con alta disponibilidad, control de acceso mediante Cuenta de Servicio (*Service Account*) y organización jerárquica por carpetas. Además, la generación de PDFs en cliente presentaba vulnerabilidades de falsificación en el DOM.

## 2. Alternativas Evaluadas
1. **Generación en cliente (HTML5 Canvas / jsPDF):**
   - *Desventajas:* Crítico riesgo de seguridad y falsificación; el usuario puede manipular el DOM o inyectar notas y nombres arbitrarios. Cero validez criptográfica.
2. **Object Storage estándar (AWS S3 / Cloudflare R2):**
   - *Ventajas:* Estándar de la industria.
   - *Desventajas:* Costos de configuración de tarjetas en AWS y complejidad innecesaria para la escala de arranque del MVP.
3. **Generación 100% Backend en NestJS + Google Drive API v3:**
   - *Ventajas:* Generación aislada y segura en Node.js, código QR ISO 18004 verificable, firma SHA-256 del binario, autenticación robusta mediante Service Account OAuth2 y carpetas organizadas (`CodeQuest_Certificados/{lang}/`).

## 3. Decisión Adoptada
Se adopta **Generación 100% Backend con NestJS (`CertificationModule`) y persistencia en Google Drive API v3**:
- El cliente nunca genera PDFs ni tiene acceso a credenciales de almacenamiento.
- Se genera un código único `CQ-{LANG}-{SEQ6}` (ej. `CQ-LUA-000001`) y un QR apuntando a `/verificar/{code}`.
- **Caché y deduplicación estricta:** Antes de generar un nuevo binario, el backend consulta `google_drive_file_id` y `pdf_sha256`. Si el usuario ya cuenta con un certificado emitido válido, no se vuelve a crear; se entrega el stream existente de inmediato ($< 200\text{ ms}$).
- Descarga segura mediante streaming autenticado en `GET /api/v1/certificates/{id}/pdf`.

## 4. Consecuencias
- **Positivas:**
  - Imposibilidad de manipulación de notas o nombres por parte del cliente.
  - Almacenamiento seguro, respaldado y con costo cero en el tier inicial del MVP.
- **Trade-offs:**
  - Requiere provisionar y gestionar un archivo de credenciales de Service Account en `GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY`.
