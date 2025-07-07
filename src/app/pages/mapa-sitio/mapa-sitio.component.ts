import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"

@Component({
  selector: "app-mapa-sitio",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="mapa-sitio-container">
      <!-- Header -->
      <div class="mapa-sitio-header">
        <h1>🗺️ Mapa del Sitio</h1>
        <p>Navegación completa de la Plataforma Participativa de Catastro Tausa</p>
      </div>

      <!-- Navegación Principal -->
      <section class="navegacion-principal">
        <h2>🏠 Navegación Principal</h2>
        <div class="sitemap-grid">
          <div class="sitemap-section">
            <h3>📍 Páginas Principales</h3>
            <ul class="sitemap-list">
              <li><a routerLink="/">🏠 Inicio</a></li>
              <li><a routerLink="/geovisor">🗺️ Geovisor</a></li>
              <li><a routerLink="/tramite">📋 Trámites</a></li>
              <li><a routerLink="/estadisticos">📊 Estadísticos</a></li>
              <li><a routerLink="/gobernanza">🏛️ Gobernanza Territorial</a></li>
              <li><a routerLink="/sugerencias">💡 Sugerencias</a></li>
            </ul>
          </div>

          <div class="sitemap-section">
            <h3>👤 Usuario</h3>
            <ul class="sitemap-list">
              <li><a routerLink="/login">🔐 Iniciar Sesión</a></li>
              <li><a routerLink="/perfil">👤 Mi Perfil</a></li>
              <li><span class="disabled">📧 Verificación de Email</span></li>
              <li><span class="disabled">🔑 Recuperar Contraseña</span></li>
            </ul>
          </div>

          <div class="sitemap-section">
            <h3>👑 Administración</h3>
            <ul class="sitemap-list">
              <li><a routerLink="/admin">🛠️ Panel de Administración</a></li>
              <li><span class="disabled">📋 Gestión de Trámites</span></li>
              <li><span class="disabled">📁 Gestión de GeoJSON</span></li>
              <li><span class="disabled">👥 Gestión de Usuarios</span></li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Funcionalidades por Sección -->
      <section class="funcionalidades-detalle">
        <h2>⚙️ Funcionalidades Detalladas</h2>
        
        <div class="funcionalidad-card">
          <h3>🏠 Página de Inicio</h3>
          <div class="funcionalidad-content">
            <div class="funcionalidad-descripcion">
              <p>Página principal con información general del municipio y la plataforma</p>
            </div>
            <div class="funcionalidad-items">
              <ul>
                <li>Información del municipio de Tausa</li>
                <li>Descripción de la plataforma</li>
                <li>Enlaces a secciones principales</li>
                <li>Resumen de estadísticos</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="funcionalidad-card">
          <h3>🗺️ Geovisor</h3>
          <div class="funcionalidad-content">
            <div class="funcionalidad-descripcion">
              <p>Herramienta interactiva para visualizar información geográfica del territorio</p>
            </div>
            <div class="funcionalidad-items">
              <ul>
                <li>Visualización de mapas base (OpenStreetMap, Satélite)</li>
                <li>Capas temáticas (GeoJSON, límites municipales)</li>
                <li>Herramientas de medición de distancias</li>
                <li>Búsqueda por folio de matrícula o cédula catastral</li>
                <li>Información detallada de predios</li>
                <li>Gestión de archivos GeoJSON (solo administradores)</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="funcionalidad-card">
          <h3>📋 Trámites Catastrales</h3>
          <div class="funcionalidad-content">
            <div class="funcionalidad-descripcion">
              <p>Sistema para gestionar solicitudes de trámites catastrales</p>
            </div>
            <div class="funcionalidad-items">
              <ul>
                <li>Desenglobe de predios</li>
                <li>Englobe de predios</li>
                <li>División predial</li>
                <li>Fusión de predios</li>
                <li>Modificaciones catastrales</li>
                <li>Actualización catastral</li>
                <li>Seguimiento de estado de trámites</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="funcionalidad-card">
          <h3>📊 Estadísticos</h3>
          <div class="funcionalidad-content">
            <div class="funcionalidad-descripcion">
              <p>Visualización de datos estadísticos en tiempo real</p>
            </div>
            <div class="funcionalidad-items">
              <ul>
                <li>Usuarios registrados y verificados</li>
                <li>Distribución por género</li>
                <li>Trámites pendientes y atendidos</li>
                <li>Progreso de trámites</li>
                <li>Actualización automática cada 30 segundos</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="funcionalidad-card">
          <h3>🏛️ Gobernanza Territorial</h3>
          <div class="funcionalidad-content">
            <div class="funcionalidad-descripcion">
              <p>Información sobre la gestión participativa del territorio</p>
            </div>
            <div class="funcionalidad-items">
              <ul>
                <li>Principios de gobernanza</li>
                <li>Indicadores de gestión territorial</li>
                <li>Instrumentos de gobernanza</li>
                <li>Proyectos estratégicos</li>
                <li>Impacto en el municipio</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="funcionalidad-card">
          <h3>💡 Sugerencias</h3>
          <div class="funcionalidad-content">
            <div class="funcionalidad-descripcion">
              <p>Sistema para recibir y gestionar sugerencias de mejora</p>
            </div>
            <div class="funcionalidad-items">
              <ul>
                <li>Formulario de envío de sugerencias</li>
                <li>Categorización por tipo</li>
                <li>Visualización de sugerencias de la comunidad</li>
                <li>Filtros por categoría</li>
                <li>Estadísticas de sugerencias</li>
                <li>Estados de seguimiento</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="funcionalidad-card">
          <h3>👤 Perfil de Usuario</h3>
          <div class="funcionalidad-content">
            <div class="funcionalidad-descripcion">
              <p>Gestión completa del perfil personal</p>
            </div>
            <div class="funcionalidad-items">
              <ul>
                <li>Visualización de información personal</li>
                <li>Edición de datos del perfil</li>
                <li>Cambio de contraseña</li>
                <li>Subida de foto de perfil</li>
                <li>Indicador de rol (Usuario/Administrador)</li>
                <li>Estadísticas personales de trámites</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="funcionalidad-card">
          <h3>🛠️ Panel de Administración</h3>
          <div class="funcionalidad-content">
            <div class="funcionalidad-descripcion">
              <p>Herramientas exclusivas para administradores</p>
            </div>
            <div class="funcionalidad-items">
              <ul>
                <li>Gestión de trámites pendientes</li>
                <li>Aprobación/rechazo de solicitudes</li>
                <li>Visualización detallada de trámites</li>
                <li>Estadísticas administrativas</li>
                <li>Gestión de archivos GeoJSON</li>
                <li>Subida de capas geográficas</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Información Técnica -->
      <section class="info-tecnica">
        <h2>💻 Información Técnica</h2>
        <div class="tech-grid">
          <div class="tech-card">
            <h3>🔧 Tecnologías Utilizadas</h3>
            <ul>
              <li>Angular 19</li>
              <li>TypeScript</li>
              <li>Supabase (Base de datos)</li>
              <li>Leaflet (Mapas)</li>
              <li>CSS3 con Flexbox/Grid</li>
            </ul>
          </div>
          
          <div class="tech-card">
            <h3>🔐 Seguridad</h3>
            <ul>
              <li>Autenticación de usuarios</li>
              <li>Verificación de email</li>
              <li>Roles de usuario</li>
              <li>Protección de rutas</li>
              <li>Recuperación de contraseña</li>
            </ul>
          </div>
          
          <div class="tech-card">
            <h3>📱 Características</h3>
            <ul>
              <li>Diseño responsive</li>
              <li>Interfaz intuitiva</li>
              <li>Tiempo real</li>
              <li>Accesibilidad</li>
              <li>Optimización de rendimiento</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Contacto y Soporte -->
      <section class="contacto-soporte">
        <h2>📞 Contacto y Soporte</h2>
        <div class="contacto-grid">
          <div class="contacto-card">
            <h3>🏛️ Alcaldía de Tausa</h3>
            <p>📍 Calle 41 B Sur, Tausa, Colombia</p>
            <p>📞 +57 (601) 881-7890</p>
            <p>📧 alcaldia&#64;tausa-cundinamarca.gov.co</p>
          </div>
          
          <div class="contacto-card">
            <h3>🕒 Horarios de Atención</h3>
            <p>📅 Lunes a Viernes: 8:00 AM - 5:00 PM</p>
            <p>📅 Sábado: 9:00 AM - 1:00 PM</p>
            <p>📅 Domingo: Cerrado</p>
          </div>
          
          <div class="contacto-card">
            <h3>💻 Soporte Técnico</h3>
            <p>📧 soporte&#64;entidad.com</p>
            <p>📧 techsoporte&#64;entidad.com</p>
            <p>🔗 <a routerLink="/sugerencias">Enviar Sugerencia</a></p>
          </div>
        </div>
      </section>
    </main>
  `,
  styleUrls: ["./mapa-sitio.component.css"],
})
export class MapaSitioComponent {}
