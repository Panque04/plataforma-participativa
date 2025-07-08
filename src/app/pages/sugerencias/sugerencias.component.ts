import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { SupabaseService } from "../../services/supabase.service"

@Component({
  selector: "app-sugerencias",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="sugerencias-container">
      <!-- Header -->
      <div class="sugerencias-header">
        <h1>💡 Sugerencias para la Plataforma</h1>
        <p>Tu opinión nos ayuda a mejorar continuamente</p>
      </div>

      <div class="sugerencias-content">
        <!-- Formulario de Sugerencias -->
        <div class="form-section">
          <h2>📝 Enviar Nueva Sugerencia</h2>
          
          <form [formGroup]="sugerenciaForm" (ngSubmit)="onSubmitSugerencia()">
            <div class="form-group">
              <label for="titulo">📋 Título de la Sugerencia:</label>
              <input 
                type="text" 
                id="titulo" 
                class="form-control" 
                formControlName="titulo"
                placeholder="Describe brevemente tu sugerencia"
                required>
            </div>

            <div class="form-group">
              <label for="categoria">🏷️ Categoría:</label>
              <select id="categoria" class="form-control" formControlName="categoria" required>
                <option value="">Selecciona una categoría</option>
                <option value="funcionalidad">🔧 Nueva Funcionalidad</option>
                <option value="usabilidad">👤 Mejora de Usabilidad</option>
                <option value="tecnico">💻 Aspecto Técnico</option>
                <option value="contenido">📄 Contenido</option>
                <option value="diseno">🎨 Diseño</option>
                <option value="otro">❓ Otro</option>
              </select>
            </div>

            <div class="form-group">
              <label for="descripcion">📝 Descripción Detallada:</label>
              <textarea 
                id="descripcion" 
                class="form-control" 
                rows="6"
                formControlName="descripcion"
                placeholder="Explica tu sugerencia con el mayor detalle posible. ¿Qué problema resuelve? ¿Cómo mejoraría la plataforma?"
                required></textarea>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="sugerenciaForm.invalid || isSubmitting">
                {{ isSubmitting ? '📤 Enviando...' : '🚀 Enviar Sugerencia' }}
              </button>
              <button type="button" class="btn btn-secondary" (click)="resetForm()">
                🔄 Limpiar Formulario
              </button>
            </div>

            <div *ngIf="submitMessage" class="message" [class.success]="submitSuccess" [class.error]="!submitSuccess">
              {{ submitMessage }}
            </div>
          </form>
        </div>

        <!-- Sugerencias Existentes -->
        <div class="sugerencias-list">
          <h2>💭 Sugerencias de la Comunidad</h2>
          
          <div class="filter-section">
            <label for="filtroCategoria">Filtrar por categoría:</label>
            <select id="filtroCategoria" class="form-control" (change)="filtrarSugerencias($event)">
              <option value="">Todas las categorías</option>
              <option value="funcionalidad">🔧 Nueva Funcionalidad</option>
              <option value="usabilidad">👤 Mejora de Usabilidad</option>
              <option value="tecnico">💻 Aspecto Técnico</option>
              <option value="contenido">📄 Contenido</option>
              <option value="diseno">🎨 Diseño</option>
              <option value="otro">❓ Otro</option>
            </select>
          </div>

          <div class="sugerencias-grid" *ngIf="sugerenciasFiltradas.length > 0; else noSugerencias">
            <div class="sugerencia-card" *ngFor="let sugerencia of sugerenciasFiltradas">
              <div class="sugerencia-header">
                <h3>{{ sugerencia.titulo }}</h3>
                <div class="sugerencia-meta">
                  <span class="categoria" [class]="'categoria-' + sugerencia.categoria">
                    {{ getCategoriaLabel(sugerencia.categoria) }}
                  </span>
                  <span class="estado" [class]="'estado-' + sugerencia.estado">
                    {{ getEstadoLabel(sugerencia.estado) }}
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
            </div>
          </div>

          <ng-template #noSugerencias>
            <div class="no-sugerencias">
              <p>🤔 No hay sugerencias para mostrar con los filtros seleccionados.</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Estadísticas de Sugerencias -->
      <div class="stats-section">
        <h2>📊 Estadísticas de Sugerencias</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">💡</div>
            <div class="stat-content">
              <h3>{{ sugerenciasStats.total }}</h3>
              <p>Total Sugerencias</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <h3>{{ sugerenciasStats.pendientes }}</h3>
              <p>Pendientes</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👀</div>
            <div class="stat-content">
              <h3>{{ sugerenciasStats.enRevision }}</h3>
              <p>En Revisión</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <h3>{{ sugerenciasStats.aprobadas }}</h3>
              <p>Aprobadas</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styleUrls: ["./sugerencias.component.css"],
})
export class SugerenciasComponent implements OnInit {
  sugerenciaForm: FormGroup
  sugerencias: any[] = []
  sugerenciasFiltradas: any[] = []
  submitMessage = ""
  submitSuccess = false
  isSubmitting = false
  sugerenciasStats = {
    total: 0,
    pendientes: 0,
    enRevision: 0,
    aprobadas: 0,
  }

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
  ) {
    this.sugerenciaForm = this.fb.group({
      titulo: ["", [Validators.required, Validators.minLength(10)]],
      categoria: ["", Validators.required],
      descripcion: ["", [Validators.required, Validators.minLength(20)]],
    })
  }

  ngOnInit() {
    this.loadSugerencias()
  }

  async loadSugerencias() {
    this.sugerencias = await this.supabaseService.obtenerSugerencias()
    this.sugerenciasFiltradas = [...this.sugerencias]
    this.calculateStats()
  }

  calculateStats() {
    this.sugerenciasStats = {
      total: this.sugerencias.length,
      pendientes: this.sugerencias.filter((s) => s.estado === "pendiente").length,
      enRevision: this.sugerencias.filter((s) => s.estado === "en_revision").length,
      aprobadas: this.sugerencias.filter((s) => s.estado === "aprobada").length,
    }
  }

  async onSubmitSugerencia() {
    if (this.sugerenciaForm.valid && !this.isSubmitting) {
      this.isSubmitting = true

      const sugerenciaData = this.sugerenciaForm.value
      const result = await this.supabaseService.crearSugerencia(sugerenciaData)

      this.submitMessage = result.message
      this.submitSuccess = result.success

      if (result.success) {
        this.sugerenciaForm.reset()
        await this.loadSugerencias()
      }

      this.isSubmitting = false

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        this.submitMessage = ""
      }, 5000)
    }
  }

  resetForm() {
    this.sugerenciaForm.reset()
    this.submitMessage = ""
  }

  filtrarSugerencias(event: any) {
    const categoria = event.target.value
    if (categoria) {
      this.sugerenciasFiltradas = this.sugerencias.filter((s) => s.categoria === categoria)
    } else {
      this.sugerenciasFiltradas = [...this.sugerencias]
    }
  }

  getCategoriaLabel(categoria: string): string {
    const labels: { [key: string]: string } = {
      funcionalidad: "🔧 Nueva Funcionalidad",
      usabilidad: "👤 Mejora de Usabilidad",
      tecnico: "💻 Aspecto Técnico",
      contenido: "📄 Contenido",
      diseno: "🎨 Diseño",
      otro: "❓ Otro",
    }
    return labels[categoria] || categoria
  }

  getEstadoLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      pendiente: "⏳ Pendiente",
      en_revision: "👀 En Revisión",
      aprobada: "✅ Aprobada",
      rechazada: "❌ Rechazada",
    }
    return labels[estado] || estado
  }
}
