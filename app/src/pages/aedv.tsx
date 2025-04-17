import { useEffect, useState } from 'react';
import Grafico from '@/lib/Grafico';
import Navbar from '@/lib/Navbar';
import { getUnique, getKeys, getJson, getCsv } from '@/lib/getFromApi';
import WorldMap from '@/lib/WorldMap';
import worldGeoJson from '@/lib/world.json';

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
      {geoData ? <WorldMap geoData={geoData} /> : <p>Carregando mapa...</p>}
      <h1 className="text-2xl font-bold">Teste de API</h1>
    </main>

  );
}