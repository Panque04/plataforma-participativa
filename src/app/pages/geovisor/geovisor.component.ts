import { Component, type OnInit, type OnDestroy, type AfterViewInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
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
          <!-- Barra de Búsqueda MEJORADA -->
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

      <!-- Panel de Carga de Archivos MEJORADO -->
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
  currentGeoJsonData: any = null // NUEVO: Para almacenar los datos del GeoJSON
  selectedFeature: any = null
  mouseCoordinates: { lat: number; lng: number } | null = null
  isAdmin = false
  showUploadPanel = false
  uploadForm: FormGroup
  selectedFile: File | null = null
  uploadMessage = ""
  uploadSuccess = false
  isUploading = false // NUEVO: Estado de carga

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
  }

  async ngAfterViewInit() {
    try {
      await this.loadLeaflet()
      setTimeout(() => {
        this.initMap()
      }, 100)
    } catch (error) {
      console.error("Error loading Leaflet:", error)
    }
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
    if (!this.currentGeoJson || !this.map) return

    try {
      console.log("🗺️ Cargando capa GeoJSON:", this.currentGeoJson.nombre)

      // Si es una URL, hacer fetch
      let geoJsonData
      if (this.currentGeoJson.archivo_url.startsWith("http")) {
        const response = await fetch(this.currentGeoJson.archivo_url)
        geoJsonData = await response.json()
      } else {
        // Si es contenido directo, parsearlo
        geoJsonData = JSON.parse(this.currentGeoJson.archivo_url)
      }

      // Almacenar los datos para búsquedas
      this.currentGeoJsonData = geoJsonData

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

      this.map.fitBounds(this.geoJsonLayer.getBounds())
      console.log("✅ Capa GeoJSON cargada exitosamente")
    } catch (error) {
      console.error("❌ Error al cargar GeoJSON:", error)
      this.searchMessage = "Error al cargar la capa GeoJSON"
      this.searchSuccess = false
    }
  }

  private showFeatureInfo(feature: any, layer: any) {
    const properties = feature.properties || {}
    let popupContent = "<div class='feature-popup'>"

    // Mostrar propiedades específicas del ejemplo
    if (properties.CODIGO) {
      popupContent += `<p><strong>🏠 Código:</strong> ${properties.CODIGO}</p>`
    }
    if (properties.MATRICULA_) {
      popupContent += `<p><strong>📋 Matrícula:</strong> ${properties.MATRICULA_}</p>`
    }
    if (properties.DIRECCION) {
      popupContent += `<p><strong>📍 Dirección:</strong> ${properties.DIRECCION}</p>`
    }
    if (properties.AREA_TERRE) {
      popupContent += `<p><strong>📐 Área Terreno:</strong> ${properties.AREA_TERRE} m²</p>`
    }
    if (properties.AREA_CONST) {
      popupContent += `<p><strong>🏗️ Área Construida:</strong> ${properties.AREA_CONST} m²</p>`
    }

    // Mostrar otras propiedades
    for (const [key, value] of Object.entries(properties)) {
      if (!["CODIGO", "MATRICULA_", "DIRECCION", "AREA_TERRE", "AREA_CONST"].includes(key)) {
        popupContent += `<p><strong>${key}:</strong> ${value}</p>`
      }
    }

    popupContent += "</div>"
    layer.bindPopup(popupContent).openPopup()
  }

  zoomToTausa() {
    if (!this.map) return
    const tausaCoords: [number, number] = [5.2047, -73.9478]
    this.map.setView(tausaCoords, 12)
  }

  clearSelection() {
    this.selectedFeature = null
    this.searchMessage = ""
    if (this.map) {
      this.map.closePopup()
    }
  }

  getFeatureProperties() {
    if (!this.selectedFeature?.properties) return []
    return Object.entries(this.selectedFeature.properties).map(([key, value]) => ({
      key,
      value,
    }))
  }

  // MEJORADO: Búsqueda en GeoJSON
  async onSearch() {
    if (!this.searchForm.valid) return

    const { searchType, searchValue } = this.searchForm.value
    console.log("🔍 Buscando:", searchType, searchValue)

    if (!this.currentGeoJsonData) {
      this.searchMessage = "No hay datos GeoJSON cargados para buscar"
      this.searchSuccess = false
      return
    }

    try {
      // Buscar en los datos del GeoJSON
      const feature = await this.supabaseService.buscarEnGeoJson(searchValue, this.currentGeoJsonData)

      if (feature) {
        this.searchSuccess = true
        this.searchMessage = `Predio encontrado: ${searchType === "codigo" ? "Código" : "Matrícula"} ${searchValue}`

        // Obtener el centro del polígono
        const bounds = L.geoJSON(feature).getBounds()
        const center = bounds.getCenter()

        // Hacer zoom al predio encontrado
        this.map.setView([center.lat, center.lng], 18)

        // Resaltar el predio encontrado
        const highlightLayer = L.geoJSON(feature, {
          style: {
            color: "#ff0000",
            weight: 4,
            opacity: 1,
            fillOpacity: 0.7,
          },
        }).addTo(this.map)

        // Mostrar información del predio
        this.selectedFeature = feature
        this.showFeatureInfo(feature, highlightLayer)

        // Remover el resaltado después de 10 segundos
        setTimeout(() => {
          if (this.map.hasLayer(highlightLayer)) {
            this.map.removeLayer(highlightLayer)
          }
        }, 10000)
      } else {
        this.searchSuccess = false
        this.searchMessage = `No se encontró ningún predio con ${searchType === "codigo" ? "código" : "matrícula"}: ${searchValue}`
      }
    } catch (error) {
      console.error("❌ Error en búsqueda:", error)
      this.searchSuccess = false
      this.searchMessage = "Error al realizar la búsqueda"
    }
  }

  // Métodos de medición (sin cambios)
  toggleMeasureTool() {
    this.measureMode = !this.measureMode
    if (!this.measureMode) {
      this.clearMeasurements()
    } else {
      this.clearSelection()
    }
  }

  addMeasurePoint(latlng: any) {
    this.measurePoints.push(latlng)

    if (this.measurePoints.length === 1) {
      L.marker(latlng).addTo(this.map)
    } else if (this.measurePoints.length === 2) {
      L.marker(latlng).addTo(this.map)

      this.measurePolyline = L.polyline(this.measurePoints, {
        color: "red",
        weight: 3,
      }).addTo(this.map)

      const distance = this.calculateDistance(this.measurePoints[0], this.measurePoints[1])
      this.currentDistance = this.formatDistance(distance)

      this.measurePoints = []
    }
  }

  private calculateDistance(point1: any, point2: any): number {
    const R = 6371000
    const lat1 = (point1.lat * Math.PI) / 180
    const lat2 = (point2.lat * Math.PI) / 180
    const deltaLat = ((point2.lat - point1.lat) * Math.PI) / 180
    const deltaLng = ((point2.lng - point1.lng) * Math.PI) / 180

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  private formatDistance(distance: number): string {
    if (distance < 1000) {
      return `${distance.toFixed(2)} m`
    } else {
      return `${(distance / 1000).toFixed(2)} km`
    }
  }

  clearMeasurements() {
    this.measurePoints = []
    this.currentDistance = ""

    if (this.measurePolyline) {
      this.map.removeLayer(this.measurePolyline)
      this.measurePolyline = null
    }

    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer)
      }
    })
  }

  // MEJORADO: Gestión de archivos GeoJSON
  async loadCurrentGeoJson() {
    try {
      this.currentGeoJson = await this.supabaseService.obtenerGeoJsonActivo()
      console.log("📁 Archivo GeoJSON actual:", this.currentGeoJson?.nombre || "Ninguno")
    } catch (error) {
      console.error("❌ Error cargando GeoJSON:", error)
    }
  }

  toggleUploadPanel() {
    this.showUploadPanel = !this.showUploadPanel
    if (!this.showUploadPanel) {
      this.resetUploadForm()
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.name.toLowerCase().endsWith(".geojson") && !file.name.toLowerCase().endsWith(".json")) {
        this.uploadMessage = "Por favor selecciona un archivo GeoJSON válido (.geojson o .json)"
        this.uploadSuccess = false
        return
      }

      // Validar tamaño (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        this.uploadMessage = "El archivo es demasiado grande. Máximo 10MB permitido."
        this.uploadSuccess = false
        return
      }

      this.selectedFile = file
      this.uploadMessage = ""
      console.log("📁 Archivo seleccionado:", file.name)
    }
  }

  async onUploadGeoJson() {
    if (!this.uploadForm.valid || !this.selectedFile) return

    this.isUploading = true
    this.uploadMessage = ""

    try {
      console.log("📤 Subiendo archivo GeoJSON...")

      // Leer el contenido del archivo
      const fileContent = await this.readFileAsText(this.selectedFile)

      // Validar que sea un GeoJSON válido
      let geoJsonData
      try {
        geoJsonData = JSON.parse(fileContent)
        if (!geoJsonData.type || geoJsonData.type !== "FeatureCollection") {
          throw new Error("No es un GeoJSON válido")
        }
      } catch (error) {
        this.uploadMessage = "El archivo no es un GeoJSON válido"
        this.uploadSuccess = false
        this.isUploading = false
        return
      }

      const { nombre, descripcion } = this.uploadForm.value

      const geoJsonFile: GeoJsonFile = {
        nombre,
        descripcion,
        archivo_url: fileContent, // Guardar el contenido directamente
      }

      const result = await this.supabaseService.subirGeoJson(geoJsonFile)

      this.uploadMessage = result.message
      this.uploadSuccess = result.success

      if (result.success) {
        console.log("✅ Archivo GeoJSON subido exitosamente")
        await this.loadCurrentGeoJson()

        // Recargar la capa en el mapa
        if (this.geoJsonLayer) {
          this.map.removeLayer(this.geoJsonLayer)
        }
        await this.loadGeoJsonLayer()

        this.resetUploadForm()
        setTimeout(() => {
          this.showUploadPanel = false
        }, 2000)
      }
    } catch (error) {
      console.error("❌ Error subiendo archivo:", error)
      this.uploadMessage = "Error al subir el archivo"
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

  private resetUploadForm() {
    this.uploadForm.reset()
    this.selectedFile = null
    this.uploadMessage = ""
    this.uploadSuccess = false
    this.isUploading = false
  }
}
