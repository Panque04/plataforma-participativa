import type { Routes } from "@angular/router"
import { HomeComponent } from "./pages/home/home.component"
import { TramiteComponent } from "./pages/tramite/tramite.component"
import { LoginComponent } from "./pages/login/login.component"
import { EstadisticosComponent } from "./pages/estadisticos/estadisticos.component"
import { AuthGuard } from "./guards/auth.guard"

// Importar las páginas existentes
import { AdminComponent } from "./pages/admin/admin.component"
import { GeovisorComponent } from "./pages/geovisor/geovisor.component"
import { AdminGuard } from "./guards/admin.guard"
import { PerfilComponent } from "./pages/perfil/perfil.component"
import { GobernanzaComponent } from "./pages/gobernanza/gobernanza.component"
import { SugerenciasComponent } from "./pages/sugerencias/sugerencias.component"
import { MapaSitioComponent } from "./pages/mapa-sitio/mapa-sitio.component"

// Importar el nuevo componente de reset password
import { ResetPasswordComponent } from "./pages/reset-password/reset-password.component"
import { InstructivoComponent } from "./pages/instructivo/instructivo.component"

/**
 * Configuración de rutas de la aplicación
 * Incluye protección con guards para rutas que requieren autenticación
 */
export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "home", component: HomeComponent },
  { path: "geovisor", component: GeovisorComponent },
  { path: "tramite", component: TramiteComponent, canActivate: [AuthGuard] },
  { path: "login", component: LoginComponent },
  { path: "reset-password", component: ResetPasswordComponent }, // Nueva ruta para reset de contraseña
  { path: "estadisticos", component: EstadisticosComponent },
  { path: "perfil", component: PerfilComponent, canActivate: [AuthGuard] },
  { path: "admin", component: AdminComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: "gobernanza", component: GobernanzaComponent },
  { path: "sugerencias", component: SugerenciasComponent },
  { path: "mapa-sitio", component: MapaSitioComponent },
  { path: "instructivo", component: InstructivoComponent },
  { path: "**", redirectTo: "" }, // Ruta wildcard para manejar URLs no encontradas
]