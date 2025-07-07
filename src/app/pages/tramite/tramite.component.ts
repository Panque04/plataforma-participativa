import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { SupabaseService } from "../../services/supabase.service"

/**
 * Componente de Trámites Catastrales
 * Maneja las mutaciones catastrales según la clasificación legal colombiana
 */
@Component({
  selector: "app-tramite",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="container mt-5">
      <!-- ============================================================================ -->
      <!-- MIS TRÁMITES -->
      <!-- ============================================================================ -->
      <section class="mis-tramites-section mb-5" *ngIf="misTramites.length > 0">
        <h2 class="text-center text-primary mb-4">📋 Mis Trámites</h2>
        <div class="tramites-grid">
          <div class="tramite-card" *ngFor="let tramite of misTramites">
            <div class="tramite-header">
              <h4>{{ getTramiteTitle(tramite.tipo_tramite) }}</h4>
              <span class="estado-badge" [class]="'estado-' + tramite.estado">
                {{ getEstadoLabel(tramite.estado) }}
              </span>
            </div>
            <div class="tramite-body">
              <p><strong>📅 Fecha:</strong> {{ tramite.fecha_solicitud | date:'short' }}</p>
              <p><strong>🆔 Cédula:</strong> {{ tramite.cedula_usuario }}</p>
              <p *ngIf="tramite.municipio"><strong>🏛️ Municipio:</strong> {{ tramite.municipio }}</p>
              <p *ngIf="tramite.vereda"><strong>🌾 Vereda:</strong> {{ tramite.vereda }}</p>
              <p *ngIf="tramite.numero_predial"><strong>🏠 Predio:</strong> {{ tramite.numero_predial }}</p>
              <p *ngIf="tramite.numero_parcelas"><strong>📊 Parcelas:</strong> {{ tramite.numero_parcelas }}</p>
              <p *ngIf="tramite.area_total"><strong>📐 Área:</strong> {{ tramite.area_total }} m²</p>
              <p *ngIf="tramite.observaciones"><strong>📝 Observaciones:</strong> {{ tramite.observaciones }}</p>
              <div *ngIf="tramite.observaciones_admin" class="admin-response">
                <p><strong>💬 Respuesta del Administrador:</strong></p>
                <p class="admin-message">{{ tramite.observaciones_admin }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================================ -->
      <!-- INSTRUCTIVOS DE MUTACIONES CATASTRALES -->
      <!-- ============================================================================ -->
      <section class="instructivos-section mb-5">
        <h2 class="text-center text-primary mb-4">📚 Mutaciones Catastrales</h2>
        <p class="text-center mb-4">
          Las mutaciones catastrales son los cambios que se presentan en los predios y que deben ser registrados 
          en el catastro para mantener la información actualizada.
        </p>
        
        <div class="instructivos-grid">
          <!-- MUTACIÓN DE PRIMERA CLASE -->
          <div class="instructivo-card">
            <div class="instructivo-header primera-clase" (click)="toggleInstructivo('primera_clase')">
              <h3>🔄 Mutación de Primera Clase</h3>
              <span class="toggle-icon">{{ showInstructivos.primera_clase ? '▼' : '▶' }}</span>
            </div>
            <div class="instructivo-content" [class.show]="showInstructivos.primera_clase">
              <div class="definicion-section">
                <h4>📖 Definición:</h4>
                <p>Cambios respecto del propietario o poseedor del predio.</p>
              </div>
              <div class="documentos-section">
                <h4>📋 Documentos Requeridos:</h4>
                <ul>
                  <li>Escritura pública de compraventa, donación o adjudicación</li>
                  <li>Cédula de ciudadanía del nuevo propietario</li>
                  <li>Certificado de libertad y tradición actualizado</li>
                  <li>Paz y salvo de impuesto predial</li>
                  <li>Certificado catastral vigente</li>
                </ul>
              </div>
              <div class="proceso-section">
                <h4>⚙️ Proceso:</h4>
                <ol>
                  <li>Presentar solicitud con documentos</li>
                  <li>Revisión jurídica de títulos (3-5 días)</li>
                  <li>Verificación de linderos si es necesario</li>
                  <li>Actualización en base de datos catastral</li>
                  <li>Expedición de nuevo certificado catastral</li>
                </ol>
              </div>
              <div class="info-section">
                <p><strong>⏱️ Tiempo estimado:</strong> 8-15 días hábiles</p>
                <p><strong>💰 Costo:</strong> 0.5-1 SMMLV</p>
              </div>
            </div>
          </div>

          <!-- MUTACIÓN DE SEGUNDA CLASE -->
          <div class="instructivo-card">
            <div class="instructivo-header segunda-clase" (click)="toggleInstructivo('segunda_clase')">
              <h3>📐 Mutación de Segunda Clase</h3>
              <span class="toggle-icon">{{ showInstructivos.segunda_clase ? '▼' : '▶' }}</span>
            </div>
            <div class="instructivo-content" [class.show]="showInstructivos.segunda_clase">
              <div class="definicion-section">
                <h4>📖 Definición:</h4>
                <p>Cambios en los linderos de los predios por agregación o segregación, con o sin cambio de propietario.</p>
              </div>
              <div class="documentos-section">
                <h4>📋 Documentos Requeridos:</h4>
                <ul>
                  <li>Plano topográfico aprobado por profesional competente</li>
                  <li>Escritura pública de segregación/agregación</li>
                  <li>Certificados catastrales de predios involucrados</li>
                  <li>Licencia de parcelación (si aplica)</li>
                  <li>Estudio de títulos</li>
                </ul>
              </div>
              <div class="proceso-section">
                <h4>⚙️ Proceso:</h4>
                <ol>
                  <li>Revisión técnica del plano topográfico</li>
                  <li>Verificación de linderos en campo</li>
                  <li>Validación jurídica de la operación</li>
                  <li>Cálculo de nuevas áreas y avalúos</li>
                  <li>Expedición de certificados actualizados</li>
                </ol>
              </div>
              <div class="info-section">
                <p><strong>⏱️ Tiempo estimado:</strong> 20-30 días hábiles</p>
                <p><strong>💰 Costo:</strong> 1-3 SMMLV según complejidad</p>
              </div>
            </div>
          </div>

          <!-- MUTACIÓN DE TERCERA CLASE -->
          <div class="instructivo-card">
            <div class="instructivo-header tercera-clase" (click)="toggleInstructivo('tercera_clase')">
              <h3>🏗️ Mutación de Tercera Clase</h3>
              <span class="toggle-icon">{{ showInstructivos.tercera_clase ? '▼' : '▶' }}</span>
            </div>
            <div class="instructivo-content" [class.show]="showInstructivos.tercera_clase">
              <div class="definicion-section">
                <h4>📖 Definición:</h4>
                <p>Cambios por nuevas edificaciones, construcciones o demoliciones en el predio.</p>
              </div>
              <div class="documentos-section">
                <h4>📋 Documentos Requeridos:</h4>
                <ul>
                  <li>Licencia de construcción aprobada</li>
                  <li>Planos arquitectónicos y estructurales</li>
                  <li>Acta de finalización de obra</li>
                  <li>Certificado de habitabilidad (si aplica)</li>
                  <li>Fotografías de la construcción</li>
                </ul>
              </div>
              <div class="proceso-section">
                <h4>⚙️ Proceso:</h4>
                <ol>
                  <li>Inspección técnica de la construcción</li>
                  <li>Verificación de licencias y permisos</li>
                  <li>Medición y cálculo de áreas construidas</li>
                  <li>Actualización del avalúo catastral</li>
                  <li>Expedición de certificado actualizado</li>
                </ol>
              </div>
              <div class="info-section">
                <p><strong>⏱️ Tiempo estimado:</strong> 15-20 días hábiles</p>
                <p><strong>💰 Costo:</strong> 0.8-1.5 SMMLV</p>
              </div>
            </div>
          </div>

          <!-- MUTACIÓN DE CUARTA CLASE -->
          <div class="instructivo-card">
            <div class="instructivo-header cuarta-clase" (click)="toggleInstructivo('cuarta_clase')">
              <h3>💰 Mutación de Cuarta Clase</h3>
              <span class="toggle-icon">{{ showInstructivos.cuarta_clase ? '▼' : '▶' }}</span>
            </div>
            <div class="instructivo-content" [class.show]="showInstructivos.cuarta_clase">
              <div class="definicion-section">
                <h4>📖 Definición:</h4>
                <p>Cambios en los avalúos catastrales por renovación del aspecto económico, reajustes anuales o autoestimaciones aceptadas.</p>
              </div>
              <div class="documentos-section">
                <h4>📋 Documentos Requeridos:</h4>
                <ul>
                  <li>Solicitud de actualización de avalúo</li>
                  <li>Avalúo comercial actualizado</li>
                  <li>Certificado catastral vigente</li>
                  <li>Justificación técnica del cambio</li>
                  <li>Documentos soporte del valor comercial</li>
                </ul>
              </div>
              <div class="proceso-section">
                <h4>⚙️ Proceso:</h4>
                <ol>
                  <li>Revisión del avalúo comercial presentado</li>
                  <li>Verificación de metodología aplicada</li>
                  <li>Comparación con valores de zona</li>
                  <li>Aprobación o ajuste del nuevo avalúo</li>
                  <li>Actualización en sistema catastral</li>
                </ol>
              </div>
              <div class="info-section">
                <p><strong>⏱️ Tiempo estimado:</strong> 10-15 días hábiles</p>
                <p><strong>💰 Costo:</strong> 0.3-0.8 SMMLV</p>
              </div>
            </div>
          </div>

          <!-- MUTACIÓN DE QUINTA CLASE -->
          <div class="instructivo-card">
            <div class="instructivo-header quinta-clase" (click)="toggleInstructivo('quinta_clase')">
              <h3>📝 Mutación de Quinta Clase</h3>
              <span class="toggle-icon">{{ showInstructivos.quinta_clase ? '▼' : '▶' }}</span>
            </div>
            <div class="instructivo-content" [class.show]="showInstructivos.quinta_clase">
              <div class="definicion-section">
                <h4>📖 Definición:</h4>
                <p>Inscripción de predios o mejoras no declarados u omitidos durante la formación catastral.</p>
              </div>
              <div class="documentos-section">
                <h4>📋 Documentos Requeridos:</h4>
                <ul>
                  <li>Escritura pública del predio</li>
                  <li>Certificado de libertad y tradición</li>
                  <li>Plano topográfico del predio</li>
                  <li>Declaración juramentada de no inclusión</li>
                  <li>Paz y salvo de impuesto predial (si existe)</li>
                </ul>
              </div>
              <div class="proceso-section">
                <h4>⚙️ Proceso:</h4>
                <ol>
                  <li>Verificación de no inclusión en catastro</li>
                  <li>Validación jurídica de títulos</li>
                  <li>Levantamiento topográfico</li>
                  <li>Asignación de código catastral</li>
                  <li>Incorporación al sistema catastral</li>
                </ol>
              </div>
              <div class="info-section">
                <p><strong>⏱️ Tiempo estimado:</strong> 25-35 días hábiles</p>
                <p><strong>💰 Costo:</strong> 2-4 SMMLV según área</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================================ -->
      <!-- FORMULARIO DE SOLICITUD DE TRÁMITE -->
      <!-- ============================================================================ -->
      <section id="tramite" class="bg-light p-4 rounded shadow-sm">
        <h2 class="text-center text-primary mb-4">📝 Solicitar Mutación Catastral</h2>
        
        <form [formGroup]="tramiteForm" (ngSubmit)="onSubmit()" class="needs-validation">
          <div class="row">
            <!-- DATOS DEL SOLICITANTE -->
            <div class="col-md-6">
              <div class="mb-3">
                <label for="cedula" class="form-label">Cédula:</label>
                <input 
                  type="text" 
                  id="cedula" 
                  class="form-control" 
                  formControlName="cedula"
                  placeholder="Ingrese su cédula" 
                  readonly>
              </div>

              <div class="mb-3">
                <label for="nombres" class="form-label">Nombres y Apellidos:</label>
                <input 
                  type="text" 
                  id="nombres" 
                  class="form-control" 
                  formControlName="nombres"
                  placeholder="Nombres y apellidos" 
                  readonly>
              </div>

              <div class="mb-3">
                <label for="telefono" class="form-label">Teléfono:</label>
                <input 
                  type="tel" 
                  id="telefono" 
                  class="form-control" 
                  formControlName="telefono"
                  placeholder="Ingrese su teléfono">
              </div>

              <div class="mb-3">
                <label for="correo" class="form-label">Correo Electrónico:</label>
                <input 
                  type="email" 
                  id="correo" 
                  class="form-control" 
                  formControlName="correo"
                  placeholder="Correo electrónico" 
                  readonly>
              </div>
            </div>

            <!-- DATOS DEL TRÁMITE Y UBICACIÓN -->
            <div class="col-md-6">
              <div class="mb-3">
                <label for="municipio" class="form-label">Municipio:</label>
                <input 
                  type="text" 
                  id="municipio" 
                  class="form-control" 
                  formControlName="municipio"
                  value="Tausa"
                  readonly>
              </div>

              <div class="mb-3">
                <label for="vereda" class="form-label">Vereda:</label>
                <select 
                  id="vereda" 
                  class="form-select" 
                  formControlName="vereda">
                  <option value="">Seleccione la vereda</option>
                  <option *ngFor="let vereda of veredasTausa" [value]="vereda">{{ vereda }}</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="tipo-tramite" class="form-label">Tipo de Mutación Catastral:</label>
                <select 
                  id="tipo-tramite" 
                  class="form-select" 
                  formControlName="tipoTramite"
                  (change)="onTipoTramiteChange()">
                  <option value="">Seleccione el tipo de mutación</option>
                  <option value="mutacion_primera_clase">Mutación de Primera Clase - Cambio de propietario</option>
                  <option value="mutacion_segunda_clase">Mutación de Segunda Clase - Cambios en linderos</option>
                  <option value="mutacion_tercera_clase">Mutación de Tercera Clase - Construcciones/demoliciones</option>
                  <option value="mutacion_cuarta_clase">Mutación de Cuarta Clase - Actualización de avalúos</option>
                  <option value="mutacion_quinta_clase">Mutación de Quinta Clase - Inscripción de predios omitidos</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="numero-predial" class="form-label">Número Predial Nacional:</label>
                <input 
                  type="text" 
                  id="numero-predial" 
                  class="form-control" 
                  formControlName="numeroPredial"
                  placeholder="Ej: 25754000000010001000000000">
              </div>
            </div>
          </div>

          <!-- CAMPOS ADICIONALES DINÁMICOS -->
          <div id="campos-adicionales" class="mb-3" *ngIf="mostrarCamposAdicionales">
            <div class="row">
              <!-- Para mutaciones de segunda clase (cambios en linderos) -->
              <div class="col-md-6" *ngIf="tipoTramiteSeleccionado === 'mutacion_segunda_clase'">
                <label for="numero-parcelas" class="form-label">Número de Parcelas Involucradas:</label>
                <input 
                  type="number" 
                  id="numero-parcelas" 
                  class="form-control" 
                  formControlName="numeroParcelas"
                  placeholder="Cantidad de parcelas">
              </div>

              <!-- Para mutaciones de segunda y tercera clase -->
              <div class="col-md-6" *ngIf="tipoTramiteSeleccionado === 'mutacion_segunda_clase' || tipoTramiteSeleccionado === 'mutacion_tercera_clase'">
                <label for="area-total" class="form-label">Área Total (m²):</label>
                <input 
                  type="number" 
                  id="area-total" 
                  class="form-control" 
                  formControlName="areaTotal"
                  placeholder="Área en metros cuadrados">
              </div>

              <!-- Para todas las mutaciones que requieren descripción detallada -->
              <div class="col-12" *ngIf="tipoTramiteSeleccionado && tipoTramiteSeleccionado !== ''">
                <label for="descripcion-modificacion" class="form-label">Descripción Detallada de la Mutación:</label>
                <textarea 
                  id="descripcion-modificacion" 
                  class="form-control" 
                  rows="4"
                  formControlName="descripcionModificacion"
                  placeholder="Describa detalladamente la mutación catastral solicitada, incluyendo motivos y características específicas"></textarea>
              </div>
            </div>
          </div>

          <!-- OBSERVACIONES ADICIONALES -->
          <div class="mb-3">
            <label for="observaciones" class="form-label">Observaciones Adicionales:</label>
            <textarea 
              id="observaciones" 
              class="form-control" 
              rows="3"
              formControlName="observaciones"
              placeholder="Información adicional relevante para el trámite"></textarea>
          </div>

          <!-- BOTÓN DE ENVÍO -->
          <div class="text-center">
            <button type="submit" class="btn btn-primary btn-lg" [disabled]="tramiteForm.invalid || isSubmitting">
              <i class="fas fa-paper-plane"></i> 
              {{ isSubmitting ? 'Enviando trámite...' : 'Enviar Solicitud de Mutación' }}
            </button>
          </div>

          <!-- MENSAJE DE RESULTADO -->
          <div *ngIf="submitMessage" class="alert mt-4" 
               [class.alert-success]="submitSuccess" 
               [class.alert-danger]="!submitSuccess" 
               role="alert">
            {{ submitMessage }}
          </div>
        </form>
      </section>
    </main>
  `,
  styleUrls: ["./tramite.component.css"],
})
export class TramiteComponent implements OnInit {
  // ============================================================================
  // PROPIEDADES DEL COMPONENTE
  // ============================================================================

  tramiteForm: FormGroup
  mostrarCamposAdicionales = false
  tipoTramiteSeleccionado = ""
  submitMessage = ""
  submitSuccess = false
  isSubmitting = false
  misTramites: any[] = []

  // Lista de veredas de Tausa
  veredasTausa = [
    "Aposentos",
    "Barandillas",
    "Boquerón",
    "Carichana",
    "Chaguaní",
    "El Alisal",
    "El Hato",
    "El Palmar",
    "Guandoque",
    "La Fuente",
    "La Palma",
    "Las Mercedes",
    "Pueblo Viejo",
    "Quebrada Honda",
    "San Antonio",
    "San José",
    "Santa Bárbara",
    "Susacón",
    "Tibagota",
    "Zipacón",
  ]

  // Estados de los instructivos (acordeones)
  showInstructivos = {
    primera_clase: false,
    segunda_clase: false,
    tercera_clase: false,
    cuarta_clase: false,
    quinta_clase: false,
  }

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
  ) {
    this.tramiteForm = this.fb.group({
      cedula: ["", Validators.required],
      nombres: ["", Validators.required],
      telefono: ["", Validators.required],
      correo: ["", [Validators.required, Validators.email]],
      municipio: ["Tausa", Validators.required],
      vereda: ["", Validators.required],
      tipoTramite: ["", Validators.required],
      numeroPredial: ["", Validators.required],
      numeroParcelas: [""],
      areaTotal: [""],
      descripcionModificacion: [""],
      observaciones: [""],
    })
  }

  // ============================================================================
  // MÉTODOS DEL CICLO DE VIDA
  // ============================================================================

  async ngOnInit() {
    const currentUser = this.supabaseService.getCurrentUser()
    if (currentUser) {
      this.tramiteForm.patchValue({
        cedula: currentUser.cedula,
        nombres: `${currentUser.nombres} ${currentUser.apellidos}`,
        telefono: currentUser.telefono,
        correo: currentUser.email,
        municipio: "Tausa",
      })
    }

    await this.loadMisTramites()
  }

  // ============================================================================
  // MÉTODOS DE FUNCIONALIDAD
  // ============================================================================

  async loadMisTramites() {
    console.log("📋 Cargando trámites del usuario...")
    this.misTramites = await this.supabaseService.obtenerTramitesUsuario()
    console.log("✅ Trámites cargados:", this.misTramites.length)
  }

  /**
   * Alterna la visibilidad de los instructivos correctamente
   * @param tipo - Tipo de mutación catastral
   */
  toggleInstructivo(tipo: string) {
    // Si el instructivo ya está abierto, lo cerramos
    if (this.showInstructivos[tipo as keyof typeof this.showInstructivos]) {
      this.showInstructivos[tipo as keyof typeof this.showInstructivos] = false
    } else {
      // Cerrar todos los instructivos
      Object.keys(this.showInstructivos).forEach((key) => {
        this.showInstructivos[key as keyof typeof this.showInstructivos] = false
      })
      // Abrir el instructivo seleccionado
      this.showInstructivos[tipo as keyof typeof this.showInstructivos] = true
    }
  }

  getTramiteTitle(tipo: string): string {
    const titles: { [key: string]: string } = {
      mutacion_primera_clase: "🔄 Mutación de Primera Clase",
      mutacion_segunda_clase: "📐 Mutación de Segunda Clase",
      mutacion_tercera_clase: "🏗️ Mutación de Tercera Clase",
      mutacion_cuarta_clase: "💰 Mutación de Cuarta Clase",
      mutacion_quinta_clase: "📝 Mutación de Quinta Clase",
    }
    return titles[tipo] || tipo
  }

  getEstadoLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      pendiente: "⏳ Pendiente",
      atendido: "✅ Atendido",
      rechazado: "❌ Rechazado",
    }
    return labels[estado] || estado
  }

  onTipoTramiteChange() {
    this.tipoTramiteSeleccionado = this.tramiteForm.get("tipoTramite")?.value
    this.mostrarCamposAdicionales = this.tipoTramiteSeleccionado !== ""

    console.log("🔄 Tipo de trámite seleccionado:", this.tipoTramiteSeleccionado)

    this.tramiteForm.get("numeroParcelas")?.clearValidators()
    this.tramiteForm.get("areaTotal")?.clearValidators()
    this.tramiteForm.get("descripcionModificacion")?.clearValidators()

    switch (this.tipoTramiteSeleccionado) {
      case "mutacion_segunda_clase":
        this.tramiteForm.get("numeroParcelas")?.setValidators([Validators.required, Validators.min(1)])
        this.tramiteForm.get("areaTotal")?.setValidators([Validators.required, Validators.min(1)])
        this.tramiteForm.get("descripcionModificacion")?.setValidators([Validators.required])
        break

      case "mutacion_tercera_clase":
        this.tramiteForm.get("areaTotal")?.setValidators([Validators.required, Validators.min(1)])
        this.tramiteForm.get("descripcionModificacion")?.setValidators([Validators.required])
        break

      default:
        if (this.tipoTramiteSeleccionado) {
          this.tramiteForm.get("descripcionModificacion")?.setValidators([Validators.required])
        }
        break
    }

    this.tramiteForm.get("numeroParcelas")?.updateValueAndValidity()
    this.tramiteForm.get("areaTotal")?.updateValueAndValidity()
    this.tramiteForm.get("descripcionModificacion")?.updateValueAndValidity()
  }

  async onSubmit() {
    if (this.tramiteForm.valid && !this.isSubmitting) {
      this.isSubmitting = true
      this.submitMessage = ""

      console.log("📝 Enviando solicitud de trámite...")

      const formData = this.tramiteForm.value

      const tramite = {
        tipo_tramite: formData.tipoTramite,
        municipio: formData.municipio,
        vereda: formData.vereda,
        numero_predial: formData.numeroPredial,
        numero_parcelas: formData.numeroParcelas || null,
        area_total: formData.areaTotal || null,
        descripcion_modificacion: formData.descripcionModificacion || null,
        observaciones: formData.observaciones || null,
      }

      console.log("📋 Datos del trámite:", tramite)

      try {
        const result = await this.supabaseService.crearTramite(tramite)

        this.submitMessage = result.message
        this.submitSuccess = result.success

        if (result.success) {
          console.log("✅ Trámite enviado exitosamente")

          this.tramiteForm.reset()
          await this.ngOnInit()
          this.mostrarCamposAdicionales = false
          this.tipoTramiteSeleccionado = ""
        } else {
          console.error("❌ Error enviando trámite:", result.message)
        }
      } catch (error) {
        console.error("❌ Error enviando trámite:", error)
        this.submitMessage = "Error de conexión al enviar el trámite"
        this.submitSuccess = false
      } finally {
        this.isSubmitting = false
      }
    } else {
      console.warn("⚠️ Formulario inválido o ya enviando")
    }
  }
}
