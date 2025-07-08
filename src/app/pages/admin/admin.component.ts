import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { SupabaseService, Tramite, Usuario, Sugerencia } from "../../services/supabase.service"


@Component({
  selector: "app-admin",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="admin-container">
      <div class="admin-header">
        <h2>🛠️ Panel de Administración</h2>
        <p>Gestiona trámites, usuarios y sugerencias del sistema</p>
      </div>
      <!-- Estadísticas Generales -->
      <div class="dashboard-stats">
        <div class="stat-card">
          <h3>{{ estadisticasGenerales?.usuarios?.total || 0 }}</h3>
          <small>{{ estadisticasGenerales?.usuarios?.activos || 0 }} activos</small>
        </div>
        <div class="stat-card">
          <h3>{{ estadisticasGenerales?.tramites?.total || 0 }}</h3>
          <small>{{ estadisticasGenerales?.tramites?.pendientes || 0 }} pendientes</small>
        </div>
        <div class="stat-card">
          <h3>{{ estadisticasGenerales?.sugerencias?.total || 0 }}</h3>
          <small>{{ estadisticasGenerales?.sugerencias?.pendientes || 0 }} pendientes</small>
        </div>
        <div class="stat-card">
          <h3>{{ estadisticasGenerales?.tramites?.este_mes || 0 }}</h3>
          <small>Este mes</small>
        </div>
        <button class="btn btn-secondary" (click)="actualizarMetricas()">🔄 Actualizar</button>
      </div>

      <!-- Pestañas de Navegación -->
      <div class="admin-tabs">
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'pendientes'"
          (click)="setActiveTab('pendientes')">
          ⏳ Trámites Pendientes ({{ tramitesPendientes.length }})
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'resueltos'"
          (click)="setActiveTab('resueltos')">
          ✅ Trámites Resueltos ({{ tramitesResueltos.length }})
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'usuarios'"
          (click)="setActiveTab('usuarios')">
          👥 Usuarios ({{ usuarios.length }})
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'sugerencias'"
          (click)="setActiveTab('sugerencias')">
          💡 Sugerencias ({{ sugerencias.length }})
        </button>
      </div>

      <!-- Contenido de las Pestañas -->
      <div class="admin-content">
        
        <!-- PESTAÑA: TRÁMITES PENDIENTES -->
        <div *ngIf="activeTab === 'pendientes'" class="tab-content">
          <div class="section-header">
            <h3>⏳ Trámites Pendientes</h3>
            <button class="btn btn-secondary" (click)="loadTramitesPendientes()">🔄 Actualizar</button>
          </div>

          <div *ngIf="tramitesPendientes.length === 0" class="empty-state">
            <p>✅ No hay trámites pendientes</p>
          </div>

          <div class="tramites-grid" *ngIf="tramitesPendientes.length > 0">
            <div class="tramite-card" *ngFor="let tramite of tramitesPendientes">
              <div class="tramite-header">
                <h4>{{ tramite.tipo_tramite }}</h4>
                <span class="estado-badge estado-pendiente">⏳ Pendiente</span>
              </div>
              
              <div class="tramite-details">
                <div class="detail-row">
                  <strong>👤 Usuario:</strong> 
                  {{ tramite.usuarios?.nombres }} {{ tramite.usuarios?.apellidos }}
                </div>
                <div class="detail-row">
                  <strong>📧 Email:</strong> {{ tramite.usuarios?.email }}
                </div>
                <div class="detail-row">
                  <strong>🆔 Cédula:</strong> {{ tramite.usuarios?.cedula }}
                </div>
                <div class="detail-row">
                  <strong>📅 Fecha:</strong> {{ formatDate(tramite.fecha_solicitud) }}
                </div>
                <div class="detail-row" *ngIf="tramite.municipio">
                  <strong>🏛️ Municipio:</strong> {{ tramite.municipio }}
                </div>
                <div class="detail-row" *ngIf="tramite.vereda">
                  <strong>🌾 Vereda:</strong> {{ tramite.vereda }}
                </div>
                <div class="detail-row" *ngIf="tramite.numero_parcelas">
                  <strong>📊 Parcelas:</strong> {{ tramite.numero_parcelas }}
                </div>
                <div class="detail-row" *ngIf="tramite.area_total">
                  <strong>📐 Área Total:</strong> {{ tramite.area_total }} m²
                </div>
                <div class="detail-row" *ngIf="tramite.descripcion_modificacion">
                  <strong>📝 Descripción:</strong> {{ tramite.descripcion_modificacion }}
                </div>
              </div>

              <div class="tramite-actions">
                <button class="btn btn-success" (click)="openResponseModal(tramite, 'atendido')">
                  ✅ Atender
                </button>
                <button class="btn btn-danger" (click)="openResponseModal(tramite, 'rechazado')">
                  ❌ Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- PESTAÑA: TRÁMITES RESUELTOS -->
        <div *ngIf="activeTab === 'resueltos'" class="tab-content">
          <div class="section-header">
            <h3>✅ Trámites Resueltos</h3>
            <button class="btn btn-secondary" (click)="loadTramitesResueltos()">🔄 Actualizar</button>
          </div>

          <div *ngIf="tramitesResueltos.length === 0" class="empty-state">
            <p>📋 No hay trámites resueltos</p>
          </div>

          <div class="tramites-grid" *ngIf="tramitesResueltos.length > 0">
            <div class="tramite-card" *ngFor="let tramite of tramitesResueltos">
              <div class="tramite-header">
                <h4>{{ tramite.tipo_tramite }}</h4>
                <span class="estado-badge" [class]="'estado-' + tramite.estado">
                  {{ getEstadoLabel(tramite.estado) }}
                </span>
              </div>
              
              <div class="tramite-details">
                <div class="detail-row">
                  <strong>👤 Usuario:</strong> 
                  {{ tramite.usuarios?.nombres }} {{ tramite.usuarios?.apellidos }}
                </div>
                <div class="detail-row">
                  <strong>📧 Email:</strong> {{ tramite.usuarios?.email }}
                </div>
                <div class="detail-row">
                  <strong>📅 Solicitud:</strong> {{ formatDate(tramite.fecha_solicitud) }}
                </div>
                <div class="detail-row">
                  <strong>📅 Respuesta:</strong> {{ formatDate(tramite.fecha_respuesta) }}
                </div>
                <div class="detail-row" *ngIf="tramite.observaciones_admin">
                  <strong>💬 Comentario Admin:</strong> 
                  <div class="admin-comment">{{ tramite.observaciones_admin }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PESTAÑA: USUARIOS -->
        <div *ngIf="activeTab === 'usuarios'" class="tab-content">
          <div class="section-header">
            <h3>👥 Gestión de Usuarios</h3>
            <div class="stats-summary">
              <span class="stat-item">Total: {{ usuarios.length }}</span>
              <span class="stat-item">Admins: {{ getAdminCount() }}</span>
              <button class="btn btn-secondary" (click)="loadUsuarios()">🔄 Actualizar</button>
            </div>
          </div>

          <div *ngIf="usuarios.length === 0" class="empty-state">
            <p>👥 No hay usuarios registrados</p>
          </div>

          <div class="usuarios-grid" *ngIf="usuarios.length > 0">
            <div class="usuario-card" *ngFor="let usuario of usuarios">
              <div class="usuario-header">
                <img 
                  [src]="getUserAvatar(usuario)" 
                  [alt]="usuario.nombres + ' ' + usuario.apellidos"
                  class="usuario-avatar"
                  [style.display]="'block'"
                  (error)="onImageError($event)">
                <div class="usuario-info">
                  <h4>{{ usuario.nombres }} {{ usuario.apellidos }}</h4>
                  <p>{{ usuario.email }}</p>
                </div>
                <span class="rol-badge" [class]="'rol-' + usuario.rol">
                  {{ getRoleLabel(usuario.rol) }}
                </span>
              </div>
              
              <div class="usuario-details">
                <div class="detail-row">
                  <strong>🆔 Cédula:</strong> {{ usuario.cedula }}
                </div>
                <div class="detail-row">
                  <strong>📱 Teléfono:</strong> {{ usuario.telefono || 'No especificado' }}
                </div>
                <div class="detail-row">
                  <strong>⚧ Género:</strong> {{ getGenderLabel(usuario.genero) }}
                </div>
                <div class="detail-row">
                  <strong>📅 Registro:</strong> {{ formatDate(usuario.fecha_registro) }}
                </div>
                <div class="detail-row">
                  <strong>✅ Verificado:</strong> {{ usuario.email_verificado ? 'Sí' : 'No' }}
                </div>
              </div>

              <div class="usuario-actions" *ngIf="!isCurrentUser(usuario.id)">
                <button 
                  class="btn btn-primary" 
                  (click)="cambiarRolUsuario(usuario)"
                  [disabled]="isChangingRole">
                  {{ usuario.rol === 'administrador' ? '👤 Hacer Usuario' : '👑 Hacer Admin' }}
                </button>
              </div>
              
              <div class="current-user-badge" *ngIf="isCurrentUser(usuario.id)">
                🔒 Tu cuenta
              </div>
            </div>
          </div>
        </div>

        <!-- PESTAÑA: SUGERENCIAS -->
        <div *ngIf="activeTab === 'sugerencias'" class="tab-content">
          <div class="section-header">
            <h3>💡 Gestión de Sugerencias</h3>
            <button class="btn btn-secondary" (click)="loadSugerencias()">🔄 Actualizar</button>
          </div>

          <div *ngIf="sugerencias.length === 0" class="empty-state">
            <p>💡 No hay sugerencias registradas</p>
          </div>

          <div class="sugerencias-grid" *ngIf="sugerencias.length > 0">
            <div class="sugerencia-card" *ngFor="let sugerencia of sugerencias">
              <div class="sugerencia-header">
                <h4>{{ sugerencia.titulo }}</h4>
                <span class="estado-badge" [class]="'estado-' + sugerencia.estado">
                  {{ getEstadoLabel(sugerencia.estado) }}
                </span>
              </div>
              
              <div class="sugerencia-details">
                <div class="detail-row">
                  <strong>👤 Usuario:</strong> 
                  {{ sugerencia.usuarios?.nombres }} {{ sugerencia.usuarios?.apellidos }}
                </div>
                <div class="detail-row">
                  <strong>🏷️ Categoría:</strong> {{ sugerencia.categoria }}
                </div>
                <div class="detail-row">
                  <strong>📅 Fecha:</strong> {{ formatDate(sugerencia.fecha_creacion) }}
                </div>
                <div class="detail-row">
                  <strong>📝 Descripción:</strong>
                  <div class="descripcion">{{ sugerencia.descripcion }}</div>
                </div>
              </div>

              <div class="sugerencia-actions" *ngIf="sugerencia.estado === 'pendiente'">
                <button class="btn btn-success" (click)="actualizarSugerencia(sugerencia.id!, 'revisada')">
                  ✅ Marcar como Revisada
                </button>
                <button class="btn btn-danger" (click)="actualizarSugerencia(sugerencia.id!, 'rechazada')">
                  ❌ Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL DE RESPUESTA A TRÁMITE -->
      <div class="modal-overlay" *ngIf="showResponseModal" (click)="closeResponseModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ selectedTramite?.tipo_tramite }}</h3>
            <button class="close-btn" (click)="closeResponseModal()">❌</button>
          </div>
          
          <div class="modal-body">
            <div class="tramite-summary">
              <p><strong>Usuario:</strong> {{ selectedTramite?.usuarios?.nombres }} {{ selectedTramite?.usuarios?.apellidos }}</p>
              <p><strong>Email:</strong> {{ selectedTramite?.usuarios?.email }}</p>
              <p><strong>Acción:</strong> 
                <span [class]="responseAction === 'atendido' ? 'text-success' : 'text-danger'">
                  {{ responseAction === 'atendido' ? '✅ Atender' : '❌ Rechazar' }}
                </span>
              </p>
            </div>

            <form [formGroup]="responseForm" (ngSubmit)="submitResponse()">
              <div class="form-group">
                <label for="comentario">💬 Comentario para el usuario *</label>
                <textarea 
                  id="comentario" 
                  class="form-control" 
                  formControlName="comentario" 
                  rows="4"
                  placeholder="Escribe un comentario explicando la decisión..."
                  required></textarea>
                <small class="help-text">Este comentario se enviará por email al usuario</small>
              </div>

              <div class="form-actions">
                <button 
                  type="submit" 
                  class="btn btn-primary" 
                  [disabled]="responseForm.invalid || isSubmittingResponse">
                  {{ isSubmittingResponse ? '📤 Enviando...' : '📤 Enviar Respuesta' }}
                </button>
                <button type="button" class="btn btn-secondary" (click)="closeResponseModal()">
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <!-- Mensajes de Estado -->
      <div *ngIf="message" class="message" [class.success]="messageSuccess" [class.error]="!messageSuccess">
        {{ message }}
      </div>
    </main>
  `,
  styleUrls: ["./admin.component.css"],
})

export class AdminComponent implements OnInit {
  activeTab = "pendientes"
  tramitesPendientes: Tramite[] = []
  tramitesResueltos: Tramite[] = []
  usuarios: Usuario[] = []
  sugerencias: Sugerencia[] = []

  // Modal de respuesta
  showResponseModal = false
  selectedTramite: Tramite | null = null
  responseAction = ""
  responseForm: FormGroup
  isSubmittingResponse = false

  // Estados generales
  message = ""
  messageSuccess = false
  isChangingRole = false

  // Estadisticas generales

  estadisticasGenerales: any = {}
  currentUserId: string | null = null

  

  constructor(
    private supabaseService: SupabaseService,
    private fb: FormBuilder,
  ) {
    this.responseForm = this.fb.group({
      comentario: ["", [Validators.required, Validators.minLength(10)]],
    })
  }

  async ngOnInit() {
    this.currentUserId = this.supabaseService.getCurrentUser()?.id || null
    await this.loadInitialData()
    await this.cargarEstadisticasGenerales()
  }


  private async loadInitialData() {
    await this.loadTramitesPendientes()
    await this.loadTramitesResueltos()
    await this.loadUsuarios()
    await this.loadSugerencias()
    await this.cargarEstadisticasGenerales()
  }

  setActiveTab(tab: string) {
    this.activeTab = tab
    this.message = ""
  }

  // ============================================================================
  // MÉTODOS DE CARGA DE DATOS
  // ============================================================================

  async loadTramitesPendientes() {
    try {
      this.tramitesPendientes = await this.supabaseService.obtenerTramitesPendientes()
      console.log("✅ Trámites pendientes cargados:", this.tramitesPendientes.length)
    } catch (error) {
      console.error("❌ Error cargando trámites pendientes:", error)
      this.showMessage("Error cargando trámites pendientes", false)
    }
  }

  async loadTramitesResueltos() {
    try {
      this.tramitesResueltos = await this.supabaseService.obtenerTramitesResueltos()
      console.log("✅ Trámites resueltos cargados:", this.tramitesResueltos.length)
    } catch (error) {
      console.error("❌ Error cargando trámites resueltos:", error)
      this.showMessage("Error cargando trámites resueltos", false)
    }
  }

  async loadUsuarios() {
    try {
      this.usuarios = await this.supabaseService.obtenerTodosUsuarios()
      console.log("✅ Usuarios cargados:", this.usuarios.length)
    } catch (error) {
      console.error("❌ Error cargando usuarios:", error)
      this.showMessage("Error cargando usuarios", false)
    }
  }

  async loadSugerencias() {
    try {
      this.sugerencias = await this.supabaseService.obtenerSugerencias()
      console.log("✅ Sugerencias cargadas:", this.sugerencias.length)
    } catch (error) {
      console.error("❌ Error cargando sugerencias:", error)
      this.showMessage("Error cargando sugerencias", false)
    }
  }

  // ============================================================================
  // MÉTODOS DE TRÁMITES
  // ============================================================================

  openResponseModal(tramite: Tramite, action: string) {
    this.selectedTramite = tramite
    this.responseAction = action
    this.showResponseModal = true
    this.responseForm.reset()
  }

  closeResponseModal() {
    this.showResponseModal = false
    this.selectedTramite = null
    this.responseAction = ""
    this.responseForm.reset()
  }
  async cargarEstadisticasGenerales() {
    try {
      this.estadisticasGenerales = await this.supabaseService.obtenerMetricasGenerales()
    } catch (error) {
      console.error("❌ Error cargando estadísticas generales:", error)
    }
  }


  async actualizarMetricas() {
    await this.cargarEstadisticasGenerales()
    this.showMessage("📊 Métricas actualizadas", true)
  }


  async submitResponse() {
    if (!this.responseForm.valid || !this.selectedTramite) return

    this.isSubmittingResponse = true

    try {
      const comentario = this.responseForm.get("comentario")?.value
      const result = await this.supabaseService.actualizarTramiteConComentario(
        this.selectedTramite.id!,
        this.responseAction,
        comentario,
      )

      if (result.success) {
        this.showMessage(result.message, true)
        this.closeResponseModal()

        // Recargar datos
        await this.loadTramitesPendientes()
        await this.loadTramitesResueltos()
      } else {
        this.showMessage(result.message, false)
      }
    } catch (error) {
      console.error("❌ Error enviando respuesta:", error)
      this.showMessage("Error enviando respuesta", false)
    } finally {
      this.isSubmittingResponse = false
    }
  }

  // ============================================================================
  // MÉTODOS DE USUARIOS
  // ============================================================================

  async cambiarRolUsuario(usuario: Usuario) {
    if (this.isCurrentUser(usuario.id)) {
      this.showMessage("No puedes cambiar tu propio rol", false)
      return
    }

    this.isChangingRole = true

    try {
      const nuevoRol = usuario.rol === "administrador" ? "usuario" : "administrador"
      const result = await this.supabaseService.cambiarRolUsuario(usuario.id!, nuevoRol)

      if (result.success) {
        this.showMessage(result.message, true)
        await this.loadUsuarios()
      } else {
        this.showMessage(result.message, false)
      }
    } catch (error) {
      console.error("❌ Error cambiando rol:", error)
      this.showMessage("Error cambiando rol de usuario", false)
    } finally {
      this.isChangingRole = false
    }
  }

  isCurrentUser(usuarioId?: string): boolean {
    const currentUser = this.supabaseService.getCurrentUser()
    return currentUser?.id === usuarioId
  }

  getAdminCount(): number {
    return this.usuarios.filter((u) => u.rol === "administrador").length
  }

  getUserAvatar(usuario: Usuario): string {
    // Siempre retornar una imagen por defecto para evitar parpadeos
    if (usuario.foto_perfil && usuario.foto_perfil.trim() !== "") {
      return usuario.foto_perfil
    }
    return "/placeholder.svg?height=50&width=50"
  }

  // ============================================================================
  // MÉTODOS DE SUGERENCIAS
  // ============================================================================

  async actualizarSugerencia(sugerenciaId: string, estado: string) {
    try {
      const result = await this.supabaseService.actualizarEstadoSugerencia(sugerenciaId, estado)

      if (result.success) {
        this.showMessage(result.message, true)
        await this.loadSugerencias()
      } else {
        this.showMessage(result.message, false)
      }
    } catch (error) {
      console.error("❌ Error actualizando sugerencia:", error)
      this.showMessage("Error actualizando sugerencia", false)
    }
  }

  // ============================================================================
  // MÉTODOS DE UTILIDAD
  // ============================================================================

  private showMessage(text: string, success: boolean) {
    this.message = text
    this.messageSuccess = success

    setTimeout(() => {
      this.message = ""
    }, 5000)
  }

  formatDate(dateString?: string): string {
    if (!dateString) return "No disponible"
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  getEstadoLabel(estado?: string): string {
    switch (estado) {
      case "pendiente":
        return "⏳ Pendiente"
      case "en_proceso":
        return "🔄 En Proceso"
      case "atendido":
        return "✅ Atendido"
      case "rechazado":
        return "❌ Rechazado"
      case "revisada":
        return "✅ Revisada"
      case "rechazada":
        return "❌ Rechazada"
      default:
        return "❓ Desconocido"
    }
  }

  getRoleLabel(rol?: string): string {
    switch (rol) {
      case "administrador":
        return "👑 Admin"
      case "usuario":
        return "👤 Usuario"
      default:
        return "👤 Usuario"
    }
  }

  getGenderLabel(genero?: string): string {
    switch (genero) {
      case "masculino":
        return "Masculino"
      case "femenino":
        return "Femenino"
      default:
        return "No especificado"
    }
  }

  onImageError(event: any) {
    // Evitar bucle infinito de errores
    if (event.target.src !== "/placeholder.svg?height=50&width=50") {
      event.target.src = "/placeholder.svg?height=50&width=50"
    }
  }
}
