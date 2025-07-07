import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-instructivos",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="instructivos-container">
      <div class="instructivos-section">
        <h2>Instructivos para Trámites Catastrales</h2>
        
        <div class="instructivo-grid">
          <div class="instructivo-card">
            <h3>📋 Inscripción Primera Vez</h3>
            <div class="instructivo-content">
              <h4>Documentos Requeridos:</h4>
              <ul>
                <li>Escritura pública de compraventa</li>
                <li>Cédula de ciudadanía del propietario</li>
                <li>Certificado de libertad y tradición</li>
                <li>Plano topográfico del predio</li>
                <li>Paz y salvo de impuesto predial</li>
              </ul>
              <h4>Proceso:</h4>
              <ol>
                <li>Diligenciar formulario en línea</li>
                <li>Adjuntar documentos digitalizados</li>
                <li>Pagar derechos catastrales</li>
                <li>Esperar visita técnica (5-10 días hábiles)</li>
                <li>Recibir resolución catastral</li>
              </ol>
              <p><strong>Tiempo estimado:</strong> 15-20 días hábiles</p>
              <p><strong>Costo:</strong> 2-3 SMMLV según área del predio</p>
            </div>
          </div>

          <div class="instructivo-card">
            <h3>🔄 Mutación Primera Categoría</h3>
            <div class="instructivo-content">
              <h4>Documentos Requeridos:</h4>
              <ul>
                <li>Escritura pública que origina la mutación</li>
                <li>Cédula del nuevo propietario</li>
                <li>Certificado catastral vigente</li>
                <li>Paz y salvo de impuesto predial</li>
              </ul>
              <h4>Proceso:</h4>
              <ol>
                <li>Presentar solicitud con documentos</li>
                <li>Revisión jurídica (3-5 días)</li>
                <li>Actualización en base de datos</li>
                <li>Expedición de nuevo certificado</li>
              </ol>
              <p><strong>Tiempo estimado:</strong> 8-12 días hábiles</p>
              <p><strong>Costo:</strong> 0.5-1 SMMLV</p>
            </div>
          </div>

          <div class="instructivo-card">
            <h3>📐 Desenglobe</h3>
            <div class="instructivo-content">
              <h4>Documentos Requeridos:</h4>
              <ul>
                <li>Solicitud de desenglobe</li>
                <li>Plano de desenglobe aprobado</li>
                <li>Escritura del predio matriz</li>
                <li>Licencia de parcelación (si aplica)</li>
                <li>Estudio de títulos</li>
              </ul>
              <h4>Proceso:</h4>
              <ol>
                <li>Presentar documentos técnicos</li>
                <li>Revisión técnica y jurídica</li>
                <li>Visita de campo obligatoria</li>
                <li>Aprobación y registro</li>
                <li>Expedición de nuevos folios</li>
              </ol>
              <p><strong>Tiempo estimado:</strong> 20-30 días hábiles</p>
              <p><strong>Costo:</strong> 3-5 SMMLV por lote resultante</p>
            </div>
          </div>

          <div class="instructivo-card">
            <h3>🔗 Englobe</h3>
            <div class="instructivo-content">
              <h4>Documentos Requeridos:</h4>
              <ul>
                <li>Escrituras de todos los predios</li>
                <li>Certificados catastrales vigentes</li>
                <li>Plano de englobe</li>
                <li>Paz y salvo de todos los predios</li>
              </ul>
              <h4>Proceso:</h4>
              <ol>
                <li>Verificar titularidad única</li>
                <li>Revisión técnica de linderos</li>
                <li>Unificación catastral</li>
                <li>Expedición de nuevo folio</li>
              </ol>
              <p><strong>Tiempo estimado:</strong> 15-20 días hábiles</p>
              <p><strong>Costo:</strong> 1-2 SMMLV</p>
            </div>
          </div>

          <div class="instructivo-card">
            <h3>🏗️ Actualización de Construcciones</h3>
            <div class="instructivo-content">
              <h4>Documentos Requeridos:</h4>
              <ul>
                <li>Licencia de construcción</li>
                <li>Planos arquitectónicos</li>
                <li>Acta de terminación de obra</li>
                <li>Fotografías de la construcción</li>
              </ul>
              <h4>Proceso:</h4>
              <ol>
                <li>Solicitar visita técnica</li>
                <li>Levantamiento arquitectónico</li>
                <li>Cálculo de áreas y avalúo</li>
                <li>Actualización en sistema</li>
              </ol>
              <p><strong>Tiempo estimado:</strong> 10-15 días hábiles</p>
              <p><strong>Costo:</strong> 1-2 SMMLV</p>
            </div>
          </div>

          <div class="instructivo-card">
            <h3>📏 Corrección de Cabida y Linderos</h3>
            <div class="instructivo-content">
              <h4>Documentos Requeridos:</h4>
              <ul>
                <li>Levantamiento topográfico actualizado</li>
                <li>Escritura del predio</li>
                <li>Certificado de colindantes</li>
                <li>Justificación técnica de la corrección</li>
              </ul>
              <h4>Proceso:</h4>
              <ol>
                <li>Análisis técnico de diferencias</li>
                <li>Verificación en campo</li>
                <li>Notificación a colindantes</li>
                <li>Resolución de corrección</li>
              </ol>
              <p><strong>Tiempo estimado:</strong> 25-30 días hábiles</p>
              <p><strong>Costo:</strong> 2-4 SMMLV</p>
            </div>
          </div>
        </div>

        <div class="info-adicional">
          <h3>ℹ️ Información Adicional</h3>
          <div class="info-grid">
            <div class="info-item">
              <h4>Horarios de Atención</h4>
              <p>Lunes a Viernes: 8:00 AM - 5:00 PM</p>
              <p>Sábados: 9:00 AM - 1:00 PM</p>
            </div>
            <div class="info-item">
              <h4>Contacto</h4>
              <p>📞 Teléfono: +57 (601) 881-7890</p>
              <p>📧 Email: catastro&#64;tausa-cundinamarca.gov.co</p>
            </div>
            <div class="info-item">
              <h4>Ubicación</h4>
              <p>📍 Calle 41 B Sur, Tausa, Cundinamarca</p>
              <p>Oficina de Catastro Municipal</p>
            </div>
          </div>
        </div>

        <div class="notas-importantes">
          <h3>⚠️ Notas Importantes</h3>
          <ul>
            <li>Todos los documentos deben estar vigentes (máximo 30 días)</li>
            <li>Las copias deben estar autenticadas</li>
            <li>Los planos deben estar firmados por profesional competente</li>
            <li>Los pagos se realizan en la Tesorería Municipal</li>
            <li>Para trámites urgentes, consultar disponibilidad</li>
            <li>Se requiere cita previa para algunos trámites</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./instructivos.component.css"],
})
export class InstructivosComponent {}
