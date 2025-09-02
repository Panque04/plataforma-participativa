import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-curso-gobernanza',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./curso-gobernanza.component.css'],
  template: `
    <section class="curso-container">
      <div class="barra-progreso">
        <div class="progreso" [style.width.%]="progreso"></div>
      </div>

      <div class="certificado-container" *ngIf="progreso === 100">
        <a href="/assets/certificado.pdf" class="btn-certificado" download>🎓 Descargar certificado</a>
      </div>

      <div *ngFor="let modulo of modulos; let i = index" 
           class="modulo" 
           [ngClass]="{'bloqueado': !modulo.habilitado}">

        <div class="modulo-header" (click)="toggleModulo(i)">
          <h3>
            <span class="modulo-icon">{{ modulo.emoji }}</span>
            {{ modulo.titulo }}
            <span *ngIf="!modulo.habilitado" class="locked-icon">🔒</span>
          </h3>
          <span class="toggle-icon" [class.rotado]="modulo.expandido">▶</span>
        </div>

        <div *ngIf="modulo.expandido && modulo.habilitado" class="modulo-contenido">
          <p *ngFor="let parrafo of modulo.contenido">{{ parrafo }}</p>

          <div *ngIf="modulo.ejemplo" class="ejemplo">
            <strong>📌 Ejemplo:</strong> <em>{{ modulo.ejemplo }}</em>
          </div>

          <div *ngIf="modulo.nota" class="nota">
            <strong>🟦 Recuerda:</strong> {{ modulo.nota }}
          </div>

          <div *ngIf="modulo.importante" class="importante">
            <strong>⚠️ Importante:</strong> {{ modulo.importante }}
          </div>

          <button class="btn-evaluacion" (click)="mostrarEvaluacion[i] = !mostrarEvaluacion[i]">
            {{ mostrarEvaluacion[i] ? 'Ocultar' : 'Mostrar' }} evaluación del módulo
          </button>

          <form *ngIf="mostrarEvaluacion[i]" class="evaluacion" (ngSubmit)="evaluarModulo(i)">
            <div *ngFor="let pregunta of modulo.evaluacion.preguntas; let j = index" class="pregunta-bloque">
              <label class="pregunta-titulo"><strong>Pregunta {{ j + 1 }}:</strong> {{ pregunta.texto }}</label>
              <div class="opciones">
                <label *ngFor="let opcion of pregunta.opciones; let k = index" class="opcion">
                  <input type="radio" name="respuesta{{i}}_{{j}}" [value]="opcion" [(ngModel)]="respuestas[i][j]">
                  {{ letras[k] }}) {{ opcion }}
                </label>
              </div>
            </div>
            <button class="btn-verde" type="submit">Enviar respuestas</button>
          </form>
        </div>
      </div>
    </section>
  `
})
export class CursoGobernanzaComponent {
  mostrarEvaluacion: boolean[] = [false, false, false, false];
  respuestas: string[][] = [[], [], [], []];
  progreso = 0;
  letras = ['a', 'b', 'c', 'd'];

