import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { SupabaseService } from "../../services/supabase.service"

/**
 * Componente de Login y Registro
 * Maneja la autenticación de usuarios, registro y recuperación de contraseña
 */
@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <main class="login-container">
    <!-- ============================================================================ -->
    <!-- FORMULARIO DE LOGIN -->
    <!-- ============================================================================ -->
    <div class="form-login" *ngIf="!showRegister && !showForgotPassword">
      <h5>Iniciar Sesión</h5>
      <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
        <!-- Campo de Email -->
        <input 
          type="email" 
          class="controls" 
          placeholder="Email"
          formControlName="identifier"
          required>
        
        <!-- Campo de Contraseña -->
        <input 
          type="password" 
          class="controls" 
          placeholder="Contraseña"
          formControlName="password"
          required>
        
        <!-- Botón de Login -->
        <button type="submit" class="buttons" [disabled]="loginForm.invalid || isLoggingIn">
          {{ isLoggingIn ? 'Iniciando sesión...' : 'Ingresar' }}
        </button>
        
        <!-- Mensaje de resultado -->
        <div *ngIf="loginMessage" class="message" [class.error]="!loginSuccess">
          {{loginMessage}}
        </div>
      </form>
      
      <!-- Enlaces de navegación -->
      <p><a href="#" (click)="toggleRegister($event)">¿No tienes cuenta? Regístrate</a></p>
      <p><a href="#" (click)="showForgotPasswordForm($event)">¿Olvidaste tu contraseña?</a></p>
    </div>

    <!-- ============================================================================ -->
    <!-- FORMULARIO DE REGISTRO -->
    <!-- ============================================================================ -->
    <div class="form-login" *ngIf="showRegister && !showForgotPassword">
      <h5>Registro de Usuario</h5>
      <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
        <!-- Campos del formulario de registro -->
        <input 
          type="text" 
          class="controls" 
          placeholder="Cédula"
          formControlName="cedula"
          required>
        <input 
          type="text" 
          class="controls" 
          placeholder="Nombres"
          formControlName="nombres"
          required>
        <input 
          type="text" 
          class="controls" 
          placeholder="Apellidos"
          formControlName="apellidos"
          required>
        <input 
          type="email" 
          class="controls" 
          placeholder="Email"
          formControlName="email"
          required>
        <input 
          type="tel" 
          class="controls" 
          placeholder="Teléfono (opcional)"
          formControlName="telefono">
        <select class="controls" formControlName="genero" required>
          <option value="" disabled>Selecciona tu género</option>
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
          <option value="no_identificado">Prefiero no decir</option>
        </select>
        <input 
          type="password" 
          class="controls" 
          placeholder="Contraseña (mínimo 6 caracteres)"
          formControlName="password"
          required>
        <input 
          type="password" 
          class="controls" 
          placeholder="Confirmar Contraseña"
          formControlName="confirmPassword"
          required>
        
        <!-- Botón de registro -->
        <button type="submit" class="buttons" [disabled]="registerForm.invalid || isSubmitting">
          {{ isSubmitting ? 'Registrando...' : 'Registrarse' }}
        </button>
        
        <!-- Mensaje de resultado -->
        <div *ngIf="registerMessage" class="message" [class.error]="!registerSuccess">
          {{registerMessage}}
        </div>
      </form>
      
      <!-- Enlace para volver al login -->
      <p><a href="#" (click)="toggleRegister($event)">¿Ya tienes cuenta? Inicia sesión</a></p>
    </div>

    <!-- ============================================================================ -->
    <!-- FORMULARIO DE RECUPERACIÓN DE CONTRASEÑA -->
    <!-- ============================================================================ -->
    <div class="form-login" *ngIf="showForgotPassword">
      <h5>Recuperar Contraseña</h5>
      
      <!-- Información sobre el proceso -->
      <div class="recovery-info">
        <p><strong>Instrucciones:</strong></p>
        <p>Ingresa tu email registrado y te enviaremos un enlace seguro para restablecer tu contraseña.</p>
      </div>
      
      <form [formGroup]="forgotPasswordForm" (ngSubmit)="onForgotPassword()">
        <input 
          type="email" 
          class="controls" 
          placeholder="Ingresa tu email registrado"
          formControlName="email"
          required>
        <button type="submit" class="buttons" [disabled]="forgotPasswordForm.invalid || isRecovering">
          {{ isRecovering ? 'Enviando enlace...' : 'Enviar Enlace de Recuperación' }}
        </button>
      </form>

      <!-- Mensaje de resultado -->
      <div *ngIf="forgotPasswordMessage" class="message" [class.error]="!forgotPasswordSuccess">
        {{forgotPasswordMessage}}
      </div>

      <!-- Enlace para volver al login -->
      <p><a href="#" (click)="hideForgotPasswordForm($event)">← Volver al login</a></p>
    </div>
  </main>
