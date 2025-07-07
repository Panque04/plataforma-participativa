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
// SERVICIO PRINCIPAL DE SUPABASE CORREGIDO
// ============================================================================

@Injectable({
  providedIn: "root",
})
export class SupabaseService {
  private supabase: SupabaseClient
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  constructor() {
    this.supabase = createClient(
      "https://tdmjcepxnoeiknjoushl.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkbWpjZXB4bm9laWtuam91c2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNDc3MDEsImV4cCI6MjA2NjkyMzcwMX0.eL1Ng2aD6kxc7rdJyVT_mjuWvPoP_VW2qu8KyqdifJI",
    )

    // CORREGIDO: Inicialización sin sesión automática
    this.initializeAuth()
  }

  // ============================================================================
  // MÉTODOS DE INICIALIZACIÓN CORREGIDOS
  // ============================================================================

  private async initializeAuth() {
    try {
      console.log("🔧 Inicializando sistema de autenticación...")

      // CORREGIDO: Limpiar cualquier sesión persistente al iniciar
      const storedUser = localStorage.getItem("currentUser")
      if (storedUser) {
        console.log("🗑️ Limpiando sesión persistente anterior...")
        localStorage.removeItem("currentUser")
      }

      // Verificar sesión actual
      const {
        data: { session },
        error,
      } = await this.supabase.auth.getSession()

      if (error) {
        console.error("❌ Error obteniendo sesión:", error)
        this.clearLocalData()
        return
      }

      // CORREGIDO: Solo cargar usuario si hay sesión válida Y reciente
      if (session?.user && this.isSessionValid(session)) {
        console.log("✅ Sesión válida encontrada para:", session.user.email)
        await this.loadUserFromAuth(session.user.id)
      } else {
        console.log("ℹ️ No hay sesión válida - iniciando sin usuario")
        this.clearLocalData()
      }

      // Escuchar cambios de autenticación
      this.supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("🔄 Cambio de estado de auth:", event)

        switch (event) {
          case "SIGNED_IN":
            if (session?.user) {
              await this.loadUserFromAuth(session.user.id)
              await this.registrarActividad(session.user.id, "login", "Usuario inició sesión")
            }
            break

          case "SIGNED_OUT":
            console.log("🚪 Usuario cerró sesión")
            this.clearLocalData()
            break

          case "TOKEN_REFRESHED":
            if (session?.user) {
              await this.loadUserFromAuth(session.user.id)
            }
            break
        }
      })
    } catch (error) {
      console.error("❌ Error inicializando autenticación:", error)
      this.clearLocalData()
    }
  }

  // NUEVO: Verificar si la sesión es válida (no muy antigua)
  private isSessionValid(session: any): boolean {
    if (!session.expires_at) return false

    const expiresAt = new Date(session.expires_at * 1000)
    const now = new Date()
    const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)

    // Solo considerar válida si expira en más de 1 hora
    return hoursUntilExpiry > 1
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
        // CORREGIDO: No guardar en localStorage para evitar persistencia no deseada
        this.currentUserSubject.next(userData)
      }
    } catch (error) {
      console.error("❌ Error cargando usuario:", error)
    }
  }

  // CORREGIDO: Limpiar datos completamente
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
        email: email,
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
        await new Promise((resolve) => setTimeout(resolve, 1000))

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

  // CORREGIDO: Logout completo
  async logout() {
    try {
      const currentUser = this.getCurrentUser()
      if (currentUser) {
        await this.registrarActividad(currentUser.id!, "logout", "Usuario cerró sesión")
      }

      console.log("🚪 Cerrando sesión...")

      // Cerrar sesión en Supabase
      await this.supabase.auth.signOut()

      // Limpiar todos los datos locales
      this.clearLocalData()

      console.log("✅ Sesión cerrada exitosamente")
    } catch (error) {
      console.error("❌ Error cerrando sesión:", error)
      // Aún así limpiar datos locales
      this.clearLocalData()
    }
  }

  async solicitarRecuperacionPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log("🔑 Verificando límite de recuperación para:", email)

      // Verificar límite de intentos
      const { data: limitCheck, error: limitError } = await this.supabase.rpc("verificar_limite_password_reset", {
        p_email: email,
      })

      if (limitError) {
        console.error("❌ Error verificando límite:", limitError)
        return {
          success: false,
          message: "Error del sistema. Intenta más tarde.",
        }
      }

      if (!limitCheck) {
        return {
          success: false,
          message: "Has excedido el límite de intentos de recuperación de contraseña. Intenta nuevamente en 1 hora.",
        }
      }

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

      // Actualizar usuario local
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

      const { error: uploadError } = await this.supabase.storage.from("profile-pictures").upload(filePath, file)

      if (uploadError) {
        console.error("❌ Error subiendo archivo:", uploadError)
        return { success: false, message: "Error al subir la imagen" }
      }

      const {
        data: { publicUrl },
      } = this.supabase.storage.from("profile-pictures").getPublicUrl(filePath)

      // Actualizar URL en la base de datos
      const updateResult = await this.actualizarPerfil({ foto_perfil: publicUrl })

      if (updateResult.success) {
        return { success: true, message: "Foto de perfil actualizada", url: publicUrl }
      } else {
        return { success: false, message: "Error actualizando la foto en el perfil" }
      }
    } catch (error) {
      console.error("❌ Error subiendo foto:", error)
      return { success: false, message: "Error de conexión" }
    }
  }

  // ============================================================================
  // MÉTODOS DE TRÁMITES
  // ============================================================================

  async crearTramite(tramite: Tramite): Promise<{ success: boolean; message: string }> {
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

      // CORREGIDO: Buscar por usuario_id en lugar de cedula_usuario
      const { data, error } = await this.supabase
        .from("tramites")
        .select("*")
        .eq("usuario_id", currentUser.id)
        .order("fecha_solicitud", { ascending: false })

      if (error) {
        console.error("❌ Error obteniendo trámites:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("❌ Error obteniendo trámites:", error)
      return []
    }
  }

  // CORREGIDO: Método para obtener todos los trámites (admin)
  async obtenerTodosTramites(): Promise<Tramite[]> {
    try {
      if (!this.isAdmin()) {
        console.warn("⚠️ Acceso denegado: solo administradores")
        return []
      }

      console.log("📋 Obteniendo todos los trámites...")

      const { data, error } = await this.supabase
        .from("tramites")
        .select(
          `
          *,
          usuarios!tramites_usuario_id_fkey (
            nombres,
            apellidos,
            email
          )
        `,
        )
        .order("fecha_solicitud", { ascending: false })

      if (error) {
        console.error("❌ Error obteniendo todos los trámites:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("❌ Error obteniendo todos los trámites:", error)
      return []
    }
  }

  // CORREGIDO: Método para actualizar trámite
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

      if (estado === "aprobado" || estado === "rechazado") {
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
        .select(
          `
          *,
          usuarios!sugerencias_usuario_id_fkey (
            nombres,
            apellidos
          )
        `,
        )
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

  // NUEVO: Método para actualizar estado de sugerencia
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

      const [usuariosResult, tramitesResult, sugerenciasResult] = await Promise.all([
        this.supabase.from("usuarios").select("id, fecha_registro, activo"),
        this.supabase.from("tramites").select("id, estado, fecha_solicitud"),
        this.supabase.from("sugerencias").select("id, estado, fecha_creacion"),
      ])

      const usuarios = usuariosResult.data || []
      const tramites = tramitesResult.data || []
      const sugerencias = sugerenciasResult.data || []

      const estadisticas = {
        usuarios: {
          total: usuarios.length,
          activos: usuarios.filter((u) => u.activo).length,
          nuevos_mes: usuarios.filter((u) => {
            const fecha = new Date(u.fecha_registro)
            const ahora = new Date()
            return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
          }).length,
        },
        tramites: {
          total: tramites.length,
          pendientes: tramites.filter((t) => t.estado === "pendiente").length,
          aprobados: tramites.filter((t) => t.estado === "aprobado").length,
          rechazados: tramites.filter((t) => t.estado === "rechazado").length,
          en_revision: tramites.filter((t) => t.estado === "en_revision").length,
        },
        sugerencias: {
          total: sugerencias.length,
          pendientes: sugerencias.filter((s) => s.estado === "pendiente").length,
          aprobadas: sugerencias.filter((s) => s.estado === "aprobada").length,
          rechazadas: sugerencias.filter((s) => s.estado === "rechazada").length,
        },
      }

      return estadisticas
    } catch (error) {
      console.error("❌ Error obteniendo estadísticas:", error)
      return null
    }
  }

  // ============================================================================
  // MÉTODOS DE GEOVISOR
  // ============================================================================

  async subirGeoJson(geoJsonFile: GeoJsonFile): Promise<{ success: boolean; message: string }> {
    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser || !this.isAdmin()) {
        return { success: false, message: "Acceso denegado" }
      }

      console.log("🗺️ Subiendo archivo GeoJSON...")

      // Desactivar archivo anterior
      await this.supabase.from("geojson_files").update({ activo: false }).eq("activo", true)

      const geoJsonCompleto = {
        ...geoJsonFile,
        usuario_id: currentUser.id,
        activo: true,
        fecha_subida: new Date().toISOString(),
      }

      const { error } = await this.supabase.from("geojson_files").insert([geoJsonCompleto])

      if (error) {
        console.error("❌ Error subiendo GeoJSON:", error)
        return { success: false, message: "Error al subir el archivo" }
      }

      await this.registrarActividad(
        currentUser.id!,
        "geojson_uploaded",
        `Archivo GeoJSON subido: ${geoJsonFile.nombre}`,
      )

      return { success: true, message: "Archivo GeoJSON subido exitosamente" }
    } catch (error) {
      console.error("❌ Error subiendo GeoJSON:", error)
      return { success: false, message: "Error de conexión" }
    }
  }

  async obtenerGeoJsonActivo(): Promise<GeoJsonFile | null> {
    try {
      console.log("🗺️ Obteniendo archivo GeoJSON activo...")

      const { data, error } = await this.supabase.from("geojson_files").select("*").eq("activo", true).single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("ℹ️ No hay archivo GeoJSON activo")
          return null
        }
        console.error("❌ Error obteniendo GeoJSON:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("❌ Error obteniendo GeoJSON:", error)
      return null
    }
  }

  // NUEVO: Método para buscar en GeoJSON
  async buscarEnGeoJson(valor: string, geoJsonData: any): Promise<any> {
    try {
      console.log("🔍 Buscando en GeoJSON:", valor)

      if (!geoJsonData?.features) {
        console.warn("⚠️ No hay datos GeoJSON para buscar")
        return null
      }

      // Buscar en las propiedades de cada feature
      const feature = geoJsonData.features.find((f: any) => {
        const props = f.properties || {}

        // Buscar por código predial
        if (props.CODIGO && props.CODIGO.toString().toLowerCase().includes(valor.toLowerCase())) {
          return true
        }

        // Buscar por matrícula inmobiliaria
        if (props.MATRICULA_ && props.MATRICULA_.toString().toLowerCase().includes(valor.toLowerCase())) {
          return true
        }

        // Buscar por dirección
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

  // NUEVO: Obtener todos los usuarios (admin)
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

  // NUEVO: Cambiar rol de usuario
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

  // NUEVO: Obtener logs de actividad
  async obtenerLogsActividad(): Promise<any[]> {
    try {
      if (!this.isAdmin()) {
        console.warn("⚠️ Acceso denegado: solo administradores")
        return []
      }

      console.log("📋 Obteniendo logs de actividad...")

      const { data, error } = await this.supabase
        .from("logs_actividad")
        .select(
          `
          *,
          usuarios!logs_actividad_usuario_id_fkey (
            nombres,
            apellidos,
            email
          )
        `,
        )
        .order("fecha", { ascending: false })
        .limit(100)

      if (error) {
        console.error("❌ Error obteniendo logs:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("❌ Error obteniendo logs:", error)
      return []
    }
  }

  // NUEVO: Obtener métricas del sistema
  async obtenerMetricasSistema(): Promise<MetricasSistema | null> {
    try {
      if (!this.isAdmin()) {
        console.warn("⚠️ Acceso denegado: solo administradores")
        return null
      }

      console.log("📊 Obteniendo métricas del sistema...")

      const hoy = new Date().toISOString().split("T")[0]

      const { data, error } = await this.supabase.from("metricas_sistema").select("*").eq("fecha", hoy).single()

      if (error) {
        if (error.code === "PGRST116") {
          // No hay métricas para hoy, crear nuevas
          await this.actualizarMetricasDiarias()
          return await this.obtenerMetricasSistema()
        }
        console.error("❌ Error obteniendo métricas:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("❌ Error obteniendo métricas:", error)
      return null
    }
  }

  // NUEVO: Actualizar métricas diarias
  async actualizarMetricasDiarias(): Promise<void> {
    try {
      if (!this.isAdmin()) {
        console.warn("⚠️ Acceso denegado: solo administradores")
        return
      }

      console.log("📊 Actualizando métricas diarias...")

      const hoy = new Date().toISOString().split("T")[0]

      // Obtener estadísticas actuales
      const estadisticas = await this.obtenerEstadisticas()

      if (!estadisticas) return

      const metricas: MetricasSistema = {
        fecha: hoy,
        usuarios_activos: estadisticas.usuarios.activos,
        tramites_creados: estadisticas.tramites.total,
        tramites_procesados: estadisticas.tramites.aprobados + estadisticas.tramites.rechazados,
        sugerencias_creadas: estadisticas.sugerencias.total,
      }

      // Insertar o actualizar métricas
      const { error } = await this.supabase.from("metricas_sistema").upsert([metricas], { onConflict: "fecha" })

      if (error) {
        console.error("❌ Error actualizando métricas:", error)
      } else {
        console.log("✅ Métricas actualizadas exitosamente")
      }
    } catch (error) {
      console.error("❌ Error actualizando métricas:", error)
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
          ip_address: "127.0.0.1", // En producción, obtener IP real
        },
      ])

      if (error) {
        console.error("❌ Error registrando actividad:", error)
      }
    } catch (error) {
      console.error("❌ Error registrando actividad:", error)
    }
  }
}
