import { useEffect, useState } from 'react';
import Grafico from '@/lib/Grafico';
import Navbar from '@/lib/Navbar';
import { getUnique, getKeys, getJson, getCsv } from '@/lib/getFromApi';
import WorldMap from '@/lib/WorldMap';
import worldGeoJson from '@/lib/world.json';
import LineChart from '@/lib/LineChart';

const dataLine = [
  { date: '2023-01-01', value: 10, category: 'A' },
  { date: '2023-01-01', value: 20, category: 'B' },
  { date: '2023-01-02', value: 15, category: 'A' },
  { date: '2023-01-02', value: 25, category: 'B' },
  { date: '2023-01-03', value: 30, category: 'A' },
  { date: '2023-01-03', value: 28, category: 'B' },
];

export default function Home() {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    // Aqui você carrega os dados do GeoJSON e os armazena em geoData
    setGeoData(worldGeoJson);
  }, []);


  
  return (
    <main className="p-8">
      <Navbar />
      <Grafico />
      <LineChart data={dataLine} />
      {geoData ? <WorldMap geoData={geoData} /> : <p>Carregando mapa...</p>}
      <h1 className="text-2xl font-bold">Teste de API</h1>
    </main>

  );
}