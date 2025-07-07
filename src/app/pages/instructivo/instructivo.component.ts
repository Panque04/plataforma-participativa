import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-instructivo",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="instructivo-container">
      <div class="instructivo-header">
        <h1>📚 Instructivo de Uso - Sistema Catastral Tausa</h1>
        <p>Guía completa para utilizar todas las funcionalidades de la plataforma</p>
      </div>

      <div class="instructivo-nav">
        <button 
          *ngFor="let seccion of secciones; let i = index" 
          class="nav-btn"
          [class.active]="seccionActiva === i"
          (click)="cambiarSeccion(i)">
          {{ seccion.titulo }}
        </button>
      </div>

      <div class="instructivo-content">
        <div class="seccion" *ngIf="seccionActiva === 0">
          <h2>🚀 Primeros Pasos</h2>
          
          <div class="paso">
            <h3>1. 📝 Registro de Usuario</h3>
            <div class="paso-content">
              <p><strong>Para registrarse en el sistema:</strong></p>
              <ol>
                <li>Haga clic en <strong>"Iniciar Sesión"</strong> en la esquina superior derecha</li>
                <li>Seleccione <strong>"¿No tienes cuenta? Regístrate aquí"</strong></li>
                <li>Complete todos los campos obligatorios:
                  <ul>
                    <li>📄 <strong>Cédula:</strong> Su número de identificación</li>
                    <li>👤 <strong>Nombres:</strong> Sus nombres completos</li>
                    <li>👤 <strong>Apellidos:</strong> Sus apellidos completos</li>
                    <li>📧 <strong>Email:</strong> Correo electrónico válido</li>
                    <li>📱 <strong>Teléfono:</strong> Número de contacto</li>
                    <li>🔒 <strong>Contraseña:</strong> Mínimo 6 caracteres</li>
                  </ul>
                </li>
                <li>Haga clic en <strong>"Registrarse"</strong></li>
                <li>📧 <strong>Revise su email</strong> y haga clic en el enlace de verificación</li>
                <li>¡Ya puede iniciar sesión!</li>
              </ol>
            </div>
          </div>

          <div class="paso">
            <h3>2. 🔐 Iniciar Sesión</h3>
            <div class="paso-content">
              <p><strong>Para acceder al sistema:</strong></p>
              <ol>
                <li>Haga clic en <strong>"Iniciar Sesión"</strong></li>
                <li>Ingrese su <strong>email</strong> y <strong>contraseña</strong></li>
                <li>Haga clic en <strong>"Ingresar"</strong></li>
                <li>Su nombre aparecerá en la esquina superior derecha</li>
              </ol>
              
              <div class="tip">
                <strong>💡 Tip:</strong> Si olvidó su contraseña, use "¿Olvidaste tu contraseña?" para recuperarla.
              </div>
            </div>
          </div>

          <div class="paso">
            <h3>3. 🏠 Navegación Principal</h3>
            <div class="paso-content">
              <p><strong>El menú principal incluye:</strong></p>
              <ul>
                <li>🏠 <strong>Inicio:</strong> Página principal con información</li>
                <li>📋 <strong>Trámites:</strong> Crear y consultar sus solicitudes</li>
                <li>🗺️ <strong>Geovisor:</strong> Mapa interactivo de predios</li>
                <li>📊 <strong>Estadísticas:</strong> Datos del sistema</li>
                <li>🏛️ <strong>Gobernanza:</strong> Información institucional</li>
                <li>💡 <strong>Sugerencias:</strong> Enviar ideas y comentarios</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="seccion" *ngIf="seccionActiva === 1">
          <h2>📋 Gestión de Trámites</h2>
          
          <div class="paso">
            <h3>1. 📝 Crear un Nuevo Trámite</h3>
            <div class="paso-content">
              <p><strong>Pasos para solicitar un trámite:</strong></p>
              <ol>
                <li>Vaya a la sección <strong>"Trámites"</strong></li>
                <li>Haga clic en <strong>"Nuevo Trámite"</strong></li>
                <li>Seleccione el <strong>tipo de trámite</strong> que necesita</li>
                <li>Complete el formulario con la información requerida</li>
                <li>Haga clic en <strong>"Enviar Solicitud"</strong></li>
                <li>Recibirá una confirmación de que su trámite fue creado</li>
              </ol>
            </div>
          </div>

          <div class="paso">
            <h3>2. 📋 Tipos de Trámites Disponibles</h3>
            <div class="paso-content">
              <div class="tramite-tipo">
                <h4>🏠 Subdivisión Predial</h4>
                <p>Para dividir un predio en varios lotes más pequeños.</p>
                <p><strong>Información requerida:</strong> Número de parcelas, área total, descripción.</p>
              </div>

              <div class="tramite-tipo">
                <h4>🔄 Englobo de Predios</h4>
                <p>Para unir varios predios en uno solo.</p>
                <p><strong>Información requerida:</strong> Número de predios a unir, área total.</p>
              </div>

              <div class="tramite-tipo">
                <h4>📐 Reloteo</h4>
                <p>Para redistribuir lotes existentes.</p>
                <p><strong>Información requerida:</strong> Descripción de la modificación.</p>
              </div>

              <div class="tramite-tipo">
                <h4>🏗️ Construcción Nueva</h4>
                <p>Para registrar nuevas construcciones.</p>
                <p><strong>Información requerida:</strong> Área construida, tipo de construcción.</p>
              </div>

              <div class="tramite-tipo">
                <h4>🔧 Modificación Catastral</h4>
                <p>Para cambios en características del predio.</p>
                <p><strong>Información requerida:</strong> Tipo de modificación, justificación.</p>
              </div>
            </div>
          </div>

          <div class="paso">
            <h3>3. 📊 Estados de Trámites</h3>
            <div class="paso-content">
              <div class="estado-item">
                <span class="estado-badge pendiente">🟡 Pendiente</span>
                <p>Su trámite fue recibido y está en cola para revisión.</p>
              </div>
              <div class="estado-item">
                <span class="estado-badge revision">🔵 En Revisión</span>
                <p>Un funcionario está evaluando su solicitud.</p>
              </div>
              <div class="estado-item">
                <span class="estado-badge aprobado">🟢 Aprobado</span>
                <p>Su trámite fue aprobado. Recibirá notificación por email.</p>
              </div>
              <div class="estado-item">
                <span class="estado-badge rechazado">🔴 Rechazado</span>
                <p>Su trámite fue rechazado. Revise las observaciones.</p>
              </div>
            </div>
          </div>

          <div class="paso">
            <h3>4. 👀 Consultar Mis Trámites</h3>
            <div class="paso-content">
              <p><strong>Para ver el estado de sus trámites:</strong></p>
              <ol>
                <li>Vaya a <strong>"Trámites"</strong></li>
                <li>En la sección <strong>"Mis Trámites"</strong> verá todas sus solicitudes</li>
                <li>Cada trámite muestra:
                  <ul>
                    <li>📅 Fecha de solicitud</li>
                    <li>📋 Tipo de trámite</li>
                    <li>🔄 Estado actual</li>
                    <li>💬 Observaciones (si las hay)</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div class="seccion" *ngIf="seccionActiva === 2">
          <h2>🗺️ Uso del Geovisor</h2>
          
          <div class="paso">
            <h3>1. 🌍 Navegación Básica</h3>
            <div class="paso-content">
              <p><strong>Controles del mapa:</strong></p>
              <ul>
                <li>🖱️ <strong>Arrastrar:</strong> Mover el mapa</li>
                <li>🔍 <strong>Zoom:</strong> Usar la rueda del mouse o botones +/-</li>
                <li>🎯 <strong>Ubicación:</strong> Botón para ir a su ubicación actual</li>
                <li>🗺️ <strong>Capas:</strong> Cambiar entre vista satelital y calles</li>
              </ul>
            </div>
          </div>

          <div class="paso">
            <h3>2. 🔍 Búsqueda de Predios</h3>
            <div class="paso-content">
              <p><strong>Para buscar un predio específico:</strong></p>
              <ol>
                <li>Use la <strong>barra de búsqueda</strong> en la parte superior</li>
                <li>Ingrese:
                  <ul>
                    <li>📄 <strong>Código predial</strong> (ej: 25754000000010001000000000)</li>
                    <li>📋 <strong>Matrícula inmobiliaria</strong> (ej: 050-123456)</li>
                    <li>🏠 <strong>Dirección</strong> (ej: Calle 1 # 2-3)</li>
                  </ul>
                </li>
                <li>Presione <strong>Enter</strong> o haga clic en <strong>"Buscar"</strong></li>
                <li>El mapa se centrará en el predio encontrado</li>
                <li>Haga clic en el predio para ver su información</li>
              </ol>
            </div>
          </div>

          <div class="paso">
            <h3>3. 📏 Herramientas de Medición</h3>
            <div class="paso-content">
              <p><strong>Para medir distancias y áreas:</strong></p>
              <ol>
                <li>Haga clic en el botón <strong>"Medir"</strong></li>
                <li>Seleccione:
                  <ul>
                    <li>📏 <strong>Distancia:</strong> Para medir líneas</li>
                    <li>📐 <strong>Área:</strong> Para medir superficies</li>
                  </ul>
                </li>
                <li>Haga clic en el mapa para marcar puntos</li>
                <li>Doble clic para finalizar la medición</li>
                <li>El resultado aparecerá en pantalla</li>
              </ol>
            </div>
          </div>

          <div class="paso">
            <h3>4. ℹ️ Información de Predios</h3>
            <div class="paso-content">
              <p><strong>Al hacer clic en un predio verá:</strong></p>
              <ul>
                <li>📄 <strong>Código predial</strong></li>
                <li>📋 <strong>Matrícula inmobiliaria</strong></li>
                <li>🏠 <strong>Dirección</strong></li>
                <li>📐 <strong>Área del terreno</strong></li>
                <li>🏗️ <strong>Área construida</strong></li>
                <li>💰 <strong>Avalúo catastral</strong></li>
                <li>👤 <strong>Propietario</strong> (si está disponible)</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="seccion" *ngIf="seccionActiva === 3">
          <h2>👤 Gestión de Perfil</h2>
          
          <div class="paso">
            <h3>1. ✏️ Editar Información Personal</h3>
            <div class="paso-content">
              <p><strong>Para actualizar sus datos:</strong></p>
              <ol>
                <li>Haga clic en su <strong>nombre</strong> en la esquina superior derecha</li>
                <li>Seleccione <strong>"Mi Perfil"</strong></li>
                <li>Haga clic en <strong>"Editar Perfil"</strong></li>
                <li>Modifique los campos que desee cambiar</li>
                <li>Haga clic en <strong>"Guardar Cambios"</strong></li>
              </ol>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong> No puede cambiar su cédula una vez registrada.
              </div>
            </div>
          </div>

          <div class="paso">
            <h3>2. 📸 Cambiar Foto de Perfil</h3>
            <div class="paso-content">
              <p><strong>Para subir una nueva foto:</strong></p>
              <ol>
                <li>Vaya a <strong>"Mi Perfil"</strong></li>
                <li>Haga clic en la <strong>foto actual</strong> o en <strong>"Cambiar Foto"</strong></li>
                <li>Seleccione una imagen de su computador</li>
                <li>La foto se subirá automáticamente</li>
              </ol>
              
              <div class="tip">
                <strong>💡 Tip:</strong> Use imágenes cuadradas de máximo 2MB para mejores resultados.
              </div>
            </div>
          </div>

          <div class="paso">
            <h3>3. 🔒 Cambiar Contraseña</h3>
            <div class="paso-content">
              <p><strong>Para actualizar su contraseña:</strong></p>
              <ol>
                <li>En <strong>"Mi Perfil"</strong>, busque la sección <strong>"Seguridad"</strong></li>
                <li>Haga clic en <strong>"Cambiar Contraseña"</strong></li>
                <li>Ingrese su <strong>contraseña actual</strong></li>
                <li>Ingrese la <strong>nueva contraseña</strong> (mínimo 6 caracteres)</li>
                <li>Confirme la nueva contraseña</li>
                <li>Haga clic en <strong>"Actualizar Contraseña"</strong></li>
              </ol>
            </div>
          </div>

          <div class="paso">
            <h3>4. 📊 Ver Mis Estadísticas</h3>
            <div class="paso-content">
              <p><strong>En su perfil puede ver:</strong></p>
              <ul>
                <li>📋 <strong>Total de trámites</strong> realizados</li>
                <li>✅ <strong>Trámites aprobados</strong></li>
                <li>⏳ <strong>Trámites pendientes</strong></li>
                <li>💡 <strong>Sugerencias enviadas</strong></li>
                <li>📅 <strong>Fecha de registro</strong></li>
                <li>🕐 <strong>Última actividad</strong></li>
              </ul>
            </div>
          </div>
        </div>

        <div class="seccion" *ngIf="seccionActiva === 4">
          <h2>💡 Sistema de Sugerencias</h2>
          
          <div class="paso">
            <h3>1. 📝 Enviar una Sugerencia</h3>
            <div class="paso-content">
              <p><strong>Para enviar ideas o comentarios:</strong></p>
              <ol>
                <li>Vaya a la sección <strong>"Sugerencias"</strong></li>
                <li>Haga clic en <strong>"Nueva Sugerencia"</strong></li>
                <li>Complete el formulario:
                  <ul>
                    <li>📝 <strong>Título:</strong> Resumen de su sugerencia</li>
                    <li>📂 <strong>Categoría:</strong> Tipo de sugerencia</li>
                    <li>📄 <strong>Descripción:</strong> Detalle completo</li>
                  </ul>
                </li>
                <li>Haga clic en <strong>"Enviar Sugerencia"</strong></li>
              </ol>
            </div>
          </div>

          <div class="paso">
            <h3>2. 📂 Categorías de Sugerencias</h3>
            <div class="paso-content">
              <div class="categoria-item">
                <h4>🏛️ Mejora de Servicios</h4>
                <p>Ideas para mejorar los servicios municipales.</p>
              </div>
              <div class="categoria-item">
                <h4>🔧 Problema Técnico</h4>
                <p>Reportar errores o problemas en la plataforma.</p>
              </div>
              <div class="categoria-item">
                <h4>📋 Nuevo Trámite</h4>
                <p>Proponer nuevos tipos de trámites.</p>
              </div>
              <div class="categoria-item">
                <h4>🌟 Idea General</h4>
                <p>Cualquier otra idea o comentario.</p>
              </div>
            </div>
          </div>

          <div class="paso">
            <h3>3. 👀 Ver Mis Sugerencias</h3>
            <div class="paso-content">
              <p><strong>Para consultar el estado de sus sugerencias:</strong></p>
              <ol>
                <li>En <strong>"Sugerencias"</strong>, vaya a <strong>"Mis Sugerencias"</strong></li>
                <li>Verá todas sus sugerencias con:
                  <ul>
                    <li>📅 Fecha de envío</li>
                    <li>📂 Categoría</li>
                    <li>🔄 Estado actual</li>
                    <li>💬 Respuesta del administrador (si la hay)</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div class="seccion" *ngIf="seccionActiva === 5">
          <h2>📊 Consulta de Estadísticas</h2>
          
          <div class="paso">
            <h3>1. 📈 Estadísticas Públicas</h3>
            <div class="paso-content">
              <p><strong>En la sección "Estadísticas" puede ver:</strong></p>
              <ul>
                <li>👥 <strong>Usuarios registrados</strong> en el sistema</li>
                <li>📋 <strong>Total de trámites</strong> procesados</li>
                <li>📊 <strong>Trámites por tipo</strong> y estado</li>
                <li>💡 <strong>Sugerencias recibidas</strong></li>
                <li>📅 <strong>Actividad mensual</strong></li>
                <li>🏛️ <strong>Tiempo promedio</strong> de respuesta</li>
              </ul>
            </div>
          </div>

          <div class="paso">
            <h3>2. 📊 Gráficos Interactivos</h3>
            <div class="paso-content">
              <p><strong>Los gráficos le permiten:</strong></p>
              <ul>
                <li>🔍 <strong>Hacer zoom</strong> en períodos específicos</li>
                <li>👆 <strong>Hacer clic</strong> en elementos para ver detalles</li>
                <li>📱 <strong>Ver en móvil</strong> con diseño adaptativo</li>
                <li>📄 <strong>Exportar datos</strong> (próximamente)</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="seccion" *ngIf="seccionActiva === 6">
          <h2>❓ Preguntas Frecuentes</h2>
          
          <div class="faq-item">
            <h3>❓ ¿Cómo recupero mi contraseña?</h3>
            <p>En la página de login, haga clic en "¿Olvidaste tu contraseña?" e ingrese su email. Recibirá un enlace para crear una nueva contraseña.</p>
          </div>

          <div class="faq-item">
            <h3>❓ ¿Cuánto tiempo tarda en procesarse un trámite?</h3>
            <p>Los trámites se procesan en orden de llegada. El tiempo promedio es de 5-10 días hábiles, dependiendo de la complejidad.</p>
          </div>

          <div class="faq-item">
            <h3>❓ ¿Puedo cancelar un trámite?</h3>
            <p>Los trámites en estado "Pendiente" pueden ser cancelados contactando al administrador. Los trámites "En Revisión" o posteriores no pueden cancelarse.</p>
          </div>

          <div class="faq-item">
            <h3>❓ ¿Por qué no encuentro mi predio en el geovisor?</h3>
            <p>Algunos predios pueden no estar actualizados en el mapa. Contacte al administrador para reportar predios faltantes.</p>
          </div>

          <div class="faq-item">
            <h3>❓ ¿Cómo cambio mi información personal?</h3>
            <p>Vaya a "Mi Perfil" y haga clic en "Editar Perfil". Algunos datos como la cédula no pueden modificarse.</p>
          </div>

          <div class="faq-item">
            <h3>❓ ¿El sistema funciona en móviles?</h3>
            <p>Sí, el sistema está optimizado para funcionar en computadores, tablets y teléfonos móviles.</p>
          </div>

          <div class="faq-item">
            <h3>❓ ¿Cómo contacto al soporte técnico?</h3>
            <p>Puede enviar una sugerencia con categoría "Problema Técnico" o contactar directamente a la alcaldía.</p>
          </div>
        </div>

        <div class="seccion" *ngIf="seccionActiva === 7">
          <h2>📞 Contacto y Soporte</h2>
          
          <div class="contacto-info">
            <h3>🏛️ Alcaldía Municipal de Tausa</h3>
            <div class="contacto-item">
              <strong>📍 Dirección:</strong>
              <p>Carrera 4 # 4-52, Tausa, Cundinamarca</p>
            </div>
            <div class="contacto-item">
              <strong>📞 Teléfono:</strong>
              <p>(601) 854-6001</p>
            </div>
            <div class="contacto-item">
              <strong>📧 Email:</strong>
              <p>contacto&#64;tausa-cundinamarca.gov.co</p>
            </div>
            <div class="contacto-item">
              <strong>🕐 Horario de Atención:</strong>
              <p>Lunes a Viernes: 8:00 AM - 12:00 PM y 1:00 PM - 5:00 PM</p>
            </div>
          </div>

          <div class="soporte-tecnico">
            <h3>💻 Soporte Técnico</h3>
            <p>Para problemas técnicos con la plataforma:</p>
            <ol>
              <li>Envíe una sugerencia con categoría "Problema Técnico"</li>
              <li>Incluya una descripción detallada del problema</li>
              <li>Mencione qué navegador está usando</li>
              <li>Adjunte capturas de pantalla si es posible</li>
            </ol>
          </div>

          <div class="tip-final">
            <h3>💡 Consejos Finales</h3>
            <ul>
              <li>🔄 <strong>Mantenga actualizada</strong> su información de contacto</li>
              <li>📧 <strong>Revise su email</strong> regularmente para notificaciones</li>
              <li>🔒 <strong>No comparta</strong> sus credenciales de acceso</li>
              <li>💾 <strong>Guarde</strong> los números de sus trámites</li>
              <li>📱 <strong>Use la plataforma</strong> desde dispositivos seguros</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./instructivo.component.css"],
})
export class InstructivoComponent {
  seccionActiva = 0

  secciones = [
    { titulo: "🚀 Primeros Pasos" },
    { titulo: "📋 Trámites" },
    { titulo: "🗺️ Geovisor" },
    { titulo: "👤 Mi Perfil" },
    { titulo: "💡 Sugerencias" },
    { titulo: "📊 Estadísticas" },
    { titulo: "❓ FAQ" },
    { titulo: "📞 Contacto" },
  ]

  cambiarSeccion(index: number) {
    this.seccionActiva = index
  }
}
