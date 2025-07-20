"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Loads an external script once and returns a promise that
 * resolves when the script finishes loading.
 */
function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) {
      // Already loaded
      resolve()
      return
    }

    const script = document.createElement("script")
    script.id = id
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Unable to load ${src}`))
    document.body.appendChild(script)
  })
}

/**
 * Loads an external stylesheet once.
 */
function loadStyle(href: string, id: string) {
  if (document.getElementById(id)) return
  const link = document.createElement("link")
  link.id = id
  link.rel = "stylesheet"
  link.href = href
  document.head.appendChild(link)
}

interface SMU {
  id: string
  name: string
  address: string
  city: string
  region: string
  chairman: string
  contact_email: string
  contact_phone: string
  university_or_institute: string
  members_count: number
  latitude: number
  longitude: number
}

interface InteractiveMapProps {
  smuList: SMU[]
  isCoordinateSelectionMode?: boolean
  onCoordinateSelect?: (lat: number, lng: number) => void
}

export default function InteractiveMap({
  smuList,
  isCoordinateSelectionMode = false,
  onCoordinateSelect,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const tempMarkerRef = useRef<any>(null)

  /* Load the Leaflet assets (JS + CSS) once on the client */
  useEffect(() => {
    if (typeof window === "undefined") return

    const leafletCss = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    const leafletJs = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"

    loadStyle(leafletCss, "leaflet-css")
    loadScript(leafletJs, "leaflet-js")
      .then(() => setReady(true))
      .catch((err) => console.error(err))
  }, [])

  /* Initialise the map once Leaflet is ready */
  useEffect(() => {
    if (!ready || !mapContainerRef.current) return
    const L = (window as any).L
    if (!L) return

    // Строгие границы только для Казахстана
    const kazakhstanBounds = L.latLngBounds(
      L.latLng(40.6, 46.8), // Юго-западный угол (более строгие границы)
      L.latLng(55.4, 87.3), // Северо-восточный угол (более строгие границы)
    )

    const map = L.map(mapContainerRef.current, {
      center: [48.0196, 66.9237], // Центр Казахстана
      zoom: 5,
      maxBounds: kazakhstanBounds,
      maxBoundsViscosity: 1.0, // Жесткое ограничение границ
      minZoom: 5, // Увеличен минимальный зум
      maxZoom: 18,
    })

    // Ограничиваем начальный вид только Казахстаном
    map.fitBounds(kazakhstanBounds)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map)

    // Store reference for cleanup & later updates
    mapInstanceRef.current = map

    // Clean-up on unmount
    return () => map.remove()
  }, [ready])

  /* Handle coordinate selection mode */
  useEffect(() => {
    if (!ready || !mapInstanceRef.current) return
    const L = (window as any).L
    const map = mapInstanceRef.current

    if (isCoordinateSelectionMode) {
      // Change cursor to crosshair
      map.getContainer().style.cursor = "crosshair"

      const onMapClick = (e: any) => {
        const { lat, lng } = e.latlng

        // Remove previous temp marker
        if (tempMarkerRef.current) {
          map.removeLayer(tempMarkerRef.current)
          if (tempMarkerRef.current._pulsingCircle) {
            map.removeLayer(tempMarkerRef.current._pulsingCircle)
          }
        }

        // Add temporary marker with pulsing animation
        tempMarkerRef.current = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        }).addTo(map)

        // Add pulsing circle around the marker
        const pulsingCircle = L.circle([lat, lng], {
          color: "#ef4444",
          fillColor: "#ef4444",
          fillOpacity: 0.3,
          radius: 1000,
          className: "pulsing-circle",
        }).addTo(map)

        tempMarkerRef.current
          .bindPopup(
            `
          <div style="text-align: center; padding: 8px;">
            <div style="color: #16a34a; font-weight: bold; margin-bottom: 8px;">
              ✅ Координаты выбраны!
            </div>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Широта:</strong> ${lat.toFixed(6)}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Долгота:</strong> ${lng.toFixed(6)}</p>
            <div style="margin-top: 8px; padding: 4px 8px; background: #dcfce7; border-radius: 4px; font-size: 12px; color: #166534;">
              Координаты сохранены в форме
            </div>
          </div>
        `,
            {
              className: "coordinate-selected-popup",
            },
          )
          .openPopup()

        // Store circle reference for cleanup
        tempMarkerRef.current._pulsingCircle = pulsingCircle

        if (onCoordinateSelect) {
          onCoordinateSelect(lat, lng)
        }
      }

      map.on("click", onMapClick)

      return () => {
        map.off("click", onMapClick)
        map.getContainer().style.cursor = ""
        if (tempMarkerRef.current) {
          map.removeLayer(tempMarkerRef.current)
          if (tempMarkerRef.current._pulsingCircle) {
            map.removeLayer(tempMarkerRef.current._pulsingCircle)
          }
          tempMarkerRef.current = null
        }
      }
    } else {
      map.getContainer().style.cursor = ""
      if (tempMarkerRef.current) {
        map.removeLayer(tempMarkerRef.current)
        if (tempMarkerRef.current._pulsingCircle) {
          map.removeLayer(tempMarkerRef.current._pulsingCircle)
        }
        tempMarkerRef.current = null
      }
    }
  }, [isCoordinateSelectionMode, onCoordinateSelect, ready])

  /* Update markers whenever the SMU list changes */
  useEffect(() => {
    if (!ready || !mapInstanceRef.current) return
    const L = (window as any).L
    const map = mapInstanceRef.current

    // Remove existing SMU markers (but keep temp marker and its circle)
    map.eachLayer((layer: any) => {
      if (
        layer instanceof L.Marker &&
        layer !== tempMarkerRef.current &&
        !layer.options.className?.includes("temp-marker")
      ) {
        map.removeLayer(layer)
      }
      if (layer instanceof L.Circle && layer !== tempMarkerRef.current?._pulsingCircle) {
        // Remove other circles but keep the pulsing circle
        if (!layer.options.className?.includes("pulsing-circle")) {
          map.removeLayer(layer)
        }
      }
    })

    // Add new markers
    smuList.forEach((smu) => {
      if (!smu.latitude || !smu.longitude) return

      const marker = L.marker([smu.latitude, smu.longitude]).addTo(map)

      const popup = `
        <div style="min-width: 280px; max-width: 320px;">
          <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1f2937;">${smu.name}</h3>
          <div style="font-size: 13px; line-height: 1.4;">
            <p style="margin-bottom: 4px;"><strong>Область:</strong> ${smu.region}</p>
            <p style="margin-bottom: 4px;"><strong>Город:</strong> ${smu.city}</p>
            <p style="margin-bottom: 4px;"><strong>Организация:</strong> ${smu.university_or_institute}</p>
            <p style="margin-bottom: 4px;"><strong>Председатель:</strong> ${smu.chairman}</p>
            <p style="margin-bottom: 4px;"><strong>Участников:</strong> ${smu.members_count} чел.</p>
            <p style="margin-bottom: 4px;"><strong>Email:</strong> <a href="mailto:${smu.contact_email}" style="color: #2563eb;">${smu.contact_email}</a></p>
            <p style="margin-bottom: 0;"><strong>Телефон:</strong> <a href="tel:${smu.contact_phone}" style="color: #2563eb;">${smu.contact_phone}</a></p>
          </div>
        </div>
      `

      marker.bindPopup(popup, {
        maxWidth: 350,
        minWidth: 280,
        className: "custom-popup",
      })

      marker.bindTooltip(`${smu.name} (${smu.city})`, {
        direction: "top",
        offset: [0, -10],
      })
    })
  }, [smuList, ready])

  return <div ref={mapContainerRef} className="w-full h-full" />
}
