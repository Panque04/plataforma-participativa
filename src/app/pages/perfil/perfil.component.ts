import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { Subscription } from "rxjs"
import { SupabaseService, Usuario } from "../../services/supabase.service"

@Component({
  selector: "app-perfil",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="perfil-container">
      <div class="perfil-header">
        <h2>👤 Mi Perfil</h2>
        <p>Gestiona tu información personal y configuración de cuenta</p>
      </div>

      <div class="perfil-layout">
        <!-- SECCIÓN IZQUIERDA: FOTO Y DATOS BÁSICOS -->
        <div class="perfil-section">
          <div class="section-header">
            <span class="section-icon">👤</span>
            <h3>Información Personal</h3>
          </div>

          <!-- Foto de Perfil -->
          <div class="foto-perfil-section">
            <div class="foto-perfil-container">
              <img 
                [src]="getProfileImageUrl()" 
                [alt]="getFullName()"
                class="foto-perfil"
                [style.opacity]="isUploadingPhoto ? '0.5' : '1'"
                [style.display]="'block'"
                (error)="onImageError($event)">
              <button 
                class="cambiar-foto-btn" 
                (click)="triggerFileInput()"
                [disabled]="isUploadingPhoto"
                title="Cambiar foto de perfil">
                {{ isUploadingPhoto ? '⏳' : '📷' }}
              </button>
            </div>
            <input 
              type="file" 
              #fileInput 
              class="file-input"
              accept="image/*" 
              (change)="onFileSelected($event)">
          </div>

          <!-- Datos Personales -->
          <div class="datos-personales" *ngIf="currentUser && !editMode">
            <div class="form-group">
              <label>👤 Nombres</label>
              <input type="text" class="form-control" [value]="currentUser.nombres" disabled>
            </div>
            
            <div class="form-group">
              <label>👤 Apellidos</label>
              <input type="text" class="form-control" [value]="currentUser.apellidos" disabled>
            </div>
            
            <div class="form-group">
              <label>🆔 Cédula</label>
              <input type="text" class="form-control" [value]="currentUser.cedula" disabled>
            </div>
            
            <div class="form-group">
              <label>📧 Email</label>
              <input type="email" class="form-control" [value]="currentUser.email" disabled>
            </div>
            
            <div class="form-group">
              <label>📱 Teléfono</label>
              <input type="tel" class="form-control" [value]="currentUser.telefono || 'No especificado'" disabled>
            </div>
            
            <div class="form-group">
              <label>⚧ Género</label>
              <input type="text" class="form-control" [value]="getGenderLabel(currentUser.genero)" disabled>
            </div>
            
            <div class="form-group">
              <label>👑 Rol</label>
              <input type="text" class="form-control" [value]="getRoleLabel(currentUser.rol)" disabled>
            </div>
            
            <div class="form-group">
              <label>📅 Fecha de Registro</label>
              <input type="text" class="form-control" [value]="formatDate(currentUser.fecha_registro)" disabled>
            </div>

            <button class="btn btn-primary" (click)="toggleEditMode()">
              ✏️ Editar Información
            </button>
          </div>

          <!-- Formulario de Edición -->
          <div class="datos-personales" *ngIf="editMode">
            <form [formGroup]="perfilForm" (ngSubmit)="onUpdatePerfil()">
              <div class="form-group">
                <label for="nombres">👤 Nombres *</label>
                <input type="text" id="nombres" class="form-control" formControlName="nombres" required>
              </div>
              
              <div class="form-group">
                <label for="apellidos">👤 Apellidos *</label>
                <input type="text" id="apellidos" class="form-control" formControlName="apellidos" required>
              </div>
              
              <div class="form-group">
                <label for="telefono">📱 Teléfono</label>
                <input type="tel" id="telefono" class="form-control" formControlName="telefono">
              </div>
              
              <div class="form-group">
                <label for="genero">⚧ Género</label>
                <select id="genero" class="form-control" formControlName="genero">
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="no_identificado">Prefiero no decir</option>
                </select>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="perfilForm.invalid || isUpdating">
                  {{ isUpdating ? '💾 Guardando...' : '💾 Guardar Cambios' }}
                </button>
                <button type="button" class="btn btn-secondary" (click)="cancelEdit()">
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>

          <div *ngIf="updateMessage" class="message" [class.success]="updateSuccess" [class.error]="!updateSuccess">
            {{ updateMessage }}
          </div>
        </div>

        <!-- SECCIÓN DERECHA: ESTADÍSTICAS Y CAMBIO DE CONTRASEÑA -->
        <div class="perfil-section">
          <div class="section-header">
            <span class="section-icon">📊</span>
            <h3>Mis Estadísticas</h3>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ userStats.totalTramites }}</div>
              <div class="stat-label">Trámites Totales</div>
            </div>

            <div class="stat-card">
              <div class="stat-number">{{ userStats.tramitesPendientes }}</div>
              <div class="stat-label">Pendientes</div>
            </div>

            <div class="stat-card">
              <div class="stat-number">{{ userStats.tramitesAtendidos }}</div>
              <div class="stat-label">Atendidos</div>
            </div>

            <div class="stat-card">
              <div class="stat-number">{{ userStats.diasRegistrado }}</div>
              <div class="stat-label">Días Registrado</div>
            </div>
          </div>

          <!-- Cambio de Contraseña -->
          <div class="password-section">
            <h4>🔐 Cambiar Contraseña</h4>
            
            <div *ngIf="!passwordMode">
              <button class="btn btn-secondary" (click)="togglePasswordMode()">
                🔑 Cambiar Contraseña
              </button>
            </div>

            <div *ngIf="passwordMode">
              <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()">
                <div class="form-group">
                  <label for="newPassword">🔐 Nueva Contraseña *</label>
                  <input type="password" id="newPassword" class="form-control" formControlName="newPassword" required>
                  <small>Mínimo 6 caracteres</small>
                </div>

                <div class="form-group">
                  <label for="confirmPassword">🔐 Confirmar Contraseña *</label>
                  <input type="password" id="confirmPassword" class="form-control" formControlName="confirmPassword" required>
                </div>

                <div *ngIf="passwordForm.errors?.['passwordMismatch']" class="message error">
                  Las contraseñas no coinciden
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn btn-primary" [disabled]="passwordForm.invalid || isChangingPassword">
                    {{ isChangingPassword ? '🔄 Cambiando...' : '🔑 Cambiar Contraseña' }}
                  </button>
                  <button type="button" class="btn btn-secondary" (click)="cancelPasswordChange()">
                    ❌ Cancelar
                  </button>
                </div>
              </form>
            </div>

            <div *ngIf="passwordMessage" class="message" [class.success]="passwordSuccess" [class.error]="!passwordSuccess">
              {{ passwordMessage }}
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styleUrls: ["./perfil.component.css"],
})
export class PerfilComponent implements OnInit, OnDestroy {
  currentUser: Usuario | null = null
  editMode = false
  passwordMode = false
  perfilForm: FormGroup
  passwordForm: FormGroup
  updateMessage = ""
  updateSuccess = false
  isUpdating = false
  passwordMessage = ""
  passwordSuccess = false
  isChangingPassword = false
  userStats = {
    totalTramites: 0,
    tramitesPendientes: 0,
    tramitesAtendidos: 0,
    diasRegistrado: 0,
  }

