import { Injectable } from "@angular/core"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { BehaviorSubject } from "rxjs"

// ============================================================================
// INTERFACES PARA TIPADO DE DATOS
// ============================================================================

export interface Usuario {
  id?: string
  cedula: string
  nombres: string
  apellidos: string
  email: string
  telefono?: string
  genero?: string
  password_hash?: string
  email_verificado?: boolean
  codigo_verificacion?: string
  fecha_registro?: string
  activo?: boolean
  rol?: string
  foto_perfil?: string
}

export interface Tramite {
  id?: string
  usuario_id?: string
  cedula_usuario?: string
  tipo_tramite: string
  estado?: string
  municipio?: string
  vereda?: string
  numero_parcelas?: number
  area_total?: number
  descripcion_modificacion?: string
  fecha_solicitud?: string
  fecha_actualizacion?: string
  numero_predial?: string
  observaciones?: string
  observaciones_admin?: string
  fecha_respuesta?: string
  usuarios?: any
}

export interface GeoJsonFile {
  id?: string
  nombre: string
  descripcion?: string
  archivo_url: string
  usuario_id?: string
  activo?: boolean
  fecha_subida?: string
}

export interface Sugerencia {
  id?: string
  usuario_id?: string
  titulo: string
  descripcion: string
  categoria: string
  estado?: string
  fecha_creacion?: string
  usuarios?: any
}

export interface MetricasSistema {
  fecha: string
  usuarios_activos: number
  tramites_creados: number
  tramites_procesados: number
  sugerencias_creadas: number
  tiempo_promedio_respuesta?: string
  satisfaccion_promedio?: number
}

// ============================================================================
// SERVICIO PRINCIPAL DE SUPABASE
// ============================================================================

@Injectable({
  providedIn: "root",
})
export class SupabaseService {
  private supabase: SupabaseClient
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()
  private inactivityTimer: any
  private readonly INACTIVITY_TIME = 30 * 60 * 1000 // 30 minutos

  constructor() {
    this.supabase = createClient(
      "https://tdmjcepxnoeiknjoushl.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkbWpjZXB4bm9laWtuam91c2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNDc3MDEsImV4cCI6MjA2NjkyMzcwMX0.eL1Ng2aD6kxc7rdJyVT_mjuWvPoP_VW2qu8KyqdifJI",
    )

    this.initializeAuth()
    this.setupInactivityTimer()
  }

  // ============================================================================
  // GESTIÓN DE INACTIVIDAD
  // ============================================================================