  modulos = [
    {
      titulo: 'Módulo 1: ¿Qué es la Gobernanza Territorial?',
      emoji: '🟩',
      contenido: [
        'La gobernanza territorial es la forma en que las comunidades, instituciones y autoridades interactúan para tomar decisiones sobre el uso y cuidado del territorio.',
        'Se basa en la participación activa, la equidad, la transparencia y la corresponsabilidad.',
        'En Colombia, fortalece la democracia y promueve el desarrollo sostenible. La Ley 1454 de 2011 es un ejemplo de ello.',
        'A través de procesos de planificación, se decide cómo conservar, usar o restaurar los recursos del territorio.'
      ],
      ejemplo: 'En una vereda, los habitantes se reúnen con la alcaldía para decidir cómo cuidar una quebrada.',
      nota: 'La gobernanza no es solo del Estado, ¡es de todos! Campesinos, jóvenes, mujeres, indígenas y empresarios pueden participar.',
      importante: 'Es clave que todos los actores tengan voz y voto en las decisiones territoriales.',
      evaluacion: {
        preguntas: [
          {
            texto: '¿Cuál es el objetivo principal de la gobernanza territorial?',
            opciones: ['Control del gobierno', 'Participación de todos los actores', 'Recaudo de impuestos'],
            respuestaCorrecta: 'Participación de todos los actores'
          },
          {
            texto: '¿Qué ley fortalece la gobernanza territorial en Colombia?',
            opciones: ['Ley 80 de 1993', 'Ley 1454 de 2011', 'Ley 99 de 1993'],
            respuestaCorrecta: 'Ley 1454 de 2011'
          },
          {
            texto: '¿Qué valores son clave en la gobernanza territorial?',
            opciones: ['Poder y control', 'Equidad, participación y transparencia', 'Riqueza y desarrollo'],
            respuestaCorrecta: 'Equidad, participación y transparencia'
          }
        ]
      },
      habilitado: true,
      expandido: false
    },
    {
      titulo: 'Módulo 2: Participación Comunitaria',
      emoji: '🟨',
      contenido: [
        'La participación comunitaria es un pilar fundamental en la gobernanza territorial.',
        'Permite que las comunidades expresen sus necesidades, propuestas y visiones del territorio.',
        'Los mecanismos pueden incluir asambleas, presupuestos participativos, comités locales y audiencias públicas.',
        'Cuando la comunidad se involucra, se generan decisiones más justas, sostenibles y coherentes con la realidad del territorio.'
      ],
      ejemplo: 'En un proceso de zonificación ambiental, los campesinos proponen que una zona tradicionalmente usada para pastoreo se declare como uso múltiple.',
      nota: 'Una comunidad informada y empoderada es una comunidad que cuida su territorio.',
      importante: 'Incluir a mujeres, jóvenes e indígenas es esencial para una participación efectiva.',
      evaluacion: {
        preguntas: [
          {
            texto: '¿Por qué es importante la participación comunitaria?',
            opciones: ['Genera impuestos', 'Permite imponer normas', 'Contribuye a decisiones justas y sostenibles'],
            respuestaCorrecta: 'Contribuye a decisiones justas y sostenibles'
          },
          {
            texto: '¿Cuál de estos NO es un mecanismo de participación?',
            opciones: ['Audiencia pública', 'Presupuesto participativo', 'Expropiación directa'],
            respuestaCorrecta: 'Expropiación directa'
          },
          {
            texto: '¿Qué población debe ser incluida para una participación efectiva?',
            opciones: ['Solo líderes políticos', 'Todos los actores sociales', 'Solo funcionarios públicos'],
            respuestaCorrecta: 'Todos los actores sociales'
          }
        ]
      },
      habilitado: false,
      expandido: false
    },
    {
      titulo: 'Módulo 3: Herramientas para la Gobernanza',
      emoji: '🟦',
      contenido: [
        'Existen múltiples herramientas que fortalecen la gobernanza territorial.',
        'Entre ellas están: los Sistemas de Información Geográfica (SIG), los catastros multipropósito, los planes de ordenamiento y los visores web participativos.',
        'Estas herramientas ayudan a tomar decisiones informadas, facilitando la planificación y el control del territorio.',
        'El acceso abierto a los datos también fomenta la transparencia y el control ciudadano.'
      ],
      ejemplo: 'Una plataforma permite a los habitantes consultar información sobre el uso del suelo y proponer modificaciones.',
      nota: 'Los SIG permiten ver mapas con información clave sobre el territorio.',
      importante: 'Una herramienta mal utilizada puede generar conflictos en lugar de soluciones.',
      evaluacion: {
        preguntas: [
          {
            texto: '¿Cuál es una herramienta de gobernanza territorial?',
            opciones: ['SIG', 'Impuesto predial', 'Publicidad'],
            respuestaCorrecta: 'SIG'
          },
          {
            texto: '¿Qué promueve el acceso abierto a los datos?',
            opciones: ['Corrupción', 'Transparencia', 'Privatización'],
            respuestaCorrecta: 'Transparencia'
          },
          {
            texto: '¿Para qué sirve un visor web participativo?',
            opciones: ['Recaudar impuestos', 'Controlar los votantes', 'Incluir a la comunidad en la toma de decisiones'],
            respuestaCorrecta: 'Incluir a la comunidad en la toma de decisiones'
          }
        ]
      },
      habilitado: false,
      expandido: false
    },
    {
      titulo: 'Módulo 4: Casos Exitosos y Retos Futuros',
      emoji: '🟥',
      contenido: [
        'En Colombia hay múltiples ejemplos de gobernanza territorial exitosa: acuerdos de conservación, zonas de reserva campesina, procesos participativos en PDET, etc.',
        'Sin embargo, persisten retos como la falta de recursos, conflictos por la tierra, desinformación y baja capacidad institucional.',
        'El futuro de la gobernanza depende de una ciudadanía activa, gobiernos abiertos y tecnología accesible.',
        'El trabajo conjunto entre academia, comunidad, Estado y sector privado es clave.'
      ],
      ejemplo: 'En Tausa, los habitantes desarrollaron un catastro participativo con el apoyo de la alcaldía y universidades.',
      nota: 'Los casos exitosos inspiran a otras comunidades a replicar modelos de gobernanza.',
      importante: 'Los retos no deben ser motivo de desánimo, sino oportunidades para mejorar.',
      evaluacion: {
        preguntas: [
          {
            texto: '¿Qué es un ejemplo de buena gobernanza en Colombia?',
            opciones: ['Zona de reserva campesina', 'Aumento de impuestos', 'Centralización del poder'],
            respuestaCorrecta: 'Zona de reserva campesina'
          },
          {
            texto: '¿Cuál es un reto actual de la gobernanza?',
            opciones: ['Participación activa', 'Falta de recursos', 'Transparencia'],
            respuestaCorrecta: 'Falta de recursos'
          },
          {
            texto: '¿Qué actores deben participar para una gobernanza efectiva?',
            opciones: ['Solo el Estado', 'Solo ONGs', 'Comunidad, Estado y sector privado'],
            respuestaCorrecta: 'Comunidad, Estado y sector privado'
          }
        ]
      },
      habilitado: false,
      expandido: false
    }
  ];

