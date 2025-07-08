import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { interval, type Subscription } from "rxjs"

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main>
      <!-- CARRUSEL DE IMÁGENES -->
      <section class="carousel-section">
        <h2 style="font-style: oblique; text-align: center; margin-bottom: 20px;">
          Galería de Imágenes - Tausa
        </h2>
        <div class="carousel-container">
          <div class="carousel-wrapper">
            <div 
              class="carousel-slide" 
              *ngFor="let image of images; let i = index"
              [class.active]="i === currentSlide"
            >
              <img [src]="image.src" [alt]="image.alt" />
              <div class="carousel-caption">
                <h3>{{ image.title }}</h3>
                <p>{{ image.description }}</p>
              </div>
            </div>
          </div>
          
          <!-- Controles del carrusel -->
          <button class="carousel-btn prev" (click)="previousSlide()">❮</button>
          <button class="carousel-btn next" (click)="nextSlide()">❯</button>
          
          <!-- Indicadores -->
          <div class="carousel-indicators">
            <button 
              *ngFor="let image of images; let i = index"
              class="indicator"
              [class.active]="i === currentSlide"
              (click)="goToSlide(i)"
            ></button>
          </div>
        </div>
      </section>

      <!-- INFORMACIÓN DEL MUNICIPIO -->
      <section class="municipio-section">
        <div class="container">
          <h2 class="section-title">🏛️ Municipio de Tausa</h2>
          
          <div class="municipio-content">
            <div class="municipio-image">
              <img 
                src="assets/images/inicio.png"
                alt="Vista panorámica de Tausa"
                class="municipio-img"
              />
            </div>
            
            <div class="municipio-text">
              <p>
                El municipio de Tausa se encuentra en el departamento de Cundinamarca,
                en la provincia de Ubaté. Conocido por su rica historia y paisajes
                naturales, Tausa cuenta con un territorio que combina áreas urbanas,
                rurales y zonas de alta importancia ecológica.
              </p>
              
              <p>
                Su economía tradicional está basada en la agricultura, la ganadería y 
                la explotación de recursos naturales, como las minas de carbón. Tausa 
                también es hogar de importantes recursos hídricos y zonas de conservación 
                que requieren una gestión adecuada para su preservación.
              </p>

              <div class="municipio-stats">
                <div class="stat-item">
                  <span class="stat-number">15,407</span>
                  <span class="stat-label">Habitantes</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">208</span>
                  <span class="stat-label">km² de área</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">2,650</span>
                  <span class="stat-label">msnm altitud</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- INFORMACIÓN DE LA PLATAFORMA -->
      <section class="plataforma-section">
        <div class="container">
          <h2 class="section-title">💻 Sobre la Plataforma</h2>
          
          <div class="plataforma-content">
            <div class="plataforma-image">
              <img
                src="assets/images/Plataforma.jpg"
                alt="Plataforma Participativa"
                class="plataforma-img"
              />
            </div>
            
            <div class="plataforma-text">
              <p>
                La Plataforma Participativa de Catastro Multipropósito ofrece a los
                usuarios herramientas clave para explorar el territorio, gestionar
                trámites y acceder a información estadística sobre el uso del suelo.
              </p>
              
              <div class="features-list">
                <div class="feature-item">
                  <span class="feature-icon">🗺️</span>
                  <div>
                    <strong>Geovisor Interactivo:</strong>
                    <p>Navega mapas interactivos, consulta detalles de parcelas y activa capas geográficas.</p>
                  </div>
                </div>
                
                <div class="feature-item">
                  <span class="feature-icon">📋</span>
                  <div>
                    <strong>Gestión de Trámites:</strong>
                    <p>Realiza trámites catastrales en línea con seguimiento en tiempo real.</p>
                  </div>
                </div>
                
                <div class="feature-item">
                  <span class="feature-icon">📊</span>
                  <div>
                    <strong>Estadísticas Territoriales:</strong>
                    <p>Accede a datos sobre cambios en la cobertura del suelo y dinámicas territoriales.</p>
                  </div>
                </div>
                
                <div class="feature-item">
                  <span class="feature-icon">💡</span>
                  <div>
                    <strong>Sistema de Sugerencias:</strong>
                    <p>Contribuye al mejoramiento de la gobernanza territorial con tus ideas.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ENLACE A ESTADÍSTICAS -->
      <section class="stats-link-section">
        <div class="container">
          <div class="stats-cta">
            <h3>📊 Explora las Estadísticas del Territorio</h3>
            <p>Descubre datos actualizados sobre el desarrollo territorial de Tausa</p>
            <a routerLink="/estadisticos" class="cta-button">Ver Estadísticas Completas</a>
          </div>
        </div>
      </section>
    </main>
  `,
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit, OnDestroy {
  // Variables del carrusel
  currentSlide = 0
  private carouselSubscription?: Subscription

  // Array de imágenes del proyecto
  images = [
    {
      src: "assets/images/Tausa.jpg",
      alt: "Paisaje de Tausa",
      title: "Municipio de Tausa",
      description: "Hermosos paisajes naturales del municipio de Tausa, Cundinamarca",
    },
    {
      src: "assets/images/inicio.png",
      alt: "Vista panorámica",
      title: "Vista Panorámica",
      description: "Vista general del territorio y sus características geográficas",
    },
    {
      src: "assets/images/Plataforma.jpg",
      alt: "Plataforma Catastral",
      title: "Plataforma Participativa",
      description: "Sistema integral de gestión catastral multipropósito",
    },
    {
      src: "assets/images/IGAC.png",
      alt: "IGAC",
      title: "Instituto Geográfico Agustín Codazzi",
      description: "Entidad rectora de la información geográfica oficial de Colombia",
    },
    {
      src: "assets/images/EscudoUD.png",
      alt: "Universidad Distrital",
      title: "Universidad Distrital",
      description: "Institución educativa comprometida con el desarrollo territorial",
    },
    {
      src: "assets/images/AlcaldiaTausa.jpg",
      alt: "Alcaldía de Tausa",
      title: "Alcaldía Municipal",
      description: "Gobierno local comprometido con la modernización catastral",
    },
  ]

  ngOnInit() {
    // Iniciar carrusel automático
    this.startCarousel()
  }

  ngOnDestroy() {
    // Limpiar suscripción del carrusel
    if (this.carouselSubscription) {
      this.carouselSubscription.unsubscribe()
    }
  }

  /**
   * Iniciar carrusel automático
   */
  startCarousel() {
    this.carouselSubscription = interval(5000).subscribe(() => {
      this.nextSlide()
    })
  }

  /**
   * Ir a la siguiente diapositiva
   */
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.images.length
  }

  /**
   * Ir a la diapositiva anterior
   */
  previousSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.images.length - 1 : this.currentSlide - 1
  }

  /**
   * Ir a diapositiva específica
   */
  goToSlide(index: number) {
    this.currentSlide = index
  }
}
