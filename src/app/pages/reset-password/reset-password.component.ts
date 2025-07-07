import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Router, ActivatedRoute } from "@angular/router"
import { SupabaseService } from "../../services/supabase.service"

/**
 * Componente para restablecer contraseña
 * Se activa cuando el usuario hace clic en el enlace del email de recuperación
 */
@Component({
  selector: "app-reset-password",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="reset-password-container">
      <div class="form-reset-password">
        <h5>🔑 Restablecer Contraseña</h5>
        
        <!-- Información del proceso -->
        <div class="reset-info">
          <p>Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres.</p>
        </div>

        <form [formGroup]="resetForm" (ngSubmit)="onResetPassword()" *ngIf="!isExpired">
          <!-- Campo de nueva contraseña -->
          <input 
            type="password" 
            class="controls" 
            placeholder="Nueva contraseña (mínimo 6 caracteres)"
            formControlName="password"
            required>
          
          <!-- Campo de confirmar contraseña -->
          <input 
            type="password" 
            class="controls" 
            placeholder="Confirmar nueva contraseña"
            formControlName="confirmPassword"
            required>
          
          <!-- Botón de actualizar -->
          <button type="submit" class="buttons" [disabled]="resetForm.invalid || isUpdating">
            {{ isUpdating ? 'Actualizando contraseña...' : 'Actualizar Contraseña' }}
          </button>
          
          <!-- Mensaje de resultado -->
          <div *ngIf="resetMessage" class="message" [class.error]="!resetSuccess">
            {{ resetMessage }}
          </div>
        </form>

        <!-- Mensaje si el enlace expiró -->
        <div *ngIf="isExpired" class="expired-message">
          <h6>⚠️ Enlace Expirado</h6>
          <p>Este enlace de recuperación ha expirado o ya fue utilizado.</p>
          <p>Por favor, solicita un nuevo enlace de recuperación desde la página de login.</p>
          <button class="buttons" (click)="goToLogin()">
            Ir al Login
          </button>
        </div>

        <!-- Enlace para volver al login -->
        <p><a href="#" (click)="goToLogin()">← Volver al login</a></p>
      </div>
    </main>
  `,
  styleUrls: ["./reset-password.component.css"],
})
export class ResetPasswordComponent implements OnInit {
  // ============================================================================
  // PROPIEDADES DEL COMPONENTE
  // ============================================================================

  resetForm: FormGroup
  resetMessage = ""
  resetSuccess = false
  isUpdating = false
  isExpired = false

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    // Inicializar formulario de reset
    this.resetForm = this.fb.group({
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmPassword: ["", Validators.required],
    })
  }

  // ============================================================================
  // MÉTODOS DEL CICLO DE VIDA
  // ============================================================================

  ngOnInit() {
    // Verificar si hay parámetros de recuperación en la URL
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        // Parsear los parámetros del fragment
        const params = new URLSearchParams(fragment)
        const accessToken = params.get("access_token")
        const refreshToken = params.get("refresh_token")
        const type = params.get("type")

        console.log("🔑 Parámetros de reset recibidos:", { type, hasAccessToken: !!accessToken })

        // Verificar que sea un reset de contraseña válido
        if (type === "recovery" && accessToken && refreshToken) {
          console.log("✅ Enlace de recuperación válido")
          // El enlace es válido, permitir cambio de contraseña
        } else {
          console.log("❌ Enlace de recuperación inválido o expirado")
          this.isExpired = true
        }
      } else {
        console.log("❌ No hay parámetros de recuperación")
        this.isExpired = true
      }
    })
  }

  // ============================================================================
  // MÉTODOS DE FUNCIONALIDAD
  // ============================================================================

  /**
   * Maneja el proceso de restablecimiento de contraseña
   */
  async onResetPassword() {
    if (this.resetForm.valid && !this.isUpdating) {
      this.isUpdating = true
      this.resetMessage = ""

      const { password, confirmPassword } = this.resetForm.value

      // Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        this.resetMessage = "Las contraseñas no coinciden"
        this.resetSuccess = false
        this.isUpdating = false
        return
      }

      try {
        console.log("🔑 Actualizando contraseña...")

        // Llamar al servicio para actualizar la contraseña
        const result = await this.supabaseService.actualizarPassword(password)

        this.resetMessage = result.message
        this.resetSuccess = result.success

        if (result.success) {
          console.log("✅ Contraseña actualizada exitosamente")
          // Redirigir al login después de un delay
          setTimeout(() => {
            this.router.navigate(["/login"])
          }, 3000)
        }
      } catch (error) {
        console.error("❌ Error actualizando contraseña:", error)
        this.resetMessage = "Error de conexión. Verifica tu internet e intenta nuevamente."
        this.resetSuccess = false
      } finally {
        this.isUpdating = false
      }
    }
  }

  /**
   * Navega de vuelta al login
   */
  goToLogin() {
    this.router.navigate(["/login"])
  }
}