  toggleModulo(index: number): void {
    const modulo = this.modulos[index];
    if (modulo.habilitado) {
      modulo.expandido = !modulo.expandido;
    }
  }

  evaluarModulo(index: number): void {
    const respuestasCorrectas = this.modulos[index].evaluacion.preguntas.map(p => p.respuestaCorrecta);
    const respuestasUsuario = this.respuestas[index];
    const aprobadas = respuestasUsuario.every((resp, i) => resp === respuestasCorrectas[i]);

    if (aprobadas) {
      alert('✅ ¡Has aprobado este módulo!');
      if (this.modulos[index + 1]) {
        this.modulos[index + 1].habilitado = true;
      }
    } else {
      alert('❌ Algunas respuestas no son correctas. Revisa y vuelve a intentarlo.');
    }

    this.actualizarProgreso();
  }

  actualizarProgreso(): void {
    let aprobados = 0;
    for (let i = 0; i < this.modulos.length; i++) {
      const respuestasModulo = this.respuestas[i];
      if (
        respuestasModulo.length === this.modulos[i].evaluacion.preguntas.length &&
        respuestasModulo.every((resp, j) => resp === this.modulos[i].evaluacion.preguntas[j].respuestaCorrecta)
      ) {
        aprobados++;
      }
    }
    this.progreso = (aprobados / this.modulos.length) * 100;
  }
}