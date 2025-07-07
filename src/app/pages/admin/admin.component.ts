import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-admin",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <main class="admin-container">
      <div class="admin-header">
        <h2>🛠️ Panel de Administración</h2>
        <p>Gestión completa del sistema catastral</p>
      </div>

      <!-- Navegación de pestañas -->
      <div class="admin-tabs">
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'dashboard'"
          (click)="setActiveTab('dashboard')">
          📊 Dashboard
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'tramites'"
          (click)="setActiveTab('tramites')">
          📋 Trámites
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'usuarios'"
          (click)="setActiveTab('usuarios')">
          👥 Usuarios
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'sugerencias'"
          (click)="setActiveTab('sugerencias')">
          💡 Sugerencias
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'metricas'"
          (click)="setActiveTab('metricas')">
          📈 Métricas
        </button>
      </div>

      <!-- PESTAÑA DE DASHBOARD -->
      <div *ngIf="activeTab === 'dashboard'">
        <div class="dashboard-overview">
          <div class="stats-grid">
            <div class="stat-card users">
              <div class="stat-icon">👥</div>
              <div class="stat-info">
                <h3>{{ estadisticasGenerales?.usuarios?.total || 0 }}</h3>
                <p>Usuarios Registrados</p>
                <small>{{ estadisticasGenerales?.usuarios?.activos || 0 }} activos</small>
              </div>
            </div>
            <div class="stat-card tramites">
              <div class="stat-icon">📋</div>
              <div class="stat-info">
                <h3>{{ estadisticasGenerales?.tramites?.total || 0 }}</h3>
                <p>Trámites Totales</p>
                <small>{{ estadisticasGenerales?.tramites?.pendientes || 0 }} pendientes</small>
              </div>
            </div>
            <div class="stat-card sugerencias">
              <div class="stat-icon">💡</div>
              <div class="stat-info">
                <h3>{{ estadisticasGenerales?.sugerencias?.total || 0 }}</h3>
                <p>Sugerencias</p>
                <small>{{ estadisticasGenerales?.sugerencias?.pendientes || 0 }} pendientes</small>
              </div>
            </div>
            <div class="stat-card activity">
              <div class="stat-icon">📈</div>
              <div class="stat-info">
                <h3>{{ estadisticasGenerales?.tramites?.este_mes || 0 }}</h3>
                <p>Trámites Este Mes</p>
                <small>Actividad reciente</small>
              </div>
            </div>
          </div>

          <!-- Actividad Reciente -->
          <div class="recent-activity">
            <h3>📋 Actividad Reciente</h3>
            <div class="activity-list" *ngIf="logsActividad.length > 0; else noActivity">
              <div class="activity-item" *ngFor="let log of logsActividad.slice(0, 10)">
                <div class="activity-icon">{{ getActivityIcon(log.accion) }}</div>
                <div class="activity-content">
                  <p><strong>{{ log.usuarios?.nombres || 'Sistema' }}</strong> {{ log.descripcion || log.accion }}</p>
                  <small>{{ log.timestamp | date:'short' }}</small>
                </div>
              </div>
            </div>
            <ng-template #noActivity>
              <p>No hay actividad reciente</p>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- PESTAÑA DE TRÁMITES -->
      <div *ngIf="activeTab === 'tramites'">
        <!-- Filtros de trámites -->
        <div class="filters-section">
          <div class="filter-group">
            <label>Estado:</label>
            <select [(ngModel)]="filtroEstado" (change)="filtrarTramites()">
              <option value="">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="atendido">Atendidos</option>
              <option value="rechazado">Rechazados</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Tipo:</label>
            <select [(ngModel)]="filtroTipo" (change)="filtrarTramites()">
              <option value="">Todos</option>
              <option value="mutacion_primera_clase">Primera Clase</option>
              <option value="mutacion_segunda_clase">Segunda Clase</option>
              <option value="mutacion_tercera_clase">Tercera Clase</option>
              <option value="mutacion_cuarta_clase">Cuarta Clase</option>
              <option value="mutacion_quinta_clase">Quinta Clase</option>
            </select>
          </div>
        </div>

        <!-- Lista de trámites -->
        <div class="tramites-list" *ngIf="tramitesFiltrados.length > 0; else noTramites">
          <div class="tramite-card" *ngFor="let tramite of tramitesFiltrados">
            <div class="tramite-header">
              <h4>{{ getTramiteTitle(tramite.tipo_tramite) }}</h4>
              <div class="tramite-meta">
                <span class="tramite-date">{{ tramite.fecha_solicitud | date:'short' }}</span>
                <span class="estado-badge" [class]="'estado-' + tramite.estado">
                  {{ getEstadoLabel(tramite.estado) }}
                </span>
              </div>
            </div>
            
            <div class="tramite-info">
              <div class="user-info">
                <p><strong>👤 Usuario:</strong> {{ tramite.usuarios.nombres }} {{ tramite.usuarios.apellidos }}</p>
                <p><strong>📧 Email:</strong> {{ tramite.usuarios.email }}</p>
                <p><strong>🆔 Cédula:</strong> {{ tramite.usuarios.cedula }}</p>
              </div>
              
              <div class="tramite-details">
                <div *ngIf="tramite.numero_predial">
                  <strong>🏠 Número Predial:</strong> {{ tramite.numero_predial }}
                </div>
                <div *ngIf="tramite.numero_parcelas">
                  <strong>📊 Parcelas:</strong> {{ tramite.numero_parcelas }}
                </div>
                <div *ngIf="tramite.area_total">
                  <strong>📐 Área:</strong> {{ tramite.area_total }} m²
                </div>
                <div *ngIf="tramite.descripcion_modificacion">
                  <strong>📝 Descripción:</strong> {{ tramite.descripcion_modificacion }}
                </div>
                <div *ngIf="tramite.observaciones">
                  <strong>📋 Observaciones:</strong> {{ tramite.observaciones }}
                </div>
                <div *ngIf="tramite.observaciones_admin">
                  <strong>💬 Respuesta Admin:</strong> {{ tramite.observaciones_admin }}
                </div>
              </div>
            </div>
            
            <div class="tramite-actions" *ngIf="tramite.estado === 'pendiente'">
              <button class="btn btn-success" (click)="responderTramite(tramite, 'atendido')">
                ✅ Aprobar
              </button>
              <button class="btn btn-danger" (click)="responderTramite(tramite, 'rechazado')">
                ❌ Rechazar
              </button>
              <button class="btn btn-info" (click)="verDetallesTramite(tramite)">
                👁️ Ver Detalles
              </button>
            </div>
          </div>
        </div>

        <ng-template #noTramites>
          <div class="no-data">
            <p>🎉 No hay trámites que mostrar</p>
          </div>
        </ng-template>
      </div>

      <!-- PESTAÑA DE USUARIOS -->
      <div *ngIf="activeTab === 'usuarios'">
        <div class="usuarios-section">
          <h3>👥 Gestión de Usuarios</h3>
          
          <div class="usuarios-list" *ngIf="todosLosUsuarios.length > 0; else noUsuarios">
            <div class="usuario-card" *ngFor="let usuario of todosLosUsuarios">
              <div class="usuario-header">
                <div class="usuario-avatar">
                  <img [src]="usuario.foto_perfil || '/placeholder.svg?height=50&width=50'" alt="Avatar">
                </div>
                <div class="usuario-info">
                  <h4>{{ usuario.nombres }} {{ usuario.apellidos }}</h4>
                  <p>{{ usuario.email }}</p>
                  <small>Cédula: {{ usuario.cedula }}</small>
                </div>
                <div class="usuario-status">
                  <span class="rol-badge" [class]="'rol-' + usuario.rol">
                    {{ usuario.rol === 'administrador' ? '👑 Admin' : '👤 Usuario' }}
                  </span>
                  <span class="status-badge" [class.active]="usuario.activo" [class.inactive]="!usuario.activo">
                    {{ usuario.activo ? '✅ Activo' : '❌ Inactivo' }}
                  </span>
                </div>
              </div>
              
              <div class="usuario-details">
                <p><strong>📱 Teléfono:</strong> {{ usuario.telefono || 'No especificado' }}</p>
                <p><strong>📅 Registro:</strong> {{ usuario.fecha_registro | date:'short' }}</p>
                <p><strong>✉️ Verificado:</strong> {{ usuario.email_verificado ? '✅ Sí' : '❌ No' }}</p>
              </div>
              
              <div class="usuario-actions">
                <button 
                  class="btn btn-primary" 
                  (click)="cambiarRol(usuario)"
                  [disabled]="usuario.id === currentUserId">
                  {{ usuario.rol === 'administrador' ? '👤 Hacer Usuario' : '👑 Hacer Admin' }}
                </button>
              </div>
            </div>
          </div>

          <ng-template #noUsuarios>
            <div class="no-data">
              <p>👥 No hay usuarios registrados</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- PESTAÑA DE SUGERENCIAS -->
      <div *ngIf="activeTab === 'sugerencias'">
        <div class="sugerencias-section">
          <h3>💡 Gestión de Sugerencias</h3>
          
          <div class="sugerencias-list" *ngIf="todasSugerencias.length > 0; else noSugerencias">
            <div class="sugerencia-card" *ngFor="let sugerencia of todasSugerencias">
              <div class="sugerencia-header">
                <h4>{{ sugerencia.titulo }}</h4>
                <div class="sugerencia-meta">
                  <span class="categoria" [class]="'categoria-' + sugerencia.categoria">
                    {{ getCategoriaLabel(sugerencia.categoria) }}
                  </span>
                  <span class="estado" [class]="'estado-' + sugerencia.estado">
                    {{ getEstadoSugerenciaLabel(sugerencia.estado) }}
                  </span>
                </div>
              </div>
              
              <div class="sugerencia-body">
                <p>{{ sugerencia.descripcion }}</p>
              </div>
              
              <div class="sugerencia-footer">
                <div class="autor" *ngIf="sugerencia.usuarios">
                  👤 {{ sugerencia.usuarios.nombres }} {{ sugerencia.usuarios.apellidos }}
                </div>
                <div class="fecha">
                  📅 {{ sugerencia.fecha_creacion | date:'short' }}
                </div>
              </div>

              <div class="sugerencia-actions" *ngIf="sugerencia.estado === 'pendiente'">
                <button class="btn btn-success" (click)="aprobarSugerencia(sugerencia.id)">
                  ✅ Aprobar
                </button>
                <button class="btn btn-warning" (click)="ponerEnRevision(sugerencia.id)">
                  👀 En Revisión
                </button>
                <button class="btn btn-danger" (click)="rechazarSugerencia(sugerencia.id)">
                  ❌ Rechazar
                </button>
              </div>
            </div>
          </div>

          <ng-template #noSugerencias>
            <div class="no-data">
              <p>📝 No hay sugerencias registradas</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- PESTAÑA DE MÉTRICAS -->
      <div *ngIf="activeTab === 'metricas'">
        <div class="metricas-section">
          <h3>📈 Métricas y Seguimiento del Sistema</h3>
          
          <div class="metricas-controls">
            <button class="btn btn-primary" (click)="actualizarMetricas()">
              🔄 Actualizar Métricas
            </button>
          </div>

          <div class="metricas-grid" *ngIf="metricasSistema.length > 0; else noMetricas">
            <div class="metrica-card" *ngFor="let metrica of metricasSistema.slice(0, 7)">
              <div class="metrica-header">
                <h4>{{ metrica.fecha | date:'shortDate' }}</h4>
              </div>
              <div class="metrica-stats">
                <div class="stat-item">
                  <span class="stat-label">👥 Usuarios Activos:</span>
                  <span class="stat-value">{{ metrica.usuarios_activos }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">📋 Trámites Creados:</span>
                  <span class="stat-value">{{ metrica.tramites_creados }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">✅ Trámites Procesados:</span>
                  <span class="stat-value">{{ metrica.tramites_procesados }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">💡 Sugerencias:</span>
                  <span class="stat-value">{{ metrica.sugerencias_creadas }}</span>
                </div>
              </div>
            </div>
          </div>

          <ng-template #noMetricas>
            <div class="no-data">
              <p>📊 No hay métricas disponibles</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Modal de Respuesta a Trámite -->
      <div class="modal-overlay" *ngIf="tramiteParaResponder" (click)="cerrarModalRespuesta()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>💬 Responder Trámite</h3>
            <button class="close-btn" (click)="cerrarModalRespuesta()">✕</button>
          </div>
          
          <div class="modal-body">
            <form [formGroup]="respuestaForm" (ngSubmit)="enviarRespuesta()">
              <div class="form-group">
                <label>Trámite:</label>
                <p><strong>{{ getTramiteTitle(tramiteParaResponder.tipo_tramite) }}</strong></p>
                <p>Usuario: {{ tramiteParaResponder.usuarios.nombres }} {{ tramiteParaResponder.usuarios.apellidos }}</p>
              </div>
              
              <div class="form-group">
                <label>Estado:</label>
                <select formControlName="estado" class="form-control" required>
                  <option value="atendido">✅ Aprobar</option>
                  <option value="rechazado">❌ Rechazar</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Observaciones para el usuario:</label>
                <textarea 
                  formControlName="observaciones" 
                  class="form-control" 
                  rows="4"
                  placeholder="Escriba las observaciones que se enviarán al usuario por email..."
                  required></textarea>
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="respuestaForm.invalid || enviandoRespuesta">
                  {{ enviandoRespuesta ? 'Enviando...' : '📧 Enviar Respuesta' }}
                </button>
                <button type="button" class="btn btn-secondary" (click)="cerrarModalRespuesta()">
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal de Detalles de Trámite -->
      <div class="modal-overlay" *ngIf="tramiteSeleccionado" (click)="cerrarModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>📋 Detalles del Trámite</h3>
            <button class="close-btn" (click)="cerrarModal()">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="detail-section">
              <h4>👤 Información del Usuario</h4>
              <div class="detail-grid">
                <div><strong>Nombre:</strong> {{ tramiteSeleccionado.usuarios.nombres }} {{ tramiteSeleccionado.usuarios.apellidos }}</div>
                <div><strong>Cédula:</strong> {{ tramiteSeleccionado.usuarios.cedula }}</div>
                <div><strong>Email:</strong> {{ tramiteSeleccionado.usuarios.email }}</div>
                <div><strong>Teléfono:</strong> {{ tramiteSeleccionado.usuarios.telefono }}</div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>📋 Información del Trámite</h4>
              <div class="detail-grid">
                <div><strong>Tipo:</strong> {{ getTramiteTitle(tramiteSeleccionado.tipo_tramite) }}</div>
                <div><strong>Estado:</strong> {{ tramiteSeleccionado.estado | titlecase }}</div>
                <div><strong>Fecha Solicitud:</strong> {{ tramiteSeleccionado.fecha_solicitud | date:'full' }}</div>
                <div *ngIf="tramiteSeleccionado.numero_predial"><strong>Número Predial:</strong> {{ tramiteSeleccionado.numero_predial }}</div>
                <div *ngIf="tramiteSeleccionado.numero_parcelas"><strong>Parcelas:</strong> {{ tramiteSeleccionado.numero_parcelas }}</div>
                <div *ngIf="tramiteSeleccionado.area_total"><strong>Área:</strong> {{ tramiteSeleccionado.area_total }} m²</div>
              </div>
              
              <div *ngIf="tramiteSeleccionado.descripcion_modificacion" class="description">
                <strong>Descripción:</strong>
                <p>{{ tramiteSeleccionado.descripcion_modificacion }}</p>
              </div>
              
              <div *ngIf="tramiteSeleccionado.observaciones" class="description">
                <strong>Observaciones del Usuario:</strong>
                <p>{{ tramiteSeleccionado.observaciones }}</p>
              </div>

              <div *ngIf="tramiteSeleccionado.observaciones_admin" class="description">
                <strong>Respuesta del Administrador:</strong>
                <p>{{ tramiteSeleccionado.observaciones_admin }}</p>
              </div>
            </div>
          </div>
          
          <div class="modal-actions" *ngIf="tramiteSeleccionado.estado === 'pendiente'">
            <button class="btn btn-success" (click)="responderTramite(tramiteSeleccionado, 'atendido')">
              ✅ Aprobar Trámite
            </button>
            <button class="btn btn-danger" (click)="responderTramite(tramiteSeleccionado, 'rechazado')">
              ❌ Rechazar Trámite
            </button>
          </div>
        </div>
      </div>

      <!-- Mensaje de Acción -->
      <div class="action-message" *ngIf="actionMessage" [class.success]="actionSuccess" [class.error]="!actionSuccess">
        {{ actionMessage }}
      </div>
    </main>
  `,
  styleUrls: ["./admin.component.css"],
})
export class AdminComponent implements OnInit {
  // Pestañas
  activeTab = "dashboard"

  // Estados generales
  actionMessage = ""
  actionSuccess = false

  // Variables para la gestión de trámites
  filtroEstado = ""
  filtroTipo = ""
  tramitesFiltrados: any[] = []

  // Variables para la gestión de usuarios
  todosLosUsuarios: any[] = []

  // Variables para la gestión de sugerencias
  todasSugerencias: any[] = []

  // Variables para la gestión de métricas
  metricasSistema: any[] = []

  // Variables para el modal de respuesta a trámites
  tramiteParaResponder: any | null = null
  respuestaForm!: FormGroup
  enviandoRespuesta = false

  // Variables para el modal de detalles de trámites
  tramiteSeleccionado: any | null = null

  // Logs de actividad
  logsActividad: any[] = []

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.inicializarFormularioRespuesta()
    this.cargarEstadisticasGenerales()
    this.cargarLogsActividad()
    this.cargarTramites()
    this.cargarUsuarios()
    this.cargarSugerencias()
    this.cargarMetricas()
  }

  inicializarFormularioRespuesta(): void {
    this.respuestaForm = this.fb.group({
      estado: ["", Validators.required],
      observaciones: ["", Validators.required],
    })
  }

  cargarEstadisticasGenerales(): void {
    // Lógica para cargar estadísticas generales
  }

  cargarLogsActividad(): void {
    // Lógica para cargar logs de actividad
  }

  cargarTramites(): void {
    // Lógica para cargar trámites
  }

  cargarUsuarios(): void {
    // Lógica para cargar usuarios
  }

  cargarSugerencias(): void {
    // Lógica para cargar sugerencias
  }

  cargarMetricas(): void {
    // Lógica para cargar métricas
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab
  }

  filtrarTramites(): void {
    // Lógica para filtrar trámites
  }

  responderTramite(tramite: any, estado: string): void {
    // Lógica para responder a un trámite
  }

  verDetallesTramite(tramite: any): void {
    // Lógica para ver detalles de un trámite
  }

  cambiarRol(usuario: any): void {
    // Lógica para cambiar el rol de un usuario
  }

  aprobarSugerencia(id: number): void {
    // Lógica para aprobar una sugerencia
  }

  ponerEnRevision(id: number): void {
    // Lógica para poner una sugerencia en revisión
  }

  rechazarSugerencia(id: number): void {
    // Lógica para rechazar una sugerencia
  }

  enviarRespuesta(): void {
    // Lógica para enviar respuesta a un trámite
  }

  cerrarModalRespuesta(): void {
    this.tramiteParaResponder = null
    this.respuestaForm.reset()
  }

  cerrarModal(): void {
    this.tramiteSeleccionado = null
  }

  getActivityIcon(accion: string): string {
    // Lógica para obtener el icono de actividad
    return ""
  }

  getTramiteTitle(tipoTramite: string): string {
    // Lógica para obtener el título del trámite
    return ""
  }

  getEstadoLabel(estado: string): string {
    // Lógica para obtener el label del estado del trámite
    return ""
  }

  getCategoriaLabel(categoria: string): string {
    // Lógica para obtener el label de la categoría de la sugerencia
    return ""
  }

  getEstadoSugerenciaLabel(estado: string): string {
    // Lógica para obtener el label del estado de la sugerencia
    return ""
  }
}