  // Variables para manejo de foto de perfil
  selectedFile: File | null = null
  isUploadingPhoto = false
  private userSubscription?: Subscription

  constructor(
    private supabaseService: SupabaseService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.perfilForm = this.fb.group({
      nombres: ["", Validators.required],
      apellidos: ["", Validators.required],
      telefono: [""],
      genero: ["no_identificado"],
    })

    this.passwordForm = this.fb.group(
      {
        newPassword: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.passwordMatchValidator },
    )
  }

  async ngOnInit() {
    await this.loadUserData()
    await this.loadUserStats()
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe()
    }
  }

  private async loadUserData() {
    this.userSubscription = this.supabaseService.currentUser$.subscribe((user) => {
      this.currentUser = user
      if (user) {
        this.perfilForm.patchValue({
          nombres: user.nombres,
          apellidos: user.apellidos,
          telefono: user.telefono || "",
          genero: user.genero || "no_identificado",
        })
      } else {
        this.router.navigate(["/login"])
      }
    })
  }

  private async loadUserStats() {
    try {
      const tramites = await this.supabaseService.obtenerTramitesUsuario()

      this.userStats.totalTramites = tramites.length
      this.userStats.tramitesPendientes = tramites.filter((t) => t.estado === "pendiente").length
      this.userStats.tramitesAtendidos = tramites.filter((t) => t.estado === "atendido").length

      // Calcular días registrado
      if (this.currentUser?.fecha_registro) {
        const fechaRegistro = new Date(this.currentUser.fecha_registro)
        const hoy = new Date()
        const diffTime = Math.abs(hoy.getTime() - fechaRegistro.getTime())
        this.userStats.diasRegistrado = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error)
    }
  }

  toggleEditMode() {
    this.editMode = !this.editMode
    if (!this.editMode) {
      this.updateMessage = ""
    }
  }

  cancelEdit() {
    this.editMode = false
    this.updateMessage = ""
    this.loadUserData()
  }

  async onUpdatePerfil() {
    if (!this.perfilForm.valid) return

    this.isUpdating = true
    this.updateMessage = ""

    try {
      const result = await this.supabaseService.actualizarPerfil(this.perfilForm.value)

      this.updateSuccess = result.success
      this.updateMessage = result.message

      if (result.success) {
        this.editMode = false
      }
    } catch (error) {
      this.updateSuccess = false
      this.updateMessage = "Error de conexión"
    } finally {
      this.isUpdating = false
    }
  }

  togglePasswordMode() {
    this.passwordMode = !this.passwordMode
    if (!this.passwordMode) {
      this.passwordMessage = ""
      this.passwordForm.reset()
    }
  }

  cancelPasswordChange() {
    this.passwordMode = false
    this.passwordMessage = ""
    this.passwordForm.reset()
  }

  async onChangePassword() {
    if (!this.passwordForm.valid) return

    this.isChangingPassword = true
    this.passwordMessage = ""

    try {
      const { newPassword } = this.passwordForm.value
      const result = await this.supabaseService.actualizarPassword(newPassword)

      this.passwordSuccess = result.success
      this.passwordMessage = result.message

      if (result.success) {
        this.passwordMode = false
        this.passwordForm.reset()
      }
    } catch (error) {
      this.passwordSuccess = false
      this.passwordMessage = "Error de conexión"
    } finally {
      this.isChangingPassword = false
    }
  }

  private passwordMatchValidator(form: any) {
    const newPassword = form.get("newPassword")
    const confirmPassword = form.get("confirmPassword")

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true }
    }
    return null
  }

  // Métodos para manejo de foto de perfil
  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      fileInput.click()
    }
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      this.updateMessage = "Por favor selecciona un archivo de imagen válido"
      this.updateSuccess = false
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.updateMessage = "La imagen es demasiado grande. Máximo 5MB permitido."
      this.updateSuccess = false
      return
    }

    this.selectedFile = file
    await this.uploadProfilePhoto()
  }

  private async uploadProfilePhoto() {
    if (!this.selectedFile) return

    this.isUploadingPhoto = true
    this.updateMessage = "📸 Subiendo foto de perfil..."
    this.updateSuccess = true

    try {
      const result = await this.supabaseService.subirFotoPerfil(this.selectedFile)

      this.updateSuccess = result.success
      this.updateMessage = result.message

      if (result.success) {
        // La foto se actualizará automáticamente a través del observable
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) {
          fileInput.value = ""
        }
      }
    } catch (error) {
      console.error("Error subiendo foto:", error)
      this.updateSuccess = false
      this.updateMessage = "Error al subir la foto de perfil"
    } finally {
      this.isUploadingPhoto = false
      this.selectedFile = null
    }
  }

  onImageError(event: any) {
    // Evitar bucle infinito de errores
    if (event.target.src !== "/placeholder.svg?height=120&width=120") {
      event.target.src = "/placeholder.svg?height=120&width=120"
    }
  }

  // Métodos de utilidad mejorados para evitar parpadeos
  getProfileImageUrl(): string {
    // Siempre retornar una imagen por defecto para evitar parpadeos
    if (this.currentUser?.foto_perfil && this.currentUser.foto_perfil.trim() !== "") {
      return this.currentUser.foto_perfil
    }
    return "/placeholder.svg?height=120&width=120"
  }

  getFullName(): string {
    if (!this.currentUser) return "Usuario"
    return `${this.currentUser.nombres || ""} ${this.currentUser.apellidos || ""}`.trim()
  }

  getGenderLabel(genero?: string): string {
    switch (genero) {
      case "masculino":
        return "Masculino"
      case "femenino":
        return "Femenino"
      default:
        return "Prefiero no decir"
    }
  }

  getRoleLabel(rol?: string): string {
    switch (rol) {
      case "administrador":
        return "👑 Administrador"
      case "usuario":
        return "👤 Usuario"
      default:
        return "👤 Usuario"
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return "No disponible"
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
}