`,
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  // ============================================================================
  // PROPIEDADES DEL COMPONENTE
  // ============================================================================

  // Formularios reactivos
  loginForm: FormGroup
  registerForm: FormGroup
  forgotPasswordForm: FormGroup

  // Estados de la interfaz
  showRegister = false
  showForgotPassword = false

  // Estados de carga
  isLoggingIn = false
  isSubmitting = false
  isRecovering = false

  // Mensajes y estados de resultado
  loginMessage = ""
  loginSuccess = false
  registerMessage = ""
  registerSuccess = false
  forgotPasswordMessage = ""
  forgotPasswordSuccess = false

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
  ) {
    // Inicializar formulario de login
    this.loginForm = this.fb.group({
      identifier: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    })

    // Inicializar formulario de registro
    this.registerForm = this.fb.group({
      cedula: ["", Validators.required],
      nombres: ["", Validators.required],
      apellidos: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      telefono: [""], // Campo opcional
      genero: ["", Validators.required],
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmPassword: ["", Validators.required],
    })

    // Inicializar formulario de recuperación de contraseña
    this.forgotPasswordForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    })
  }

  // ============================================================================
  // MÉTODOS DE NAVEGACIÓN ENTRE FORMULARIOS
  // ============================================================================

  /**
   * Alterna entre el formulario de login y registro
   * @param event - Evento del click (opcional)
   */
  toggleRegister(event?: Event) {
    if (event) {
      event.preventDefault()
    }
    this.showRegister = !this.showRegister
    this.clearMessages()
  }

  /**
   * Muestra el formulario de recuperación de contraseña
   * @param event - Evento del click (opcional)
   */
  showForgotPasswordForm(event?: Event) {
    if (event) {
      event.preventDefault()
    }
    this.showForgotPassword = true
    this.clearMessages()
  }

  /**
   * Oculta el formulario de recuperación de contraseña
   * @param event - Evento del click (opcional)
   */
  hideForgotPasswordForm(event?: Event) {
    if (event) {
      event.preventDefault()
    }
    this.showForgotPassword = false
    this.clearMessages()
  }

  /**
   * Limpia todos los mensajes de estado
   */
  clearMessages() {
    this.loginMessage = ""
    this.registerMessage = ""
    this.forgotPasswordMessage = ""
  }

  // ============================================================================
  // MÉTODOS DE AUTENTICACIÓN
  // ============================================================================

  /**
   * Maneja el proceso de login
   */
  async onLogin() {
    // Verificar que el formulario sea válido y no esté en proceso de login
    if (this.loginForm.valid && !this.isLoggingIn) {
      this.isLoggingIn = true
      this.loginMessage = ""

      const { identifier, password } = this.loginForm.value

      try {
        console.log("🔐 Iniciando proceso de login...")

        // Llamar al servicio de autenticación
        const result = await this.supabaseService.login(identifier, password)

        this.loginMessage = result.message
        this.loginSuccess = result.success

        if (result.success) {
          console.log("✅ Login exitoso, redirigiendo...")
          // Redirigir después de un breve delay para mostrar el mensaje
          setTimeout(() => {
            this.router.navigate(["/"])
          }, 2000)
        }
      } catch (error) {
        console.error("❌ Error en login:", error)
        this.loginMessage = "Error de conexión. Verifica tu internet e intenta nuevamente."
        this.loginSuccess = false
      } finally {
        this.isLoggingIn = false
      }
    }
  }

  /**
   * Maneja el proceso de registro
   */
  async onRegister() {
    // Verificar que el formulario sea válido y no esté en proceso de registro
    if (this.registerForm.valid && !this.isSubmitting) {
      this.isSubmitting = true
      this.registerMessage = ""

      const formData = this.registerForm.value

      // Validar que las contraseñas coincidan
      if (formData.password !== formData.confirmPassword) {
        this.registerMessage = "Las contraseñas no coinciden"
        this.registerSuccess = false
        this.isSubmitting = false
        return
      }

      // Preparar datos del usuario
      const usuario = {
        cedula: formData.cedula,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        email: formData.email,
        telefono: formData.telefono,
        genero: formData.genero || "no_identificado",
        password_hash: formData.password,
      }

      try {
        console.log("📝 Iniciando proceso de registro...")

        // Llamar al servicio de registro
        const result = await this.supabaseService.registrarUsuario(usuario)

        this.registerMessage = result.message
        this.registerSuccess = result.success

        if (result.success) {
          console.log("✅ Registro exitoso")
          // Limpiar formulario y volver al login después de un delay
          this.registerForm.reset()
          setTimeout(() => {
            this.showRegister = false
            this.clearMessages()
          }, 5000)
        }
      } catch (error) {
        console.error("❌ Error en registro:", error)
        this.registerMessage = "Error de conexión. Verifica tu internet e intenta nuevamente."
        this.registerSuccess = false
      } finally {
        this.isSubmitting = false
      }
    }
  }

  /**
   * Maneja el proceso de recuperación de contraseña
   */
  async onForgotPassword() {
    // Verificar que el formulario sea válido y no esté en proceso de recuperación
    if (this.forgotPasswordForm.valid && !this.isRecovering) {
      this.isRecovering = true
      this.forgotPasswordMessage = ""

      const email = this.forgotPasswordForm.value.email

      try {
        console.log("🔑 Iniciando proceso de recuperación...")

        // Llamar al servicio de recuperación
        const result = await this.supabaseService.solicitarRecuperacionPassword(email)

        this.forgotPasswordMessage = result.message
        this.forgotPasswordSuccess = result.success

        if (result.success) {
          console.log("✅ Solicitud de recuperación enviada")
          this.forgotPasswordForm.reset()
        }
      } catch (error) {
        console.error("❌ Error en recuperación:", error)
        this.forgotPasswordMessage = "Error de conexión. Verifica tu internet e intenta nuevamente."
        this.forgotPasswordSuccess = false
      } finally {
        this.isRecovering = false
      }
    }
  }
}
