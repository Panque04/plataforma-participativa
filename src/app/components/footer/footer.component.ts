import { Component } from "@angular/core"
import { RouterModule } from "@angular/router"

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [RouterModule],
  template: `
    <footer>
      <div class="footer-info">
        <h3>Información de la Entidad</h3>
        <p>Dirección: Calle 41 B Sur, Tausa, Colombia</p>
        <p>Teléfono: +57 (601) 881-7890</p>
        <p>Email: alcaldia&#64;tausa-cundinamarca.gov.co</p>
      </div>
      <div class="footer-horarios">
        <h3>Horarios de Atención</h3>
        <p>Lunes a Viernes: 8:00 AM - 5:00 PM</p>
        <p>Sábado: 9:00 AM - 1:00 PM</p>
      </div>
      <div class="footer-soporte">
        <h3>Correos de Soporte</h3>
        <p>General: soporte&#64;entidad.com</p>
        <p>Técnico: techsoporte&#64;entidad.com</p>
        <p><a routerLink="/mapa-sitio">🗺️ Mapa del Sitio</a></p>
      </div>
    </footer>
  `,
  styleUrls: ["./footer.component.css"],
})
export class FooterComponent {}
