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
          <img src="/placeholder.svg?height=300&width=400" alt="Gobernanza Territorial">
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

      <!-- Estadísticas de Gobernanza -->
      <section class="stats-gobernanza">
        <h2>📊 Indicadores de Gobernanza Territorial</h2>
        <div class="stats-grid" *ngIf="gobernanzaStats">
          <div class="stat-card participacion">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3>{{ gobernanzaStats.participacionCiudadana }}%</h3>
              <p>Participación Ciudadana</p>
              <small>En procesos de consulta territorial</small>
            </div>
          </div>
          
          <div class="stat-card transparencia">
            <div class="stat-icon">📋</div>
            <div class="stat-content">
              <h3>{{ gobernanzaStats.tramitesDigitales }}%</h3>
              <p>Trámites Digitalizados</p>
              <small>Procesos disponibles en línea</small>
            </div>
          </div>
          
          <div class="stat-card eficiencia">
            <div class="stat-icon">⚡</div>
            <div class="stat-content">
              <h3>{{ gobernanzaStats.tiempoPromedio }}</h3>
              <p>Tiempo Promedio</p>
              <small>Días para resolver trámites</small>
            </div>
          </div>
          
          <div class="stat-card satisfaccion">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <h3>{{ gobernanzaStats.satisfaccionCiudadana }}%</h3>
              <p>Satisfacción Ciudadana</p>
              <small>Con los servicios territoriales</small>
            </div>
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
              <li>Aumento del 25% en recaudo predial</li>
              <li>Reducción de costos administrativos</li>
              <li>Atracción de inversión privada</li>
            </ul>
          </div>
          
          <div class="impacto-card">
            <h3>🏘️ Social</h3>
            <ul>
              <li>Mayor participación ciudadana</li>
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

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadGobernanzaStats()
  }

  loadGobernanzaStats() {
    // Simular estadísticas de gobernanza
    this.gobernanzaStats = {
      participacionCiudadana: 78,
      tramitesDigitales: 85,
      tiempoPromedio: 12,
      satisfaccionCiudadana: 82,
    }
  }
}
