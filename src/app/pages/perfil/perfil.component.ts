import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { SupabaseService, Usuario } from "../../services/supabase.service"

@Component({
  selector: "app-perfil",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="perfil-container">
      <div class="perfil-header">
        <h2>👤 Mi Perfil</h2>
        <div class="user-role" [class.admin]="currentUser?.rol === 'administrador'">
          <span class="role-badge">
            {{ currentUser?.rol === 'administrador' ? '👑 Administrador' : '👤 Usuario' }}
          </span>
        </div>
      </div>

      <div class="perfil-content">
        <!-- Sección de Foto de Perfil -->
        <div class="profile-photo-section">
          <div class="photo-container">
            <img 
              [src]="currentUser?.foto_perfil || '/placeholder.svg?height=150&width=150'" 
              alt="Foto de perfil"
              class="profile-photo">
            <div class="photo-overlay" (click)="triggerFileInput()">
              <span>📷 Cambiar Foto</span>
            </div>
          </div>
          <input 
            type="file" 
            #fileInput 
            accept="image/*" 
            (change)="onPhotoSelected($event)"
            style="display: none;">
        </div>

        <!-- Información Personal -->
        <div class="info-section">
          <h3>📋 Información Personal</h3>
          
          <div class="info-tabs">
            <button 
              class="tab-btn" 
              [class.active]="activeTab === 'info'"
              (click)="setActiveTab('info')">
              ℹ️ Información
            </button>
            <button 
              class="tab-btn" 
              [class.active]="activeTab === 'edit'"
              (click)="setActiveTab('edit')">
              ✏️ Editar
            </button>
            <button 
              class="tab-btn" 
              [class.active]="activeTab === 'password'"
              (click)="setActiveTab('password')">
              🔒 Contraseña
            </button>
          </div>

          <!-- Tab de Información -->
          <div class="tab-content" *ngIf="activeTab === 'info'">
            <div class="info-grid">
              <div class="info-item">
                <label>🆔 Cédula:</label>
                <span>{{ currentUser?.cedula }}</span>
              </div>
              <div class="info-item">
                <label>👤 Nombres:</label>
                <span>{{ currentUser?.nombres }}</span>
              </div>
              <div class="info-item">
                <label>👤 Apellidos:</label>
                <span>{{ currentUser?.apellidos }}</span>
              </div>
              <div class="info-item">
                <label>📧 Email:</label>
                <span>{{ currentUser?.email }}</span>
              </div>
              <div class="info-item">
                <label>📱 Teléfono:</label>
                <span>{{ currentUser?.telefono || 'No especificado' }}</span>
              </div>
              <div class="info-item">
                <label>⚧ Género:</label>
                <span>{{ getGenderLabel(currentUser?.genero) }}</span>
              </div>
              <div class="info-item">
                <label>📅 Fecha de Registro:</label>
                <span>{{ currentUser?.fecha_registro | date:'medium' }}</span>
              </div>
              <div class="info-item">
                <label>✅ Email Verificado:</label>
                <span [class.verified]="currentUser?.email_verificado" [class.not-verified]="!currentUser?.email_verificado">
                  {{ currentUser?.email_verificado ? '✅ Verificado' : '❌ No verificado' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tab de Edición -->
          <div class="tab-content" *ngIf="activeTab === 'edit'">
            <form [formGroup]="editForm" (ngSubmit)="onUpdateProfile()">
              <div class="form-grid">
                <div class="form-group">
                  <label>👤 Nombres:</label>
                  <input type="text" class="form-control" formControlName="nombres" required>
                </div>
                <div class="form-group">
                  <label>👤 Apellidos:</label>
                  <input type="text" class="form-control" formControlName="apellidos" required>
                </div>
                <div class="form-group">
                  <label>📧 Email:</label>
                  <input type="email" class="form-control" formControlName="email" required>
                </div>
                <div class="form-group">
                  <label>📱 Teléfono:</label>
                  <input type="tel" class="form-control" formControlName="telefono">
                </div>
                <div class="form-group">
                  <label>⚧ Género:</label>
                  <select class="form-control" formControlName="genero">
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="no_identificado">Prefiero no decir</option>
                  </select>
                </div>
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="editForm.invalid || isUpdating">
                  {{ isUpdating ? 'Actualizando...' : '💾 Guardar Cambios' }}
                </button>
                <button type="button" class="btn btn-secondary" (click)="resetEditForm()">
                  🔄 Cancelar
                </button>
              </div>
            </form>
          </div>

          <!-- Tab de Contraseña -->
          <div class="tab-content" *ngIf="activeTab === 'password'">
            <div class="password-info">
              <p>Para cambiar tu contraseña, utiliza la opción "¿Olvidaste tu contraseña?" en la página de login.</p>
              <p>Se enviará un enlace de recuperación a tu email: <strong>{{ currentUser?.email }}</strong></p>
            </div>
          </div>

          <!-- Mensajes -->
          <div *ngIf="message" class="message" [class.success]="messageSuccess" [class.error]="!messageSuccess">
            {{ message }}
          </div>
        </div>

        <!-- Estadísticas del Usuario -->
        <div class="stats-section" *ngIf="userStats">
          <h3>📊 Mis Estadísticas</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📋</div>
              <div class="stat-info">
                <h4>{{ userStats.totalTramites }}</h4>
                <p>Trámites Enviados</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⏳</div>
              <div class="stat-info">
                <h4>{{ userStats.tramitesPendientes }}</h4>
                <p>Pendientes</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <h4>{{ userStats.tramitesAprobados }}</h4>
                <p>Aprobados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styleUrls: ["./perfil.component.css"],
})
export class PerfilComponent implements OnInit {
  currentUser: Usuario | null = null
  activeTab = "info"
  editForm: FormGroup
  message = ""
  messageSuccess = false
  isUpdating = false
  userStats: any = null

  constructor(
    private supabaseService: SupabaseService,
    private fb: FormBuilder,
  ) {
    this.editForm = this.fb.group({
      nombres: ["", Validators.required],
      apellidos: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      telefono: [""],
      genero: ["", Validators.required],
    })
  }

  ngOnInit() {
    this.loadUserData()
    this.loadUserStats()
  }

  loadUserData() {
    this.currentUser = this.supabaseService.getCurrentUser()
    if (this.currentUser) {
      this.editForm.patchValue({
        nombres: this.currentUser.nombres,
        apellidos: this.currentUser.apellidos,
        email: this.currentUser.email,
        telefono: this.currentUser.telefono,
        genero: this.currentUser.genero,
      })
    }
  }

  async loadUserStats() {
    const tramites = await this.supabaseService.obtenerTramitesUsuario()
    this.userStats = {
      totalTramites: tramites.length,
      tramitesPendientes: tramites.filter((t) => t.estado === "pendiente").length,
      tramitesAprobados: tramites.filter((t) => t.estado === "atendido").length,
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab
    this.message = ""
  }

  getGenderLabel(gender?: string): string {
    switch (gender) {
      case "masculino":
        return "Masculino"
      case "femenino":
        return "Femenino"
      case "no_identificado":
        return "Prefiero no decir"
      default:
        return "No especificado"
    }
  }

  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fileInput?.click()
  }

  async onPhotoSelected(event: any) {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.showMessage("La imagen debe ser menor a 5MB", false)
        return
      }

      const result = await this.supabaseService.subirFotoPerfil(file)
      this.showMessage(result.message, result.success)

      if (result.success) {
        // Recargar datos del usuario
        this.loadUserData()
      }
    }
  }

  async onUpdateProfile() {
    if (this.editForm.valid && !this.isUpdating) {
      this.isUpdating = true

      try {
        const formData = this.editForm.value
        const result = await this.supabaseService.actualizarPerfil(formData)

        this.showMessage(result.message, result.success)

        if (result.success) {
          this.loadUserData()
        }
      } catch (error) {
        this.showMessage("Error al actualizar el perfil", false)
      } finally {
        this.isUpdating = false
      }
    }
  }

  resetEditForm() {
    this.loadUserData()
    this.message = ""
  }

  private showMessage(text: string, success: boolean) {
    this.message = text
    this.messageSuccess = success

    setTimeout(() => {
      this.message = ""
    }, 3000)
  }
}
