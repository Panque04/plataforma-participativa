import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, Router } from "@angular/router"
import { Subscription } from "rxjs"
import { SupabaseService, Usuario } from "../../services/supabase.service"

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="header-container">
        <!-- Logo y título -->
        <div class="header-left">
          <img src="/assets/images/EscudoUD.png" alt="Escudo UD" class="logo" />
          <div class="title-section">
            <h1 class="main-title">Sistema Catastral</h1>
            <p class="subtitle">Municipio de Tausa</p>
          </div>
        </div>

        <!-- Navegación principal -->
        <nav class="main-nav">
          <a routerLink="/home" routerLinkActive="active" class="nav-link">
            <i class="icon">🏠</i>
            <span>Inicio</span>
          </a>
          <a routerLink="/tramite" routerLinkActive="active" class="nav-link">
            <i class="icon">📋</i>
            <span>Trámites</span>
          </a>
          <a routerLink="/geovisor" routerLinkActive="active" class="nav-link">
            <i class="icon">🗺️</i>
            <span>Geovisor</span>
          </a>
          <a routerLink="/estadisticos" routerLinkActive="active" class="nav-link">
            <i class="icon">📊</i>
            <span>Estadísticas</span>
          </a>
          <a routerLink="/gobernanza" routerLinkActive="active" class="nav-link">
            <i class="icon">🏛️</i>
            <span>Gobernanza</span>
          </a>
          <a routerLink="/sugerencias" routerLinkActive="active" class="nav-link">
            <i class="icon">💡</i>
            <span>Sugerencias</span>
          </a>
        </nav>

        <!-- Sección de usuario -->
        <div class="header-right">
          <!-- Usuario logueado -->
          <div *ngIf="currentUser" class="user-section">
            <div class="user-info">
              <img
                [src]="currentUser.foto_perfil || '/assets/images/default-avatar.png'"
                [alt]="currentUser.nombres"
                class="user-avatar"
                (error)="onImageError($event)"
              />
              <div class="user-details">
                <span class="user-name">{{ currentUser.nombres }} {{ currentUser.apellidos }}</span>
                <span class="user-role" [class.admin]="isAdmin">
                  {{ isAdmin ? "👑 Administrador" : "👤 Usuario" }}
                </span>
              </div>
            </div>

            <!-- Menú desplegable -->
            <div class="user-menu" [class.show]="showUserMenu">
              <button class="menu-toggle" (click)="toggleUserMenu()">
                <i class="icon">⚙️</i>
              </button>

              <div class="dropdown-menu" *ngIf="showUserMenu">
                <a routerLink="/perfil" class="dropdown-item" (click)="closeUserMenu()">
                  <i class="icon">👤</i>
                  <span>Mi Perfil</span>
                </a>
                <a routerLink="/admin" *ngIf="isAdmin" class="dropdown-item" (click)="closeUserMenu()">
                  <i class="icon">⚙️</i>
                  <span>Panel Admin</span>
                </a>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item logout-btn" (click)="logout()">
                  <i class="icon">🚪</i>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Usuario no logueado -->
          <div *ngIf="!currentUser" class="auth-section">
            <a routerLink="/login" class="auth-link login-btn">
              <i class="icon">🔐</i>
              <span>Iniciar Sesión</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Menú móvil -->
      <div class="mobile-menu" [class.show]="showMobileMenu">
        <button class="mobile-toggle" (click)="toggleMobileMenu()">
          <span class="hamburger"></span>
        </button>

        <nav class="mobile-nav" *ngIf="showMobileMenu">
          <a routerLink="/home" routerLinkActive="active" class="mobile-nav-link" (click)="closeMobileMenu()">
            <i class="icon">🏠</i>
            <span>Inicio</span>
          </a>
          <a routerLink="/tramite" routerLinkActive="active" class="mobile-nav-link" (click)="closeMobileMenu()">
            <i class="icon">📋</i>
            <span>Trámites</span>
          </a>
          <a routerLink="/geovisor" routerLinkActive="active" class="mobile-nav-link" (click)="closeMobileMenu()">
            <i class="icon">🗺️</i>
            <span>Geovisor</span>
          </a>
          <a routerLink="/estadisticos" routerLinkActive="active" class="mobile-nav-link" (click)="closeMobileMenu()">
            <i class="icon">📊</i>
            <span>Estadísticas</span>
          </a>
          <a routerLink="/gobernanza" routerLinkActive="active" class="mobile-nav-link" (click)="closeMobileMenu()">
            <i class="icon">🏛️</i>
            <span>Gobernanza</span>
          </a>
          <a routerLink="/sugerencias" routerLinkActive="active" class="mobile-nav-link" (click)="closeMobileMenu()">
            <i class="icon">💡</i>
            <span>Sugerencias</span>
          </a>

          <div class="mobile-divider"></div>

          <div *ngIf="currentUser" class="mobile-user-section">
            <a routerLink="/perfil" class="mobile-nav-link" (click)="closeMobileMenu()">
              <i class="icon">👤</i>
              <span>Mi Perfil</span>
            </a>
            <a routerLink="/admin" *ngIf="isAdmin" class="mobile-nav-link" (click)="closeMobileMenu()">
              <i class="icon">⚙️</i>
              <span>Panel Admin</span>
            </a>
            <button class="mobile-nav-link logout-btn" (click)="logout()">
              <i class="icon">🚪</i>
              <span>Cerrar Sesión</span>
            </button>
          </div>

          <div *ngIf="!currentUser" class="mobile-auth-section">
            <a routerLink="/login" class="mobile-nav-link" (click)="closeMobileMenu()">
              <i class="icon">🔐</i>
              <span>Iniciar Sesión</span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  `,
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: Usuario | null = null
  isAdmin = false
  showUserMenu = false
  showMobileMenu = false
  private userSubscription?: Subscription

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
  ) {}

  ngOnInit() {
    // CORREGIDO: Suscribirse a cambios del usuario
    this.userSubscription = this.supabaseService.currentUser$.subscribe((user) => {
      console.log("🔄 Header: Usuario actualizado:", user?.email || "Sin usuario")
      this.currentUser = user
      this.isAdmin = this.supabaseService.isAdmin()
    })

    // Cerrar menús al hacer clic fuera
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement
      if (!target.closest(".user-menu") && !target.closest(".mobile-menu")) {
        this.showUserMenu = false
        this.showMobileMenu = false
      }
    })
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe()
    }
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu
    this.showMobileMenu = false
  }

  closeUserMenu() {
    this.showUserMenu = false
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu
    this.showUserMenu = false
  }

  closeMobileMenu() {
    this.showMobileMenu = false
  }

  onImageError(event: any) {
    event.target.src = "/assets/images/default-avatar.png"
  }

  async logout() {
    try {
      console.log("🚪 Cerrando sesión desde header...")
      await this.supabaseService.logout()
      this.closeUserMenu()
      this.closeMobileMenu()
      this.router.navigate(["/home"])
      console.log("✅ Sesión cerrada exitosamente")
    } catch (error) {
      console.error("❌ Error cerrando sesión:", error)
    }
  }
}
