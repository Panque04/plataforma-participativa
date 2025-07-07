import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { SupabaseService } from "../../services/supabase.service"

@Component({
  selector: "app-estadisticos",
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="container mt-5">
      <section class="estadisticos-section">
        <h2 class="text-center text-primary mb-4">Estadísticas en Tiempo Real</h2>
        
        <div class="stats-grid" *ngIf="estadisticas">
          <!-- Estadísticas de Usuarios -->
          <div class="stat-card usuarios">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3>{{ estadisticas.totalUsuarios }}</h3>
              <p>Usuarios Registrados</p>
              <small>{{ estadisticas.usuariosVerificados }} verificados</small>
            </div>
          </div>

          <!-- Estadísticas de Trámites -->
          <div class="stat-card tramites-pendientes">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <h3>{{ estadisticas.tramitesPendientes }}</h3>
              <p>Trámites Pendientes</p>
            </div>
          </div>

          <div class="stat-card tramites-atendidos">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <h3>{{ estadisticas.tramitesAtendidos }}</h3>
              <p>Trámites Atendidos</p>
            </div>
          </div>

          <div class="stat-card total-tramites">
            <div class="stat-icon">📋</div>
            <div class="stat-content">
              <h3>{{ estadisticas.totalTramites }}</h3>
              <p>Total Trámites</p>
            </div>
          </div>
        </div>

        <!-- Distribución por Género -->
        <div class="gender-stats mt-5" *ngIf="estadisticas">
          <h3 class="text-center mb-4">Distribución por Género</h3>
          <div class="gender-grid">
            <div class="gender-card masculino">
              <div class="gender-icon">👨</div>
              <div class="gender-content">
                <h4>{{ estadisticas.usuariosPorGenero.masculino }}</h4>
                <p>Masculino</p>
                <div class="percentage">
                  {{ getPercentage(estadisticas.usuariosPorGenero.masculino) }}%
                </div>
              </div>
            </div>

            <div class="gender-card femenino">
              <div class="gender-icon">👩</div>
              <div class="gender-content">
                <h4>{{ estadisticas.usuariosPorGenero.femenino }}</h4>
                <p>Femenino</p>
                <div class="percentage">
                  {{ getPercentage(estadisticas.usuariosPorGenero.femenino) }}%
                </div>
              </div>
            </div>

            <div class="gender-card no-identificado">
              <div class="gender-icon">❓</div>
              <div class="gender-content">
                <h4>{{ estadisticas.usuariosPorGenero.noIdentificado }}</h4>
                <p>No Identificado</p>
                <div class="percentage">
                  {{ getPercentage(estadisticas.usuariosPorGenero.noIdentificado) }}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gráfico de Progreso -->
        <div class="progress-section mt-5" *ngIf="estadisticas">
          <h3 class="text-center mb-4">Progreso de Trámites</h3>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" 
                   [style.width.%]="getTramitesProgress()">
              </div>
            </div>
            <div class="progress-text">
              {{ estadisticas.tramitesAtendidos }} de {{ estadisticas.totalTramites }} trámites completados
              ({{ getTramitesProgress() }}%)
            </div>
          </div>
        </div>

        <!-- Información de Actualización -->
        <div class="update-info mt-4">
          <p class="text-center text-muted">
            <small>
              Última actualización: {{ ultimaActualizacion | date:'medium' }}
              <br>
              Los datos se actualizan automáticamente cada 30 segundos
            </small>
          </p>
        </div>
      </section>
    </main>
  `,
  styleUrls: ["./estadisticos.component.css"],
})
export class EstadisticosComponent implements OnInit, OnDestroy {
  estadisticas: any = null
  ultimaActualizacion = new Date()
  private intervalId: any

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.cargarEstadisticas()
    // Actualizar cada 30 segundos
    this.intervalId = setInterval(() => {
      this.cargarEstadisticas()
    }, 30000)
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }

  async cargarEstadisticas() {
    this.estadisticas = await this.supabaseService.obtenerEstadisticas()
    this.ultimaActualizacion = new Date()
  }

  getPercentage(valor: number): number {
    if (!this.estadisticas || this.estadisticas.totalUsuarios === 0) return 0
    return Math.round((valor / this.estadisticas.totalUsuarios) * 100)
  }

  getTramitesProgress(): number {
    if (!this.estadisticas || this.estadisticas.totalTramites === 0) return 0
    return Math.round((this.estadisticas.tramitesAtendidos / this.estadisticas.totalTramites) * 100)
  }
}