  private setupInactivityTimer() {
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

    const resetTimer = () => {
      if (this.isLoggedIn()) {
        this.resetInactivityTimer()
      }
    }

    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true)
    })
  }

  private resetInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer)
    }

    this.inactivityTimer = setTimeout(() => {
      console.log("⏰ Sesión cerrada por inactividad")
      this.logout()
    }, this.INACTIVITY_TIME)
  }

  // ============================================================================
  // MÉTODOS DE INICIALIZACIÓN
  // ============================================================================

  private async initializeAuth() {
    try {
      console.log("🔧 Inicializando sistema de autenticación...")

      // Verificar sesión existente
      const {
        data: { session },
        error,
      } = await this.supabase.auth.getSession()

      if (error) {
        console.error("❌ Error obteniendo sesión:", error)
        this.clearLocalData()
      } else if (session?.user) {
        console.log("✅ Sesión válida encontrada, cargando usuario...")
        await this.loadUserFromAuth(session.user.id)
        this.resetInactivityTimer()
      } else {
        console.log("ℹ️ No hay sesión activa")
        this.clearLocalData()
      }

      // Escuchar cambios de autenticación
      this.supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("🔄 Cambio de estado de auth:", event)

        switch (event) {
          case "SIGNED_IN":
            if (session?.user) {
              console.log("✅ Usuario autenticado:", session.user.email)
              await this.loadUserFromAuth(session.user.id)
              await this.registrarActividad(session.user.id, "login", "Usuario inició sesión")
              this.resetInactivityTimer()
            }
            break

          case "SIGNED_OUT":
            console.log("🚪 Usuario cerró sesión")
            this.clearLocalData()
            if (this.inactivityTimer) {
              clearTimeout(this.inactivityTimer)
            }
            break

          case "TOKEN_REFRESHED":
            if (session?.user) {
              await this.loadUserFromAuth(session.user.id)
              this.resetInactivityTimer()
            }
            break
        }
      })

      console.log("✅ Sistema de autenticación inicializado")
    } catch (error) {
      console.error("❌ Error inicializando autenticación:", error)
      this.clearLocalData()
    }
  }

  private async loadUserFromAuth(userId: string) {
    try {
      console.log("📥 Cargando datos del usuario:", userId)

      const { data: userData, error } = await this.supabase.from("usuarios").select("*").eq("id", userId).single()

      if (error) {
        console.error("❌ Error cargando datos del usuario:", error)

        if (error.code === "PGRST116") {
          console.log("⏳ Usuario no encontrado, esperando creación automática...")
          setTimeout(() => this.loadUserFromAuth(userId), 2000)
          return
        }
        return
      }

      if (userData) {
        console.log("✅ Datos del usuario cargados:", userData.email)
        this.currentUserSubject.next(userData)
      }
    } catch (error) {
      console.error("❌ Error cargando usuario:", error)
    }
  }

  private clearLocalData() {
    localStorage.removeItem("currentUser")
    sessionStorage.clear()
    this.currentUserSubject.next(null)
    console.log("🧹 Datos locales limpiados")
  }

  // ============================================================================
  // MÉTODOS DE REGISTRO Y LOGIN
  // ============================================================================

  async registrarUsuario(usuario: Usuario): Promise<{ success: boolean; message: string }> {
    try {
      console.log("📝 Iniciando registro para:", usuario.email)

      const { data, error } = await this.supabase.auth.signUp({
        email: usuario.email,
        password: usuario.password_hash || "",
        options: {
          data: {
            cedula: usuario.cedula,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            telefono: usuario.telefono || "",
            genero: usuario.genero || "no_identificado",
          },
        },
      })

      if (error) {
        console.error("❌ Error en registro:", error)

        if (error.message.includes("already registered")) {
          return {
            success: false,
            message: "Este email ya está registrado. Intenta iniciar sesión o recuperar tu contraseña.",
          }
        }

        return {
          success: false,
          message: `Error al registrar: ${error.message}`,
        }
      }

      if (data.user) {
        console.log("✅ Usuario registrado exitosamente:", data.user.email)
        await this.registrarActividad(data.user.id, "registro", "Usuario se registró en el sistema")

        return {
          success: true,
          message: `¡Registro exitoso! Se ha enviado un email de verificación a ${usuario.email}. 
                   Por favor revisa tu bandeja de entrada y carpeta de spam, luego haz clic en el enlace para verificar tu cuenta.`,
        }
      }

      return { success: false, message: "Error inesperado durante el registro" }
    } catch (error) {
      console.error("❌ Error completo en registro:", error)
      return { success: false, message: "Error de conexión. Verifica tu internet e intenta nuevamente." }
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: Usuario }> {
    try {
      console.log("🔐 Intentando login para:", email)

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) {
        console.error("❌ Error en login:", error)

        if (error.message.includes("Email not confirmed")) {
          return {
            success: false,
            message:
              "Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada y haz clic en el enlace de verificación.",
          }
        }

        if (error.message.includes("Invalid login credentials")) {
          return {
            success: false,
            message: "Email o contraseña incorrectos. Verifica tus credenciales e intenta nuevamente.",
          }
        }

        return {
          success: false,
          message: "Error al iniciar sesión. Verifica tus credenciales.",
        }
      }

      if (data.user && data.session) {
        console.log("✅ Login exitoso para:", data.user.email)

        // Esperar a que se cargue el usuario
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const currentUser = this.getCurrentUser()

        return {
          success: true,
          message: "¡Bienvenido! Iniciando sesión...",
          user: currentUser || undefined,
        }
      }

      return { success: false, message: "Error inesperado durante el login" }
    } catch (error) {
      console.error("❌ Error en login:", error)
      return { success: false, message: "Error de conexión. Verifica tu internet e intenta nuevamente." }
    }
  }

  async logout() {
    try {
      const currentUser = this.getCurrentUser()
      if (currentUser) {
        await this.registrarActividad(currentUser.id!, "logout", "Usuario cerró sesión")
      }

      console.log("🚪 Cerrando sesión...")

      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer)
      }

      // Limpiar datos locales PRIMERO
      this.clearLocalData()

      // Luego cerrar sesión en Supabase
      const { error } = await this.supabase.auth.signOut()

      if (error) {
        console.error("❌ Error cerrando sesión en Supabase:", error)
      }

      console.log("✅ Sesión cerrada exitosamente")
    } catch (error) {
      console.error("❌ Error cerrando sesión:", error)
      // Asegurar limpieza incluso si hay error
      this.clearLocalData()
    }
  }

  async solicitarRecuperacionPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log("🔑 Solicitando recuperación para:", email)

      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        console.error("❌ Error en recuperación:", error)
        return {
          success: false,
          message: "Error al enviar enlace de recuperación. Verifica que el email esté registrado.",
        }
      }

      return {
        success: true,
        message: "Se ha enviado un enlace de recuperación a tu email. Revisa tu bandeja de entrada y carpeta de spam.",
      }
    } catch (error) {
      console.error("❌ Error en recuperación:", error)
      return { success: false, message: "Error de conexión. Intenta nuevamente." }
    }
  }

  async actualizarPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log("🔑 Actualizando contraseña...")

      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        console.error("❌ Error actualizando contraseña:", error)
        return {
          success: false,
          message: "Error al actualizar la contraseña. Intenta nuevamente.",
        }
      }

      const currentUser = this.getCurrentUser()
      if (currentUser) {
        await this.registrarActividad(currentUser.id!, "password_change", "Usuario cambió su contraseña")
      }

      return {
        success: true,
        message: "Contraseña actualizada exitosamente.",
      }
    } catch (error) {
      console.error("❌ Error actualizando contraseña:", error)
      return { success: false, message: "Error de conexión. Intenta nuevamente." }
    }
  }

  // ============================================================================
  // MÉTODOS DE USUARIO
  // ============================================================================

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser()
    return user?.rol === "administrador"
  }

  async actualizarPerfil(datosActualizados: Partial<Usuario>): Promise<{ success: boolean; message: string }> {
    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser?.id) {
        return { success: false, message: "Usuario no autenticado" }
      }

      console.log("📝 Actualizando perfil del usuario:", currentUser.id)

      const { error } = await this.supabase.from("usuarios").update(datosActualizados).eq("id", currentUser.id)

      if (error) {
        console.error("❌ Error actualizando perfil:", error)
        return { success: false, message: "Error al actualizar el perfil" }
      }

      const updatedUser = { ...currentUser, ...datosActualizados }
      this.currentUserSubject.next(updatedUser)

      await this.registrarActividad(currentUser.id, "profile_update", "Usuario actualizó su perfil")

      return { success: true, message: "Perfil actualizado exitosamente" }
    } catch (error) {
      console.error("❌ Error actualizando perfil:", error)
      return { success: false, message: "Error de conexión" }
    }
  }

  async subirFotoPerfil(file: File): Promise<{ success: boolean; message: string; url?: string }> {
    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser?.id) {
        return { success: false, message: "Usuario no autenticado" }
      }

      console.log("📸 Subiendo foto de perfil...")

      const fileExt = file.name.split(".").pop()
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) {
        console.error("❌ Error subiendo archivo:", uploadError)
        return { success: false, message: "Error al subir la imagen" }
      }

      const { data: urlData } = this.supabase.storage.from("avatars").getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl

      const { error: updateError } = await this.supabase
        .from("usuarios")
        .update({ foto_perfil: publicUrl })
        .eq("id", currentUser.id)

      if (updateError) {
        console.error("❌ Error actualizando foto en BD:", updateError)
        return { success: false, message: "Error actualizando la foto en el perfil" }
      }

      const updatedUser = { ...currentUser, foto_perfil: publicUrl }
      this.currentUserSubject.next(updatedUser)

      await this.registrarActividad(currentUser.id, "profile_photo_update", "Usuario actualizó su foto de perfil")

      return { success: true, message: "Foto de perfil actualizada exitosamente", url: publicUrl }
    } catch (error) {
      console.error("❌ Error subiendo foto:", error)
      return { success: false, message: "Error de conexión" }
    }
  }

  // ============================================================================
  // MÉTODOS DE TRÁMITES
  // ============================================================================

  async crearTramite(tramite: Partial<Tramite>): Promise<{ success: boolean; message: string }> {
    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser) {
        return { success: false, message: "Usuario no autenticado" }
      }

      console.log("📋 Creando nuevo trámite...")

      const tramiteCompleto = {
        ...tramite,
        usuario_id: currentUser.id,
        cedula_usuario: currentUser.cedula,
        estado: "pendiente",
        fecha_solicitud: new Date().toISOString(),
      }

      const { error } = await this.supabase.from("tramites").insert([tramiteCompleto])

      if (error) {
        console.error("❌ Error creando trámite:", error)
        return { success: false, message: "Error al crear el trámite" }
      }

      await this.registrarActividad(currentUser.id!, "tramite_created", `Trámite creado: ${tramite.tipo_tramite}`)

      return { success: true, message: "Trámite creado exitosamente" }
    } catch (error) {
      console.error("❌ Error creando trámite:", error)
      return { success: false, message: "Error de conexión" }
    }
  }

  async obtenerTramitesUsuario(): Promise<Tramite[]> {
    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser) return []

      console.log("📋 Obteniendo trámites del usuario:", currentUser.id)

      const { data, error } = await this.supabase
        .from("tramites")
        .select("*")
        .eq("usuario_id", currentUser.id)
        .order("fecha_solicitud", { ascending: false })

      if (error) {
        console.error("❌ Error obteniendo trámites:", error)
        return []
      }

      console.log("✅ Trámites obtenidos:", data?.length || 0)
      return data || []
    } catch (error) {
      console.error("❌ Error obteniendo trámites:", error)
      return []
    }
  }

  async obtenerTramitesPendientes(): Promise<Tramite[]> {
    try {
      if (!this.isAdmin()) {
        console.warn("⚠️ Acceso denegado: solo administradores")
        return []
      }

      console.log("📋 Obteniendo trámites pendientes...")

      const { data, error } = await this.supabase
        .from("tramites")
        .select(`
          *,
          usuarios!tramites_usuario_id_fkey (
            nombres,
            apellidos,
            email,
            telefono,
            cedula
          )
        `)
        .eq("estado", "pendiente")
        .order("fecha_solicitud", { ascending: false })

      if (error) {
        console.error("❌ Error obteniendo trámites pendientes:", error)
        return []
      }

      console.log("✅ Trámites pendientes obtenidos:", data?.length || 0)
      return data || []
    } catch (error) {
      console.error("❌ Error obteniendo trámites pendientes:", error)
      return []
    }
  }

  async obtenerTodosTramites(): Promise<Tramite[]> {
    try {
      if (!this.isAdmin()) {
        console.warn("⚠️ Acceso denegado: solo administradores")
        return []
      }

      console.log("📋 Obteniendo todos los trámites...")

      const { data, error } = await this.supabase
        .from("tramites")
        .select(`
          *,
          usuarios!tramites_usuario_id_fkey (
            nombres,
            apellidos,
            email
          )
        `)
        .order("fecha_solicitud", { ascending: false })

      if (error) {
        console.error("❌ Error obteniendo todos los trámites:", error)
        return []
      }

      console.log("✅ Todos los trámites obtenidos:", data?.length || 0)
      return data || []
    } catch (error) {
      console.error("❌ Error obteniendo todos los trámites:", error)
      return []
    }
  }

  async actualizarTramite(
    tramiteId: string,
    estado: string,
    observaciones?: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isAdmin()) {
        return { success: false, message: "Acceso denegado" }
      }

      console.log("📝 Actualizando trámite:", tramiteId)

      const updateData: any = {
        estado,
        fecha_actualizacion: new Date().toISOString(),
      }

      if (observaciones) {
        updateData.observaciones_admin = observaciones
      }

      if (estado === "atendido" || estado === "rechazado") {
        updateData.fecha_respuesta = new Date().toISOString()
      }

      const { error } = await this.supabase.from("tramites").update(updateData).eq("id", tramiteId)

      if (error) {
        console.error("❌ Error actualizando trámite:", error)
        return { success: false, message: "Error al actualizar el trámite" }
      }

      const currentUser = this.getCurrentUser()
      if (currentUser) {
        await this.registrarActividad(
          currentUser.id!,
          "tramite_updated",
          `Trámite ${tramiteId} actualizado a estado: ${estado}`,
        )
      }

      return { success: true, message: "Trámite actualizado exitosamente" }
    } catch (error) {
      console.error("❌ Error actualizando trámite:", error)
      return { success: false, message: "Error de conexión" }
    }
  }

  async actualizarEstadoTramite(
    tramiteId: string,
    estado: string,
    observaciones?: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.actualizarTramite(tramiteId, estado, observaciones)
  }

  // ============================================================================
  // MÉTODOS DE SUGERENCIAS
  // ============================================================================

  async crearSugerencia(sugerencia: Sugerencia): Promise<{ success: boolean; message: string }> {
    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser) {
        return { success: false, message: "Usuario no autenticado" }
      }

      console.log("💡 Creando nueva sugerencia...")

      const sugerenciaCompleta = {
        ...sugerencia,
        usuario_id: currentUser.id,
        estado: "pendiente",
        fecha_creacion: new Date().toISOString(),
      }

      const { error } = await this.supabase.from("sugerencias").insert([sugerenciaCompleta])

      if (error) {
        console.error("❌ Error creando sugerencia:", error)
        return { success: false, message: "Error al crear la sugerencia" }
      }

      await this.registrarActividad(currentUser.id!, "sugerencia_created", `Sugerencia creada: ${sugerencia.titulo}`)

      return { success: true, message: "Sugerencia enviada exitosamente" }
    } catch (error) {
      console.error("❌ Error creando sugerencia:", error)
      return { success: false, message: "Error de conexión" }
    }
  }

  async obtenerSugerencias(): Promise<Sugerencia[]> {
    try {
      console.log("💡 Obteniendo sugerencias...")

      const { data, error } = await this.supabase
        .from("sugerencias")
        .select(`
          *,
          usuarios!sugerencias_usuario_id_fkey (
            nombres,
            apellidos
          )
        `)
        .order("fecha_creacion", { ascending: false })

      if (error) {
        console.error("❌ Error obteniendo sugerencias:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("❌ Error obteniendo sugerencias:", error)
      return []
    }
  }

  async actualizarEstadoSugerencia(
    sugerenciaId: string,
    estado: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isAdmin()) {
        return { success: false, message: "Acceso denegado" }
      }

      console.log("📝 Actualizando sugerencia:", sugerenciaId)

      const { error } = await this.supabase.from("sugerencias").update({ estado }).eq("id", sugerenciaId)

      if (error) {
        console.error("❌ Error actualizando sugerencia:", error)
        return { success: false, message: "Error al actualizar la sugerencia" }
      }

      const currentUser = this.getCurrentUser()
      if (currentUser) {
        await this.registrarActividad(
          currentUser.id!,
          "sugerencia_updated",
          `Sugerencia ${sugerenciaId} actualizada a estado: ${estado}`,
        )
      }

      return { success: true, message: "Sugerencia actualizada exitosamente" }
    } catch (error) {
      console.error("❌ Error actualizando sugerencia:", error)
      return { success: false, message: "Error de conexión" }
    }
  }

  // ============================================================================
  // MÉTODOS DE ESTADÍSTICAS
  // ============================================================================

  async obtenerEstadisticas(): Promise<any> {
    try {
      console.log("📊 Obteniendo estadísticas...")

      const { data: usuarios, error: usuariosError } = await this.supabase
        .from("usuarios")
        .select("id, genero, email_verificado, fecha_registro, activo")

      if (usuariosError) {
        console.error("❌ Error obteniendo usuarios:", usuariosError)
        return null
      }

      const { data: tramites, error: tramitesError } = await this.supabase
        .from("tramites")
        .select("id, estado, fecha_solicitud")

      if (tramitesError) {
        console.error("❌ Error obteniendo trámites:", tramitesError)
        return null
      }

      const { data: sugerencias, error: sugerenciasError } = await this.supabase
        .from("sugerencias")
        .select("id, estado, fecha_creacion")

      if (sugerenciasError) {
        console.error("❌ Error obteniendo sugerencias:", sugerenciasError)
        return null
      }

      const usuariosData = usuarios || []
      const tramitesData = tramites || []
      const sugerenciasData = sugerencias || []

      const estadisticas = {
        totalUsuarios: usuariosData.length,
        usuariosVerificados: usuariosData.filter((u) => u.email_verificado).length,
        usuariosPorGenero: {
          masculino: usuariosData.filter((u) => u.genero === "masculino").length,
          femenino: usuariosData.filter((u) => u.genero === "femenino").length,
          noIdentificado: usuariosData.filter((u) => u.genero === "no_identificado" || !u.genero).length,
        },
        totalTramites: tramitesData.length,
        tramitesPendientes: tramitesData.filter((t) => t.estado === "pendiente").length,
        tramitesAtendidos: tramitesData.filter((t) => t.estado === "atendido").length,
        tramitesRechazados: tramitesData.filter((t) => t.estado === "rechazado").length,
        totalSugerencias: sugerenciasData.length,
        sugerenciasPendientes: sugerenciasData.filter((s) => s.estado === "pendiente").length,
      }

      console.log("✅ Estadísticas calculadas:", estadisticas)
      return estadisticas
    } catch (error) {
      console.error("❌ Error obteniendo estadísticas:", error)
      return null
    }
  }

  // ============================================================================
  // MÉTODOS DE GEOVISOR - CORREGIDOS
  // ============================================================================

  async subirGeoJson(geoJsonFile: GeoJsonFile): Promise<{ success: boolean; message: string }> {
    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser || !this.isAdmin()) {
        return { success: false, message: "Acceso denegado" }
      }

      console.log("🗺️ Subiendo archivo GeoJSON...")

      // Desactivar archivos anteriores
      const { error: deactivateError } = await this.supabase
        .from("geojson_files")
        .update({ activo: false })
        .eq("activo", true)

      if (deactivateError) {
        console.error("❌ Error desactivando archivo anterior:", deactivateError)
      }

      const geoJsonCompleto = {
        nombre: geoJsonFile.nombre,
        descripcion: geoJsonFile.descripcion || "",
        archivo_url: geoJsonFile.archivo_url,
        usuario_id: currentUser.id,
        activo: true,
        fecha_subida: new Date().toISOString(),
      }

      const { data, error } = await this.supabase.from("geojson_files").insert([geoJsonCompleto]).select()

      if (error) {
        console.error("❌ Error insertando GeoJSON:", error)
        return { success: false, message: `Error al guardar el archivo: ${error.message}` }
      }

      console.log("✅ GeoJSON insertado correctamente:", data)

      await this.registrarActividad(
        currentUser.id!,
        "geojson_uploaded",
        `Archivo GeoJSON subido: ${geoJsonFile.nombre}`,
      )

      return { success: true, message: "Archivo GeoJSON subido y guardado permanentemente" }
    } catch (error) {
      console.error("❌ Error subiendo GeoJSON:", error)
      return { success: false, message: "Error de conexión al subir el archivo" }
    }
  }

  async obtenerGeoJsonActivo(): Promise<GeoJsonFile | null> {
    try {
      console.log("🗺️ Obteniendo archivo GeoJSON activo...")

      const { data, error } = await this.supabase
        .from("geojson_files")
        .select("*")
        .eq("activo", true)
        .order("fecha_subida", { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("ℹ️ No hay archivo GeoJSON activo")
          return null
        }
        console.error("❌ Error obteniendo GeoJSON:", error)
        return null
      }

      console.log("✅ Archivo GeoJSON activo encontrado:", data.nombre)
      return data
    } catch (error) {
      console.error("❌ Error obteniendo GeoJSON:", error)
      return null
    }
  }

  async buscarEnGeoJson(valor: string, geoJsonData: any): Promise<any> {
    try {
      console.log("🔍 Buscando en GeoJSON:", valor)

      if (!geoJsonData?.features) {
        console.warn("⚠️ No hay datos GeoJSON para buscar")
        return null
      }

      const feature = geoJsonData.features.find((f: any) => {
        const props = f.properties || {}

        if (props.CODIGO && props.CODIGO.toString().toLowerCase().includes(valor.toLowerCase())) {
          return true
        }

        if (props.MATRICULA_ && props.MATRICULA_.toString().toLowerCase().includes(valor.toLowerCase())) {
          return true
        }

        if (props.DIRECCION && props.DIRECCION.toString().toLowerCase().includes(valor.toLowerCase())) {
          return true
        }

        return false
      })

      if (feature) {
        console.log("✅ Feature encontrado:", feature.properties)
        return feature
      }

      console.log("❌ No se encontró el valor buscado")
      return null
    } catch (error) {
      console.error("❌ Error buscando en GeoJSON:", error)
      return null
    }
  }

  // ============================================================================
  // MÉTODOS DE ADMINISTRACIÓN
  // ============================================================================

  async obtenerTodosUsuarios(): Promise<Usuario[]> {
    try {
      if (!this.isAdmin()) {
        console.warn("⚠️ Acceso denegado: solo administradores")
        return []
      }

      console.log("👥 Obteniendo todos los usuarios...")

      const { data, error } = await this.supabase
        .from("usuarios")
        .select("*")
        .order("fecha_registro", { ascending: false })

      if (error) {
        console.error("❌ Error obteniendo usuarios:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("❌ Error obteniendo usuarios:", error)
      return []
    }
  }

  async cambiarRolUsuario(usuarioId: string, nuevoRol: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isAdmin()) {
        return { success: false, message: "Acceso denegado" }
      }

      console.log("👤 Cambiando rol de usuario:", usuarioId, "a", nuevoRol)

      const { error } = await this.supabase.from("usuarios").update({ rol: nuevoRol }).eq("id", usuarioId)

      if (error) {
        console.error("❌ Error cambiando rol:", error)
        return { success: false, message: "Error al cambiar el rol del usuario" }
      }

      const currentUser = this.getCurrentUser()
      if (currentUser) {
        await this.registrarActividad(
          currentUser.id!,
          "role_changed",
          `Rol de usuario ${usuarioId} cambiado a: ${nuevoRol}`,
        )
      }

      return { success: true, message: "Rol de usuario actualizado exitosamente" }
    } catch (error) {
      console.error("❌ Error cambiando rol:", error)
      return { success: false, message: "Error de conexión" }
    }
  }

  // ============================================================================
  // MÉTODOS DE LOGS Y ACTIVIDAD
  // ============================================================================

  private async registrarActividad(usuarioId: string, accion: string, descripcion: string): Promise<void> {
    try {
      const { error } = await this.supabase.from("logs_actividad").insert([
        {
          usuario_id: usuarioId,
          accion,
          descripcion,
          fecha: new Date().toISOString(),
          ip_address: "127.0.0.1",
        },
      ])

      if (error) {
        console.error("❌ Error registrando actividad:", error)
      }
    } catch (error) {
      console.error("❌ Error registrando actividad:", error)
    }
  }

  // ============================================================================
  // MÉTODOS DE NOTIFICACIONES Y EMAILS
  // ============================================================================

  async enviarNotificacionTramite(
    tramiteId: string,
    usuarioEmail: string,
    estado: string,
    comentario?: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log("📧 Enviando notificación de trámite...")

      // Aquí normalmente usarías un servicio de email como SendGrid, Resend, etc.
      // Por ahora simularemos el envío

      const asunto = `Actualización de tu trámite - Estado: ${estado}`
      const mensaje = `
      Hola,
      
      Tu trámite ha sido actualizado.
      
      Estado: ${estado}
      ${comentario ? `Comentario del administrador: ${comentario}` : ""}
      
      Puedes revisar el estado completo en tu perfil.
      
      Saludos,
      Equipo Catastro Tausa
    `

      // Simular envío de email (en producción usarías un servicio real)
      console.log("📧 Email simulado enviado a:", usuarioEmail)
      console.log("📧 Asunto:", asunto)
      console.log("📧 Mensaje:", mensaje)

      return { success: true, message: "Notificación enviada exitosamente" }
    } catch (error) {
      console.error("❌ Error enviando notificación:", error)
      return { success: false, message: "Error enviando notificación" }
    }
  }

  async obtenerTramitesResueltos(): Promise<Tramite[]> {
    try {
      if (!this.isAdmin()) {
        console.warn("⚠️ Acceso denegado: solo administradores")
        return []
      }

      console.log("📋 Obteniendo trámites resueltos...")

      const { data, error } = await this.supabase
        .from("tramites")
        .select(`
        *,
        usuarios!tramites_usuario_id_fkey (
          nombres,
          apellidos,
          email,
          telefono,
          cedula
        )
      `)
        .in("estado", ["atendido", "rechazado"])
        .order("fecha_respuesta", { ascending: false })

      if (error) {
        console.error("❌ Error obteniendo trámites resueltos:", error)
        return []
      }

      console.log("✅ Trámites resueltos obtenidos:", data?.length || 0)
      return data || []
    } catch (error) {
      console.error("❌ Error obteniendo trámites resueltos:", error)
      return []
    }
  }

    async actualizarTramiteConComentario(
    tramiteId: string,
    estado: string,
    comentario: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isAdmin()) {
        return { success: false, message: "Acceso denegado" }
      }

      console.log("📝 Actualizando trámite con comentario:", tramiteId)

      // Obtener datos del trámite y usuario
      const { data: tramiteData, error: tramiteError } = await this.supabase
        .from("tramites")
        .select(`
          *,
          usuarios!tramites_usuario_id_fkey (
            id,
            email,
            nombres,
            apellidos
          )
        `)
        .eq("id", tramiteId)
        .single()

      if (tramiteError || !tramiteData) {
        return { success: false, message: "Error obteniendo datos del trámite" }
      }

      // Actualizar el trámite
      const updateData = {
        estado,
        observaciones_admin: comentario,
        fecha_respuesta: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
      }

      const { error: updateError } = await this.supabase
        .from("tramites")
        .update(updateData)
        .eq("id", tramiteId)

      if (updateError) {
        console.error("❌ Error actualizando trámite:", updateError)
        return { success: false, message: "Error al actualizar el trámite" }
      }

      // 🔔 Insertar notificación en la tabla para ser enviada por backend/crons
      if (tramiteData.usuarios?.email) {
        await this.supabase.from("notificaciones_email").insert([
          {
            usuario_id: tramiteData.usuarios.id,
            tipo: "tramite_actualizado",
            asunto: `Actualización del trámite #${tramiteId}`,
            contenido: `
              <p>Hola ${tramiteData.usuarios.nombres},</p>
              <p>Tu trámite con ID <strong>${tramiteId}</strong> ha sido actualizado al estado <strong>${estado}</strong>.</p>
              <p><strong>Observación:</strong> ${comentario || 'Sin observaciones adicionales.'}</p>
              <p>Gracias por usar la plataforma.</p>
            `,
            enviado: false,
            fecha_envio: null
          }
        ])
      }

      const currentUser = this.getCurrentUser()
      if (currentUser) {
        await this.registrarActividad(
          currentUser.id!,
          "tramite_updated_with_comment",
          `Trámite ${tramiteId} actualizado a estado: ${estado} con comentario`,
        )
      }

      return { success: true, message: "Trámite actualizado y notificación registrada" }

    } catch (error) {
      console.error("❌ Error actualizando trámite:", error)
      return { success: false, message: "Error de conexión" }
    }
  }

}
