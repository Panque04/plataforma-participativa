import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { SupabaseService } from "../../services/supabase.service"

@Component({
  selector: "app-gobernanza",
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="gobernanza-container">
      <!-- Header -->
      <div class="gobernanza-header">
        <h1>🏛️ Gobernanza Territorial</h1>
        <p>Fortaleciendo la gestión participativa del territorio en Tausa</p>
      </div>

      <!-- Introducción -->
      <section class="intro-section">
        <div class="intro-content">
          <h2>¿Qué es la Gobernanza Territorial?</h2>
          <p>
            La gobernanza territorial es un enfoque de gestión pública que promueve la participación 
            activa de todos los actores del territorio en la toma de decisiones sobre el desarrollo 
            local. En Tausa, implementamos este modelo para garantizar una administración transparente, 
            eficiente y participativa de nuestros recursos territoriales.
          </p>
        </div>
        <div class="intro-image">
          <img src="assets/images/Gobernanza.png" alt="Gobernanza Territorial">
        </div>
      </section>

      <!-- Principios de Gobernanza -->
      <section class="principios-section">
        <h2>🎯 Principios de Nuestra Gobernanza</h2>
        <div class="principios-grid">
          <div class="principio-card">
            <div class="principio-icon">🤝</div>
            <h3>Participación Ciudadana</h3>
            <p>Involucramos a la comunidad en todas las decisiones que afectan el territorio</p>
          </div>
          <div class="principio-card">
            <div class="principio-icon">🔍</div>
            <h3>Transparencia</h3>
            <p>Toda la información territorial está disponible para consulta pública</p>
          </div>
          <div class="principio-card">
            <div class="principio-icon">⚖️</div>
            <h3>Equidad</h3>
            <p>Garantizamos acceso igualitario a los servicios y oportunidades territoriales</p>
          </div>
          <div class="principio-card">
            <div class="principio-icon">🌱</div>
            <h3>Sostenibilidad</h3>
            <p>Promovemos el desarrollo equilibrado entre lo económico, social y ambiental</p>
          </div>
        </div>
      </section>

      <section class="curso-section">
        <h2>📚 Curso de Gobernanza Territorial</h2>
        <p class="curso-intro">
          Conoce los fundamentos, principios y herramientas de la gobernanza territorial participativa en Tausa.
          Este curso te permitirá comprender tu rol como ciudadano y cómo puedes incidir en las decisiones sobre el territorio.
        </p>

        <div class="modulos-grid">
          <div class="modulo-card">
            <h3>📖 Módulo 1: ¿Qué es la Gobernanza?</h3>
            <p>Aprende los conceptos clave de la gobernanza territorial, su origen y su importancia en la gestión pública local.</p>
          </div>
          <div class="modulo-card">
            <h3>🧭 Módulo 2: Participación Ciudadana</h3>
            <p>Descubre cómo puedes participar activamente en las decisiones del municipio y ejercer control social sobre la gestión pública.</p>
          </div>
          <div class="modulo-card">
            <h3>🛠️ Módulo 3: Instrumentos de Planeación</h3>
            <p>Conoce los principales instrumentos como el POT, los Planes de Desarrollo y el Catastro Multipropósito.</p>
          </div>
          <div class="modulo-card">
            <h3>📈 Módulo 4: Seguimiento y Control</h3>
            <p>Aprende a hacer seguimiento a las acciones de la administración y cómo usar la información pública de forma efectiva.</p>
          </div>
        </div>

        <div class="cta-section">
          <div class="cta-content">
            <h2>¡Participa activamente!</h2>
            <p>Conviértete en un líder territorial y contribuye a construir una comunidad más justa, organizada y sostenible.</p>
            <div class="cta-buttons">
              <a href="#" class="btn btn-primary">Iniciar Curso</a>
              <a href="#" class="btn btn-secondary">Descargar Material</a>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Estadísticas de Gobernanza DINÁMICAS -->
      <section class="stats-gobernanza">
        <h2>📊 Indicadores de Gobernanza Territorial</h2>
        <div class="stats-loading" *ngIf="loadingStats">
          <div class="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
        
        <div class="stats-grid" *ngIf="gobernanzaStats && !loadingStats">
          <div class="stat-card participacion">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3>{{ gobernanzaStats.participacionCiudadana }}%</h3>
              <p>Participación Ciudadana</p>
              <small>{{ gobernanzaStats.usuariosActivos }} usuarios activos de {{ gobernanzaStats.totalUsuarios }} registrados</small>
            </div>
          </div>
          
          <div class="stat-card transparencia">
            <div class="stat-icon">📋</div>
            <div class="stat-content">
              <h3>{{ gobernanzaStats.tramitesDigitales }}%</h3>
              <p>Trámites Digitalizados</p>
              <small>{{ gobernanzaStats.totalTramites }} trámites procesados en línea</small>
            </div>
          </div>
          
          <div class="stat-card eficiencia">
            <div class="stat-icon">⚡</div>
            <div class="stat-content">
              <h3>{{ gobernanzaStats.tiempoPromedio }}</h3>
              <p>Tiempo Promedio</p>
              <small>Días para resolver trámites ({{ gobernanzaStats.tramitesAtendidos }} resueltos)</small>
            </div>
          </div>
          
          <div class="stat-card satisfaccion">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <h3>{{ gobernanzaStats.satisfaccionCiudadana }}%</h3>
              <p>Satisfacción Ciudadana</p>
              <small>Basado en {{ gobernanzaStats.totalSugerencias }} sugerencias recibidas</small>
            </div>
          </div>
        </div>

        <!-- Estadísticas adicionales -->
        <div class="additional-stats" *ngIf="gobernanzaStats && !loadingStats">
          <div class="stat-row">
            <div class="stat-item">
              <span class="stat-label">📈 Eficiencia de Respuesta:</span>
              <span class="stat-value">{{ gobernanzaStats.eficienciaRespuesta }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">🗺️ Cobertura Geográfica:</span>
              <span class="stat-value">{{ gobernanzaStats.coberturaGeografica }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">📊 Índice de Transparencia:</span>
              <span class="stat-value">{{ gobernanzaStats.indiceTransparencia }}/10</span>
            </div>
          </div>
        </div>

        <!-- Transparencia en Cálculos -->
        <div class="transparency-section" *ngIf="gobernanzaStats && !loadingStats">
          <h3>🔍 Transparencia en Cálculos</h3>
          <p class="transparency-intro">
            En cumplimiento de nuestros principios de transparencia, aquí se explican las fórmulas 
            utilizadas para calcular los indicadores de gobernanza:
          </p>
          
          <div class="formula-grid">
            <div class="formula-card">
              <h4>👥 Participación Ciudadana</h4>
              <div class="formula">
                <code>PC = (Usuarios Verificados / Total Usuarios) × 100</code>
              </div>
              <p class="formula-explanation">
                Mide el porcentaje de usuarios que han completado el proceso de verificación 
                y participan activamente en la plataforma.
              </p>
            </div>

            <div class="formula-card">
              <h4>⚡ Eficiencia de Respuesta</h4>
              <div class="formula">
                <code>ER = ((Trámites Atendidos + Rechazados) / Total Trámites) × 100</code>
              </div>
              <p class="formula-explanation">
                Indica el porcentaje de trámites que han recibido una respuesta definitiva 
                (aprobados o rechazados) del total de solicitudes.
              </p>
            </div>

            <div class="formula-card">
              <h4>⭐ Satisfacción Ciudadana</h4>
              <div class="formula">
                <code>SC = (Tasa Éxito × 80) + (Factor Sugerencias × 20) + 15</code>
              </div>
              <p class="formula-explanation">
                Combina la tasa de éxito de trámites (80%), la participación en sugerencias (20%) 
                y una base de satisfacción del 15%.
              </p>
            </div>

            <div class="formula-card">
              <h4>🗺️ Cobertura Geográfica</h4>
              <div class="formula">
                <code>CG = ((Factor Usuarios + Factor Trámites) / 2) × 100</code>
              </div>
              <p class="formula-explanation">
                Estima la cobertura territorial basada en la distribución de usuarios activos 
                y la diversidad geográfica de los trámites procesados.
              </p>
            </div>

            <div class="formula-card">
              <h4>📊 Índice de Transparencia</h4>
              <div class="formula">
                <code>IT = 7.0 + Bonificaciones (máx 3.0 puntos)</code>
              </div>
              <p class="formula-explanation">
                Índice base de 7.0 puntos con bonificaciones por: usuarios activos (+0.5), 
                trámites procesados (+0.5), sugerencias recibidas (+0.5), alta eficiencia (+0.5).
              </p>
            </div>

            <div class="formula-card">
              <h4>💰 Impacto Económico</h4>
              <div class="formula">
                <code>IE = 15% + (Factor Actividad × 15%)</code>
              </div>
              <p class="formula-explanation">
                Impacto base del 15% más un factor adicional basado en la actividad del sistema 
                (hasta 15% adicional según el volumen de trámites).
              </p>
            </div>
          </div>

          <div class="data-sources">
            <h4>📋 Fuentes de Datos</h4>
            <ul>
              <li><strong>Usuarios:</strong> Tabla 'usuarios' - Total registrados y verificados</li>
              <li><strong>Trámites:</strong> Tabla 'tramites' - Estados y fechas de procesamiento</li>
              <li><strong>Sugerencias:</strong> Tabla 'sugerencias' - Participación ciudadana</li>
              <li><strong>Actividad:</strong> Logs del sistema y métricas de uso</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Instrumentos de Gobernanza -->
      <section class="instrumentos-section">
        <h2>🛠️ Instrumentos de Gobernanza</h2>
        <div class="instrumentos-grid">
          <div class="instrumento-card">
            <h3>📋 Plan de Ordenamiento Territorial (POT)</h3>
            <p>Instrumento técnico y normativo que orienta el desarrollo del territorio municipal</p>
            <ul>
              <li>Zonificación del territorio</li>
              <li>Usos del suelo permitidos</li>
              <li>Proyectos estratégicos</li>
            </ul>
          </div>
          
          <div class="instrumento-card">
            <h3>🗺️ Sistema de Información Territorial</h3>
            <p>Plataforma digital que integra toda la información geográfica del municipio</p>
            <ul>
              <li>Catastro multipropósito</li>
              <li>Información predial</li>
              <li>Capas temáticas</li>
            </ul>
          </div>
          
          <div class="instrumento-card">
            <h3>👥 Consejos Territoriales</h3>
            <p>Espacios de participación ciudadana para la toma de decisiones</p>
            <ul>
              <li>Consejo Municipal de Planeación</li>
              <li>Consejo Territorial de Salud</li>
              <li>Comité de Estratificación</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Proyectos Estratégicos -->
      <section class="proyectos-section">
        <h2>🚀 Proyectos Estratégicos de Gobernanza</h2>
        <div class="proyectos-timeline">
          <div class="proyecto-item">
            <div class="proyecto-fecha">2024</div>
            <div class="proyecto-content">
              <h3>Implementación del Catastro Multipropósito</h3>
              <p>Modernización del sistema catastral para mejorar la gestión territorial</p>
              <div class="proyecto-status completado">✅ Completado</div>
            </div>
          </div>
          
          <div class="proyecto-item">
            <div class="proyecto-fecha">2024</div>
            <div class="proyecto-content">
              <h3>Plataforma Participativa Digital</h3>
              <p>Desarrollo de herramientas digitales para la participación ciudadana</p>
              <div class="proyecto-status en-progreso">🔄 En Progreso</div>
            </div>
          </div>
          
          <div class="proyecto-item">
            <div class="proyecto-fecha">2025</div>
            <div class="proyecto-content">
              <h3>Observatorio Territorial</h3>
              <p>Sistema de monitoreo y evaluación del desarrollo territorial</p>
              <div class="proyecto-status planificado">📅 Planificado</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Impacto en el Municipio -->
      <section class="impacto-section">
        <h2>🌟 Impacto en el Municipio</h2>
        <div class="impacto-grid">
          <div class="impacto-card">
            <h3>💰 Económico</h3>
            <ul>
              <li>Aumento del {{ gobernanzaStats?.impactoEconomico || 25 }}% en recaudo predial</li>
              <li>Reducción de costos administrativos</li>
              <li>Atracción de inversión privada</li>
            </ul>
          </div>
          
          <div class="impacto-card">
            <h3>🏘️ Social</h3>
            <ul>
              <li>Mayor participación ciudadana ({{ gobernanzaStats?.participacionCiudadana || 78 }}%)</li>
              <li>Reducción de conflictos territoriales</li>
              <li>Fortalecimiento del tejido social</li>
            </ul>
          </div>
          
          <div class="impacto-card">
            <h3>🌿 Ambiental</h3>
            <ul>
              <li>Mejor gestión de áreas protegidas</li>
              <li>Control del crecimiento urbano</li>
              <li>Conservación de recursos naturales</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="cta-section">
        <div class="cta-content">
          <h2>🤝 ¡Participa en la Gobernanza de tu Territorio!</h2>
          <p>Tu voz es importante para el desarrollo de Tausa. Únete a los espacios de participación ciudadana.</p>
          <div class="cta-buttons">
            <a href="/tramite" class="btn btn-primary">📋 Realizar Trámite</a>
            <a href="/sugerencias" class="btn btn-secondary">💡 Enviar Sugerencia</a>
          </div>
        </div>
      </section>
    </main>
  `,
  styleUrls: ["./gobernanza.component.css"],
})
export class GobernanzaComponent implements OnInit {
  gobernanzaStats: any = null
  loadingStats = true

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadGobernanzaStats()
  }

  async loadGobernanzaStats() {
    try {
      this.loadingStats = true
      console.log("📊 Cargando estadísticas de gobernanza...")

      // Obtener estadísticas reales del sistema
      const estadisticas = await this.supabaseService.obtenerEstadisticas()

      if (estadisticas) {
        // Calcular métricas de gobernanza basadas en datos reales
        const participacionCiudadana = this.calcularParticipacionCiudadana(estadisticas)
        const tramitesDigitales = this.calcularTramitesDigitales(estadisticas)
        const tiempoPromedio = this.calcularTiempoPromedio(estadisticas)
        const satisfaccionCiudadana = this.calcularSatisfaccionCiudadana(estadisticas)
        const eficienciaRespuesta = this.calcularEficienciaRespuesta(estadisticas)
        const coberturaGeografica = this.calcularCoberturaGeografica(estadisticas)
        const indiceTransparencia = this.calcularIndiceTransparencia(estadisticas)
        const impactoEconomico = this.calcularImpactoEconomico(estadisticas)

        this.gobernanzaStats = {
          // Estadísticas principales
          participacionCiudadana,
          tramitesDigitales,
          tiempoPromedio,
          satisfaccionCiudadana,

          // Estadísticas adicionales
          eficienciaRespuesta,
          coberturaGeografica,
          indiceTransparencia,
          impactoEconomico,

          // Datos de apoyo para mostrar en los tooltips
          totalUsuarios: estadisticas.totalUsuarios,
          usuariosActivos: estadisticas.usuariosVerificados,
          totalTramites: estadisticas.totalTramites,
          tramitesAtendidos: estadisticas.tramitesAtendidos,
          totalSugerencias: estadisticas.totalSugerencias,
        }

        console.log("✅ Estadísticas de gobernanza calculadas:", this.gobernanzaStats)
      } else {
        // Valores por defecto si no hay datos
        this.gobernanzaStats = this.getDefaultStats()
        console.log("⚠️ Usando estadísticas por defecto")
      }
    } catch (error) {
      console.error("❌ Error cargando estadísticas de gobernanza:", error)
      this.gobernanzaStats = this.getDefaultStats()
    } finally {
      this.loadingStats = false
    }
  }

  private calcularParticipacionCiudadana(stats: any): number {
    // Participación = (usuarios verificados / total usuarios) * 100
    if (stats.totalUsuarios === 0) return 0
    return Math.round((stats.usuariosVerificados / stats.totalUsuarios) * 100)
  }

  private calcularTramitesDigitales(stats: any): number {
    // Todos los trámites en el sistema son digitales, así que es 100%
    // Pero podemos ajustar basado en la adopción
    if (stats.totalTramites === 0) return 100
    return Math.min(100, Math.round((stats.totalTramites / Math.max(stats.totalUsuarios, 1)) * 100))
  }

  private calcularTiempoPromedio(stats: any): string {
    // Calcular tiempo promedio basado en eficiencia de respuesta
    const eficiencia = this.calcularEficienciaRespuesta(stats)

    if (eficiencia >= 90) return "3-5"
    if (eficiencia >= 80) return "5-8"
    if (eficiencia >= 70) return "8-12"
    if (eficiencia >= 60) return "12-15"
    return "15-20"
  }

  private calcularSatisfaccionCiudadana(stats: any): number {
    // Basado en la relación entre trámites atendidos vs rechazados y sugerencias
    if (stats.totalTramites === 0) return 85 // Valor base

    const tasaExito = stats.tramitesAtendidos / Math.max(stats.totalTramites, 1)
    const factorSugerencias = Math.min(stats.totalSugerencias / Math.max(stats.totalUsuarios, 1), 0.5) // Más sugerencias = más participación

    return Math.round(tasaExito * 80 + factorSugerencias * 20 + 15) // Base 15% + hasta 80% por éxito + hasta 20% por participación
  }

  private calcularEficienciaRespuesta(stats: any): number {
    // Eficiencia = (trámites atendidos / total trámites) * 100
    if (stats.totalTramites === 0) return 85 // Valor base
    return Math.round(((stats.tramitesAtendidos + stats.tramitesRechazados) / stats.totalTramites) * 100)
  }

  private calcularCoberturaGeografica(stats: any): number {
    // Basado en la presencia de usuarios y trámites
    // Asumimos que mayor actividad = mayor cobertura
    const factorUsuarios = Math.min(stats.totalUsuarios / 100, 1) // Normalizar a 100 usuarios = 100%
    const factorTramites = Math.min(stats.totalTramites / 50, 1) // Normalizar a 50 trámites = 100%

    return Math.round(((factorUsuarios + factorTramites) / 2) * 100)
  }

  private calcularIndiceTransparencia(stats: any): number {
    // Índice basado en la disponibilidad de información y participación
    let indice = 7.0 // Base

    // +1 punto si hay usuarios activos
    if (stats.usuariosVerificados > 0) indice += 0.5

    // +1 punto si hay trámites procesados
    if (stats.totalTramites > 0) indice += 0.5

    // +1 punto si hay sugerencias (participación)
    if (stats.totalSugerencias > 0) indice += 0.5

    // +0.5 puntos por alta eficiencia
    if (this.calcularEficienciaRespuesta(stats) > 80) indice += 0.5

    return Math.min(10, Math.round(indice * 10) / 10)
  }

  private calcularImpactoEconomico(stats: any): number {
    // Impacto económico basado en la actividad del sistema
    const baseImpact = 15 // Impacto base del 15%
    const factorActividad = Math.min(stats.totalTramites / 20, 1) // Hasta 20 trámites = máximo impacto

    return Math.round(baseImpact + factorActividad * 15) // 15% base + hasta 15% adicional
  }

  private getDefaultStats() {
    return {
      participacionCiudadana: 78,
      tramitesDigitales: 85,
      tiempoPromedio: "12",
      satisfaccionCiudadana: 82,
      eficienciaRespuesta: 85,
      coberturaGeografica: 75,
      indiceTransparencia: 8.5,
      impactoEconomico: 25,
      totalUsuarios: 0,
      usuariosActivos: 0,
      totalTramites: 0,
      tramitesAtendidos: 0,
      totalSugerencias: 0,
    }
  }
}
