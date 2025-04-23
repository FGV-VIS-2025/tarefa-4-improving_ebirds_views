import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from '@/lib/Navbar';
import { MultiSelect } from "@/lib/MultiSelect";
import React, { useState , useEffect, useCallback, useMemo} from 'react';
import {keys_ebird, 
  data_global, 
  data_categorias_ebirds} from '@/lib/getFromApi';
import WorldMap from '@/lib/WorldMap';
import BarChart from "@/lib/BarChar";
import worldGeoJson from '@/lib/world.json';
import { ReportBirds } from "@/lib/Components";


export async function getStaticProps() {
  const global_data = await data_global();
   
  return {
    props: {
      global_data,
    },
};}




export default function Home({global_data}: any) {

  const [selected, setSelected] = useState<string[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<ReportBirds[]>([]);

  const [geoData, setGeoData] = useState<any>(null);

  const filteredOptions = useMemo(() => {
    return global_data.filter((option:any) => 
    selected.includes(option.comName) 
    );
  }, [selected, global_data]);
  console.log("filteredOptions", filteredOptions);

  
  
  useEffect(() => {
    // Aqui você carrega os dados do GeoJSON e os armazena em geoData
    setGeoData(worldGeoJson);
    if (selectedPoints.length > 0) {
      console.log("Usando dados filtrados fora do handleBrush:", selectedPoints);
      
      // Aqui você pode, por exemplo:
      // - atualizar uma tabela
      // - fazer uma chamada de API
      // - renderizar uma lista
    }
  }, [selectedPoints]);
    const handleBrush = useCallback(([[lon0, lat0], [lon1, lat1]]: [[number, number], [number, number]]) => {
      const [minLon, maxLon] = [Math.min(lon0, lon1), Math.max(lon0, lon1)];
      const [minLat, maxLat] = [Math.min(lat0, lat1), Math.max(lat0, lat1)];
    
      const filtered = filteredOptions.filter((d: any) => {
        const [lon, lat] = [d.lng, d.lat];
        return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
      });
      //console.log("Pontos filtrados:", filtered);
      setSelectedPoints(filtered);
    }, [filteredOptions]);

    console.log("geoData", selectedPoints);
    
  return (
    
    <div >
      <Navbar />
      
      <div className="grid grid-cols-[70%_30%] w-full h-screen">
        <div className="bg-white-100 p-4">
          <WorldMap geoData={geoData} 
          points={filteredOptions} 
          onBrushSelection={handleBrush}/>
        </div>
        <div className="bg-yellow-100 p-4">
          <MultiSelect
            options={data_categorias_ebirds}
            selected={selected}
            onChange={setSelected}
            label="Select options"
          />
        </div>
      </div>
      <div className="bg-white-100 p-4 max-h-60 overflow-auto">
        <BarChart
          data={filteredOptions.map((d: any) => ({
            label: d.locName,
            value: d.howMany,
          }))} />
      </div>
      

      <p>{selected.join(', ') || 'Nenhum selecionado'}</p>
    </div>
  );
}
