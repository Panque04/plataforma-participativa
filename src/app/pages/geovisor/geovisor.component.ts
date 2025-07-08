import { Component, type OnInit, type OnDestroy, type AfterViewInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule,  FormBuilder, FormGroup, Validators } from "@angular/forms"
import { SupabaseService, GeoJsonFile } from "../../services/supabase.service"

declare var L: any

@Component({
  selector: "app-geovisor",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="geovisor-container">
      <!-- Header del Geovisor -->
      <div class="geovisor-header">
        <div class="header-left">
          <h2>🗺️ Geovisor Tausa</h2>
        </div>
        <div class="header-center">
          <!-- Barra de Búsqueda -->
          <div class="search-container">
            <form [formGroup]="searchForm" (ngSubmit)="onSearch()">
              <div class="search-input-group">
                <select formControlName="searchType" class="search-select">
                  <option value="codigo">Código Predial</option>
                  <option value="matricula">Matrícula Inmobiliaria</option>
                </select>
                <input
                  type="text"
                  formControlName="searchValue"
                  placeholder="Buscar en el mapa..."
                  class="search-input">
                <button type="submit" class="search-btn" [disabled]="searchForm.invalid">
                  🔍
                </button>
              </div>
            </form>
          </div>
        </div>
        <div class="header-right">
          <div class="header-controls" *ngIf="isAdmin">
            <button class="btn btn-primary" (click)="toggleUploadPanel()">
              📁 Gestionar GeoJSON
            </button>
          </div>
        </div>
      </div>

      <div class="geovisor-layout">
        <!-- Panel Lateral -->
        <div class="sidebar">
          <div class="sidebar-header">
            <h3>🗂️ Capas Geográficas</h3>
          </div>

          <div class="layer-section">
            <h4>🗺️ Capas Base</h4>
            <div class="layer-item">
              <input type="radio" id="osm" name="baseLayer" value="osm" checked (change)="changeBaseLayer('osm')">
              <label for="osm">OpenStreetMap</label>
            </div>
            <div class="layer-item">
              <input type="radio" id="satellite" name="baseLayer" value="satellite" (change)="changeBaseLayer('satellite')">
              <label for="satellite">Satélite</label>
            </div>
          </div>

          <div class="layer-section">
            <h4>📍 Capas Temáticas</h4>
            <div class="layer-item" *ngIf="currentGeoJson">
              <input type="checkbox" id="geojson-layer" checked (change)="toggleGeoJsonLayer($event)">
              <label for="geojson-layer">{{ currentGeoJson.nombre }}</label>
            </div>
            <div class="layer-item">
              <input type="checkbox" id="municipio" checked (change)="toggleMunicipioLayer($event)">
              <label for="municipio">Límite Municipal</label>
            </div>
          </div>

          <div class="layer-section">
            <h4>🔧 Herramientas</h4>
            <button class="tool-btn" (click)="zoomToTausa()">📍 Ir a Tausa</button>
            <button class="tool-btn" (click)="toggleMeasureTool()" [class.active]="measureMode">
              📏 {{ measureMode ? 'Desactivar' : 'Medir Distancia' }}
            </button>
            <button class="tool-btn" (click)="clearMeasurements()">🗑️ Limpiar Medidas</button>
            <button class="tool-btn" (click)="clearSelection()">🧹 Limpiar Todo</button>
          </div>

          <!-- Panel de Medición -->
          <div class="measure-panel" *ngIf="measureMode">
            <h4>📏 Medición Activa</h4>
            <p class="measure-instructions">Haz clic en el mapa para medir distancias</p>
            <div *ngIf="currentDistance" class="measure-result">
              <strong>Distancia: {{ currentDistance }}</strong>
            </div>
            <div *ngIf="measurePoints.length > 0" class="measure-info">
              <small>Puntos: {{ measurePoints.length }}</small>
            </div>
          </div>

          <!-- Panel de Información -->
          <div class="info-panel" *ngIf="selectedFeature">
            <h4>ℹ️ Información del Predio</h4>
            <div class="feature-info">
              <div *ngFor="let prop of getFeatureProperties()" class="info-item">
                <strong>{{ prop.key }}:</strong> {{ prop.value }}
              </div>
            </div>
          </div>

          <!-- Panel de Resultados de Búsqueda -->
          <div class="search-results" *ngIf="searchMessage">
            <h4>🔍 Resultado de Búsqueda</h4>
            <div class="search-message" [class.error]="!searchSuccess">
              {{ searchMessage }}
            </div>
          </div>
        </div>

        <!-- Mapa -->
        <div class="map-container">
          <div id="map" class="map"></div>
          
          <!-- Controles del Mapa -->
          <div class="map-controls">
            <div class="coordinates" *ngIf="mouseCoordinates">
              📍 {{ mouseCoordinates.lat.toFixed(6) }}, {{ mouseCoordinates.lng.toFixed(6) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de Carga de Archivos -->
      <div class="upload-panel" *ngIf="showUploadPanel && isAdmin">
        <div class="upload-content">
          <h3>📁 Gestionar Archivo GeoJSON</h3>
          
          <form [formGroup]="uploadForm" (ngSubmit)="onUploadGeoJson()">
            <div class="form-group">
              <label for="nombre">Nombre de la Capa:</label>
              <input type="text" id="nombre" class="form-control" formControlName="nombre" required>
            </div>
            
            <div class="form-group">
              <label for="descripcion">Descripción:</label>
              <textarea id="descripcion" class="form-control" formControlName="descripcion" rows="3"></textarea>
            </div>
            
            <div class="form-group">
              <label for="archivo">Archivo GeoJSON:</label>
              <input type="file" id="archivo" class="form-control" accept=".geojson,.json" (change)="onFileSelected($event)">
              <small class="help-text">Selecciona un archivo GeoJSON válido (máximo 10MB)</small>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-success" [disabled]="uploadForm.invalid || !selectedFile || isUploading">
                {{ isUploading ? '📤 Subiendo...' : '💾 Subir Archivo' }}
              </button>
              <button type="button" class="btn btn-secondary" (click)="toggleUploadPanel()">
                ❌ Cancelar
              </button>
            </div>
          </form>
          
          <div *ngIf="uploadMessage" class="message" [class.error]="!uploadSuccess">
            {{ uploadMessage }}
          </div>
        </div>
      </div>
    </main>
  `,
  styleUrls: ["./geovisor.component.css"],
})
export class GeovisorComponent implements OnInit, AfterViewInit, OnDestroy {
  map: any
  baseLayer: any
  geoJsonLayer: any
  municipioLayer: any
  currentGeoJson: GeoJsonFile | null = null
  currentGeoJsonData: any = null
  selectedFeature: any = null
  mouseCoordinates: { lat: number; lng: number } | null = null
  isAdmin = false
  showUploadPanel = false
  uploadForm: FormGroup
  selectedFile: File | null = null
  uploadMessage = ""
  uploadSuccess = false
  isUploading = false

  private leafletLoaded = false

  // Propiedades para búsqueda y medición
  searchForm: FormGroup
  searchMessage = ""
  searchSuccess = false
  measureMode = false
  measurePolyline: any = null
  measurePoints: any[] = []
  currentDistance = ""

  constructor(
    private supabaseService: SupabaseService,
    private fb: FormBuilder,
  ) {
    this.uploadForm = this.fb.group({
      nombre: ["", Validators.required],
      descripcion: [""],
    })

    this.searchForm = this.fb.group({
      searchType: ["codigo", Validators.required],
      searchValue: ["", Validators.required],
    })
  }

  async ngOnInit() {
    this.isAdmin = this.supabaseService.isAdmin()
    await this.loadCurrentGeoJson()

    // Solo inicializa el mapa cuando el GeoJSON esté listo
    await this.loadLeaflet()
    setTimeout(() => {
      this.initMap()
    }, 100)
  }


  async ngAfterViewInit() {
    
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove()
    }
  }

  private async loadLeaflet(): Promise<void> {
    if (this.leafletLoaded) return

    return new Promise((resolve, reject) => {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      link.onload = () => {
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = () => {
          this.leafletLoaded = true
          resolve()
        }
        script.onerror = reject
        document.head.appendChild(script)
      }
      link.onerror = reject
      document.head.appendChild(link)
    })
  }

  private initMap() {
    try {
      if (typeof L === "undefined") {
        console.error("Leaflet no está disponible")
        return
      }

      const mapContainer = document.getElementById("map")
      if (!mapContainer) {
        console.error("Contenedor del mapa no encontrado")
        return
      }

      const tausaCoords: [number, number] = [5.2047, -73.9478]

      this.map = L.map("map", {
        center: tausaCoords,
        zoom: 12,
        zoomControl: true,
      })

      this.baseLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(this.map)

      this.addMunicipioLayer()

      // Cargar GeoJSON automáticamente si existe
      if (this.currentGeoJson) {
        this.loadGeoJsonLayer()
      }

      // Eventos del mapa
      this.map.on("mousemove", (e: any) => {
        this.mouseCoordinates = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        }
      })

      this.map.on("click", (e: any) => {
        if (this.measureMode) {
          this.addMeasurePoint(e.latlng)
        } else {
          this.clearSelection()
        }
      })

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize()
        }
      }, 200)

      console.log("Mapa inicializado correctamente")
    } catch (error) {
      console.error("Error al inicializar el mapa:", error)
    }
  }

  private addMunicipioLayer() {
    try {
      const municipioBounds = [
        [5.1, -74.0],
        [5.3, -74.0],
        [5.3, -73.9],
        [5.1, -73.9],
        [5.1, -74.0],
      ]

      this.municipioLayer = L.polygon(municipioBounds, {
        color: "#ff0000",
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.1,
      }).addTo(this.map)

      this.municipioLayer.bindPopup("<b>Municipio de Tausa</b><br>Cundinamarca, Colombia")
    } catch (error) {
      console.error("Error al agregar capa municipal:", error)
    }
  }

  changeBaseLayer(layerType: string) {
    if (!this.map) return

    if (this.baseLayer) {
      this.map.removeLayer(this.baseLayer)
    }

    switch (layerType) {
      case "osm":
        this.baseLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        })
        break
      case "satellite":
        this.baseLayer = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "© Esri",
          },
        )
        break
    }

    this.baseLayer.addTo(this.map)
  }

  toggleGeoJsonLayer(event: any) {
    if (event.target.checked && this.currentGeoJson) {
      this.loadGeoJsonLayer()
    } else if (this.geoJsonLayer) {
      this.map.removeLayer(this.geoJsonLayer)
      this.geoJsonLayer = null
    }
  }

  toggleMunicipioLayer(event: any) {
    if (!this.map || !this.municipioLayer) return

    if (event.target.checked) {
      if (!this.map.hasLayer(this.municipioLayer)) {
        this.municipioLayer.addTo(this.map)
      }
    } else {
      this.map.removeLayer(this.municipioLayer)
    }
  }

  private async loadGeoJsonLayer() {
    if (!this.currentGeoJson || !this.map) {
      console.log("❌ No hay GeoJSON o mapa disponible")
      return
    }

    try {
      console.log("🗺️ Cargando capa GeoJSON:", this.currentGeoJson.nombre)

      if (!this.currentGeoJson.archivo_url) {
        console.error("❌ El archivo GeoJSON no tiene contenido")
        this.searchMessage = "El archivo GeoJSON está vacío"
        this.searchSuccess = false
        return
      }

      let geoJsonData
      try {
        geoJsonData = JSON.parse(this.currentGeoJson.archivo_url)
        console.log("✅ GeoJSON parseado correctamente:", geoJsonData.type)
      } catch (parseError) {
        console.error("❌ Error parseando GeoJSON:", parseError)
        this.searchMessage = "Error al parsear el archivo GeoJSON"
        this.searchSuccess = false
        return
      }

      if (!geoJsonData.type || geoJsonData.type !== "FeatureCollection") {
        console.error("❌ Estructura GeoJSON inválida")
        this.searchMessage = "El archivo no es un GeoJSON válido"
        this.searchSuccess = false
        return
      }

      this.currentGeoJsonData = geoJsonData

      // Remover capa anterior si existe
      if (this.geoJsonLayer) {
        this.map.removeLayer(this.geoJsonLayer)
      }

      this.geoJsonLayer = L.geoJSON(geoJsonData, {
        style: {
          color: "#00ff00",
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.3,
        },
        onEachFeature: (feature: any, layer: any) => {
          layer.on("click", () => {
            if (!this.measureMode) {
              this.selectedFeature = feature
              this.showFeatureInfo(feature, layer)
            }
          })
        },
      }).addTo(this.map)

      const bounds = this.geoJsonLayer.getBounds()
      this.map.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: 16,
      })

      console.log("✅ Capa GeoJSON cargada exitosamente con", geoJsonData.features?.length || 0, "features")
    } catch (error) {
      console.error("❌ Error al cargar GeoJSON:", error)
      this.searchMessage = "Error al cargar la capa GeoJSON"
      this.searchSuccess = false
    }
  }

  private showFeatureInfo(feature: any, layer: any) {
    const properties = feature.properties || {}
    let popupContent = "<div class='feature-popup'>"

    if (properties.CODIGO) {
      popupContent += `<p><strong>🏠 Código:</strong> ${properties.CODIGO}</p>`
    }
    if (properties.MATRICULA_) {
      popupContent += `<p><strong>📋 Matrícula:</strong> ${properties.MATRICULA_}</p>`
    }
    if (properties.DIRECCION) {
      popupContent += `<p><strong>📍 Dirección:</strong> ${properties.DIRECCION}</p>`
    }
    if (properties.AREA) {
      popupContent += `<p><strong>📐 Área:</strong> ${properties.AREA} m²</p>`
    }

    popupContent += "</div>"

    layer.bindPopup(popupContent).openPopup()

    layer.setStyle({
      color: "#ff0000",
      weight: 3,
      fillOpacity: 0.6,
    })
  }

  private async loadCurrentGeoJson() {
    try {
      console.log("🔍 Buscando archivo GeoJSON activo...")
      this.currentGeoJson = await this.supabaseService.obtenerGeoJsonActivo()

      if (this.currentGeoJson) {
        console.log("✅ Archivo GeoJSON encontrado:", this.currentGeoJson.nombre)
      } else {
        console.log("ℹ️ No hay archivo GeoJSON activo")
      }
    } catch (error) {
      console.error("❌ Error cargando GeoJSON:", error)
    }
  }

  async onSearch() {
    if (!this.searchForm.valid || !this.currentGeoJsonData) {
      this.searchMessage = "Ingresa un valor para buscar"
      this.searchSuccess = false
      return
    }

    const searchValue = this.searchForm.get("searchValue")?.value
    const searchType = this.searchForm.get("searchType")?.value

    console.log("🔍 Buscando:", searchValue, "tipo:", searchType)

    try {
      const result = await this.supabaseService.buscarEnGeoJson(searchValue, this.currentGeoJsonData)

      if (result) {
        this.searchMessage = `Encontrado: ${result.properties?.CODIGO || "Sin código"}`
        this.searchSuccess = true

        if (result.geometry && result.geometry.coordinates) {
          const layer = L.geoJSON(result, {
            style: {
              color: "#ff0000",
              weight: 4,
              fillOpacity: 0.7,
            },
          }).addTo(this.map)

          // Ajustar el mapa al tamaño del predio
          const bounds = layer.getBounds()
          this.map.fitBounds(bounds, {
            padding: [20, 20],
            maxZoom: 17, // evita acercarse demasiado
          })

          setTimeout(() => {
            this.map.removeLayer(layer)
          }, 5000)
        }

      } else {
        this.searchMessage = "No se encontraron resultados"
        this.searchSuccess = false
      }
    } catch (error) {
      console.error("❌ Error en búsqueda:", error)
      this.searchMessage = "Error al realizar la búsqueda"
      this.searchSuccess = false
    }
  }

  private getFeatureCenter(geometry: any): [number, number] | null {
    if (!geometry || !geometry.coordinates) return null

    switch (geometry.type) {
      case "Point":
        return geometry.coordinates
      case "Polygon":
        const coords = geometry.coordinates[0]
        let sumLat = 0,
          sumLng = 0
        for (const coord of coords) {
          sumLng += coord[0]
          sumLat += coord[1]
        }
        return [sumLng / coords.length, sumLat / coords.length]
      default:
        return null
    }
  }

  // Métodos de medición mejorados
  toggleMeasureTool() {
    this.measureMode = !this.measureMode
    if (!this.measureMode) {
      this.clearMeasurements()
    } else {
      this.searchMessage = ""
      this.selectedFeature = null
    }
  }

  private addMeasurePoint(latlng: any) {
    if (!this.map) return

    const marker = L.circleMarker(latlng, {
      radius: 5,
      color: "#ff0000",
      fillColor: "#ff0000",
      fillOpacity: 0.8,
    }).addTo(this.map)

    this.measurePoints.push({ marker, latlng })

    if (this.measurePoints.length > 1) {
      this.updateMeasureLine()
    }
  }

  private updateMeasureLine() {
    if (this.measurePolyline) {
      this.map.removeLayer(this.measurePolyline)
    }

    const latlngs = this.measurePoints.map((p) => p.latlng)
    this.measurePolyline = L.polyline(latlngs, {
      color: "#ff0000",
      weight: 3,
      opacity: 0.8,
      dashArray: "5, 10",
    }).addTo(this.map)

    // Calcular distancia total
    let totalDistance = 0
    for (let i = 1; i < this.measurePoints.length; i++) {
      const prev = this.measurePoints[i - 1].latlng
      const curr = this.measurePoints[i].latlng
      totalDistance += this.map.distance(prev, curr)
    }

    // Formatear distancia
    if (totalDistance < 1000) {
      this.currentDistance = `${totalDistance.toFixed(2)} m`
    } else {
      this.currentDistance = `${(totalDistance / 1000).toFixed(3)} km`
    }

    // Agregar popup con la distancia en la línea
    const midPoint = this.measurePoints[Math.floor(this.measurePoints.length / 2)].latlng
    L.popup().setLatLng(midPoint).setContent(`<strong>📏 ${this.currentDistance}</strong>`).openOn(this.map)
  }

  clearMeasurements() {
    if (!this.map) return

    this.measurePoints.forEach((point) => {
      this.map.removeLayer(point.marker)
    })

    if (this.measurePolyline) {
      this.map.removeLayer(this.measurePolyline)
    }

    this.measurePoints = []
    this.measurePolyline = null
    this.currentDistance = ""
    this.map.closePopup()
  }

  clearSelection() {
    this.selectedFeature = null
    this.searchMessage = ""

    if (this.geoJsonLayer) {
      this.geoJsonLayer.setStyle({
        color: "#00ff00",
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.3,
      })
    }
  }

  zoomToTausa() {
    if (this.map) {
      this.map.setView([5.2047, -73.9478], 12)
    }
  }

  getFeatureProperties() {
    if (!this.selectedFeature?.properties) return []

    return Object.entries(this.selectedFeature.properties).map(([key, value]) => ({
      key,
      value: value || "N/A",
    }))
  }

  // Métodos de administración
  toggleUploadPanel() {
    this.showUploadPanel = !this.showUploadPanel
    this.uploadMessage = ""
    this.selectedFile = null
    this.uploadForm.reset()
  }

  onFileSelected(event: any) {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.uploadMessage = "El archivo es muy grande (máximo 10MB)"
        this.uploadSuccess = false
        return
      }

      if (!file.name.toLowerCase().endsWith(".geojson") && !file.name.toLowerCase().endsWith(".json")) {
        this.uploadMessage = "Solo se permiten archivos .geojson o .json"
        this.uploadSuccess = false
        return
      }

      this.selectedFile = file
      this.uploadMessage = ""
    }
  }

  async onUploadGeoJson() {
    if (!this.uploadForm.valid || !this.selectedFile) {
      this.uploadMessage = "Completa todos los campos requeridos"
      this.uploadSuccess = false
      return
    }

    this.isUploading = true
    this.uploadMessage = "Procesando archivo..."

    try {
      const fileContent = await this.readFileAsText(this.selectedFile)

      let geoJsonData
      try {
        geoJsonData = JSON.parse(fileContent)
      } catch (error) {
        this.uploadMessage = "El archivo no es un JSON válido"
        this.uploadSuccess = false
        this.isUploading = false
        return
      }

      if (!geoJsonData.type || geoJsonData.type !== "FeatureCollection") {
        this.uploadMessage = "El archivo no es un GeoJSON válido"
        this.uploadSuccess = false
        this.isUploading = false
        return
      }

      const geoJsonFile: GeoJsonFile = {
        nombre: this.uploadForm.get("nombre")?.value,
        descripcion: this.uploadForm.get("descripcion")?.value,
        archivo_url: fileContent,
      }

      const result = await this.supabaseService.subirGeoJson(geoJsonFile)

      if (result.success) {
        this.uploadMessage = result.message
        this.uploadSuccess = true
        this.showUploadPanel = false

        // Recargar el GeoJSON actual
        await this.loadCurrentGeoJson()

        // Recargar la capa en el mapa
        if (this.map) {
          this.loadGeoJsonLayer()
        }
      } else {
        this.uploadMessage = result.message
        this.uploadSuccess = false
      }
    } catch (error) {
      console.error("Error subiendo GeoJSON:", error)
      this.uploadMessage = "Error al procesar el archivo"
      this.uploadSuccess = false
    } finally {
      this.isUploading = false
    }
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }
}
