import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, Router } from "@angular/router"
import { Subscription } from "rxjs"
import { SupabaseService } from "../../services/supabase.service"

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Barra Superior Azul -->
    <div class="top-bar">
      <div class="container">
        <div class="top-left">
          <img src="/assets/images/IGAC.png" alt="IGAC" height="40">
        </div>
        <div class="top-center">
          <span>El Catastro es de todos, ¡Hagamos que Funcione!</span>
        </div>
        <div class="top-right">
          <span>GOV.CO</span>
        </div>
      </div>
    </div>

    <!-- Header Principal Blanco -->
    <div class="main-header">
      <div class="container">
        <div class="logo-section">
          <div class="left-logo">
            <img src="/assets/images/EscudoUD.png" alt="Universidad Distrital" height="80">
          </div>
          <div class="tausa-logo">
            <span>PLATAFORMA PARTICIPATIVA</span>
          </div>
          <div class="right-logo">
            <img src="/assets/images/AlcaldiaTausa.jpg" alt="Alcaldía de Tausa" height="60">
            <span>TAUSA</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Barra de Navegación Azul -->
    <div class="nav-bar">
      <div class="container">
        <div class="nav-title">Catastro Tausa</div>
        <nav>
          <ul>
            <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Inicio</a></li>
            <li><a routerLink="/geovisor" routerLinkActive="active">Geovisor</a></li>
            <li><a routerLink="/tramite" routerLinkActive="active">Trámite</a></li>
            <li><a routerLink="/estadisticos" routerLinkActive="active">Estadísticos</a></li>
            <li><a routerLink="/gobernanza" routerLinkActive="active">Gobernanza</a></li>
            <li><a routerLink="/sugerencias" routerLinkActive="active">Sugerencias</a></li>
            <li><a routerLink="/instructivo" routerLinkActive="active">Instructivo</a></li>
            <li *ngIf="isLoggedIn"><a routerLink="/curso-gobernanza" routerLinkActive="active">Curso</a></li>
          </ul>
          
          <!-- Sección de Usuario/Login -->
          <div class="user-section">
            <!-- Usuario logueado -->
            <div *ngIf="isLoggedIn" class="user-dropdown">
              <div class="user-info" (click)="toggleDropdown()">
                <img 
                  [src]="getUserAvatar()" 
                  alt="Avatar" 
                  class="user-avatar"
                  [style.display]="'block'"
                  (error)="onAvatarError($event)">
                <span class="user-name">{{ getUserName() }}</span>
                <span class="dropdown-arrow" [class.rotated]="dropdownOpen">▼</span>
              </div>
              <div class="dropdown-menu" *ngIf="dropdownOpen">
                <a routerLink="/perfil" (click)="closeDropdown()">👤 Mi Perfil</a>
                <a routerLink="/tramite" (click)="closeDropdown()">📋 Mis Trámites</a>
                <a routerLink="/admin" *ngIf="isAdmin" (click)="closeDropdown()">🛠️ Administración</a>
                <button class="logout-btn" (click)="logout()">🚪 Cerrar Sesión</button>
              </div>
            </div>
            
            <!-- Usuario no logueado -->
            <a *ngIf="!isLoggedIn" routerLink="/login" routerLinkActive="active" class="login-btn">
              🔐 Iniciar Sesión
            </a>
          </div>
        </nav>
      </div>
    </div>
  `,
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false
  isAdmin = false
  currentUser: any = null
  dropdownOpen = false
  private userSubscription?: Subscription

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Suscribirse a cambios de usuario
    this.userSubscription = this.supabaseService.currentUser$.subscribe((user: any) => {
      console.log("Header: Usuario actualizado:", user)
      this.currentUser = user
      this.isLoggedIn = !!user
      this.isAdmin = user?.rol === "administrador"
    })

    // Cerrar dropdown al hacer click fuera
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement
      if (!target.closest(".user-dropdown")) {
        this.dropdownOpen = false
      }
    })
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe()
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen
  }

  closeDropdown() {
    this.dropdownOpen = false
  }

  getUserName(): string {
    if (!this.currentUser) return "Usuario"
    return this.currentUser.nombres || "Usuario"
  }

  getUserAvatar(): string {
    // Siempre retornar una imagen por defecto para evitar parpadeos
    if (this.currentUser?.foto_perfil && this.currentUser.foto_perfil.trim() !== "") {
      return this.currentUser.foto_perfil
    }
    return "/placeholder.svg?height=32&width=32"
  }

  onAvatarError(event: any) {
    // Evitar bucle infinito de errores
    if (event.target.src !== "/placeholder.svg?height=32&width=32") {
      event.target.src = "/placeholder.svg?height=32&width=32"
    }
  }

  async logout() {
    try {
      console.log("Header: Iniciando logout...")
      this.dropdownOpen = false

      // Limpiar estado local inmediatamente
      this.currentUser = null
      this.isLoggedIn = false
      this.isAdmin = false

      // Cerrar sesión en Supabase
      await this.supabaseService.logout()

      console.log("Header: Logout completado, redirigiendo...")
      this.router.navigate(["/"])
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      // Asegurar limpieza incluso si hay error
      this.currentUser = null
      this.isLoggedIn = false
      this.isAdmin = false
      this.router.navigate(["/"])
    }
  }
}
