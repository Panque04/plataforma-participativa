import type { Routes } from "@angular/router"
import { HomeComponent } from "./pages/home/home.component"
import { LoginComponent } from "./pages/login/login.component"
import { TramiteComponent } from "./pages/tramite/tramite.component"
import { EstadisticosComponent } from "./pages/estadisticos/estadisticos.component"
import { PerfilComponent } from "./pages/perfil/perfil.component"
import { GobernanzaComponent } from "./pages/gobernanza/gobernanza.component"
import { SugerenciasComponent } from "./pages/sugerencias/sugerencias.component"
import { MapaSitioComponent } from "./pages/mapa-sitio/mapa-sitio.component"
import { GeovisorComponent } from "./pages/geovisor/geovisor.component"
import { AdminComponent } from "./pages/admin/admin.component"
import { ResetPasswordComponent } from "./pages/reset-password/reset-password.component"
import { InstructivoComponent } from "./pages/instructivo/instructivo.component"
import { AuthGuard } from "./guards/auth.guard"
import { AdminGuard } from "./guards/admin.guard"

export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "login", component: LoginComponent },
  { path: "geovisor", component: GeovisorComponent },
  { path: "tramite", component: TramiteComponent, canActivate: [AuthGuard] },
  { path: "estadisticos", component: EstadisticosComponent },
  { path: "perfil", component: PerfilComponent, canActivate: [AuthGuard] },
  { path: "mis-tramites", component: TramiteComponent, canActivate: [AuthGuard] },
  { path: "gobernanza", component: GobernanzaComponent },
  { path: "sugerencias", component: SugerenciasComponent },
  { path: "mapa-sitio", component: MapaSitioComponent },
  { path: "admin", component: AdminComponent, canActivate: [AdminGuard] },
  { path: "reset-password", component: ResetPasswordComponent },
  { path: "instructivo", component: InstructivoComponent },
  { path: "**", redirectTo: "" },
]
