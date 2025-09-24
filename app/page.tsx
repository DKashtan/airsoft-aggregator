'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import MapView from '../components/MapView'

type Venue = { id:number; name:string; lat:number; lng:number; address?:string; city_id?:number }
type EventRow = { id:number; title:string; start_time:string; description?:string; city_id:number }

const CITY_CENTERS: Record<string, { center:[number,number]; zoom:number }> = {
  '1': { center: [55.751244, 37.618423], zoom: 11 }, // Москва
  '2': { center: [59.9386, 30.3141],     zoom: 11 }, // СПб
}
const DEFAULT_CENTER: [number,number] = [55.751244, 37.618423]

export default function Home() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [events, setEvents] = useState<EventRow[]>([])
  const [cityId, setCityId] = useState<string>('')   // '' = все города
  const [date, setDate]   = useState<string>('')

  // Загружаем данные
  useEffect(() => {
    (async () => {
      const { data: v } = await supabase.from('venues').select('id,name,lat,lng,address,city_id').limit(500)
      setVenues(v || [])
      const { data: e } = await supabase
        .from('events')
        .select('id,title,start_time,description,city_id')
        .order('start_time', { ascending: true })
        .limit(200)
      setEvents(e || [])
    })()
  }, [])

  // Фильтрация событий
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const okCity = cityId ? String(e.city_id) === String(cityId) : true
      const okDate = date ? new Date(e.start_time).toISOString().slice(0,10) === date : true
      return okCity && okDate
    })
  }, [events, cityId, date])

  // Фильтрация площадок для карты
  const filteredVenues = useMemo(() => {
    return cityId ? venues.filter(v => String(v.city_id) === String(cityId)) : venues
  }, [venues, cityId])

  // Центр карты
  const { center, zoom } = cityId ? CITY_CENTERS[cityId] ?? { center: DEFAULT_CENTER, zoom: 10 } : { center: DEFAULT_CENTER, zoom: 10 }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, padding:16 }}>
      <div>
        <h2>Карта площадок</h2>
        <MapView points={filteredVenues} center={center} zoom={zoom} autoFit={!cityId} />
      </div>
      <div>
        <h2>События</h2>
        <div style={{ display:'flex', gap:8, marginBottom:8 }}>
          <select value={cityId} onChange={e => setCityId(e.target.value)}>
            <option value=''>Город: все</option>
            <option value='1'>Москва</option>
            <option value='2'>Санкт-Петербург</option>
          </select>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <ul>
          {filteredEvents.map(ev => (
            <li key={ev.id} style={{ padding:'8px 0', borderBottom:'1px solid #eee' }}>
              <b>{ev.title}</b> · {new Date(ev.start_time).toLocaleString('ru-RU')}
              <br />{ev.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
