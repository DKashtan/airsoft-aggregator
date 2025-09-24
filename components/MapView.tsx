'use client'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'

type Point = { id:number; name:string; lat:number; lng:number; address?:string }

function Recenter({ center, zoom }:{ center:[number, number]; zoom:number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

function FitToPoints({ points }:{ points:Point[] }) {
  const map = useMap()
  useEffect(() => {
    if (!points.length) return
    const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng] as [number, number]))
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [points, map])
  return null
}

export default function MapView({
  points = [],
  center = [55.751244, 37.618423],
  zoom = 10,
  autoFit = false
}: { points: Point[]; center?: [number, number]; zoom?: number; autoFit?: boolean }) {

  // фиксим иконки маркеров без ts-ignore
  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }, [])

  return (
    <div style={{ height: 420 }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Recenter center={center as [number, number]} zoom={zoom} />
        {autoFit && <FitToPoints points={points} />}
        {points.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup><b>{p.name}</b><br />{p.address}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}