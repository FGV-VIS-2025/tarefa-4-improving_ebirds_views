import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from '@/lib/Navbar';
import { MultiSelect } from "@/lib/MultiSelect";
import React, { useState , useEffect} from 'react';
import {keys_ebird, 
  data_global, 
  data_categorias_ebirds} from '@/lib/getFromApi';
import WorldMap from '@/lib/WorldMap';
import worldGeoJson from '@/lib/world.json';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const birdsOptions = [
  "Alaudidae", "Albatross", "Anatidae", "Apodidae", "Ardeidae",
  "Balaenicipitidae", "Bucerotidae", "Cacatuidae", "Caprimulgidae",
  "Ciconiidae", "Coraciidae", "Corvidae", "Cuculidae", "Falconidae",
  "Fringillidae", "Furnariidae", "Galliformes", "Gaviidae",
  "Hirundinidae", "Laridae", "Muscicapidae", "Nectariniidae",
  "Pelecanidae", "Phasianidae", "Picidae", "Podicipedidae",
  "Procellariidae", "Psittacidae", "Rallidae", "Scolopacidae",
  "Strigiformes", "Threskiornithidae"
];

export async function getStaticProps() {
  const global_data = await data_global();
  const points_birds = global_data
  .filter(item => item.lat !== undefined && item.lng !== undefined)
  .map(item => ({
    lat: item.lat,
    lon: item.lng,
    value: item.howMany ?? 0,
    species: item.comName,
  }));

  
  
  return {
    props: {
      points_birds,
    },
};}




export default function Home({points_birds}: any) {

  const [selected, setSelected] = useState<string[]>([]);

  const [geoData, setGeoData] = useState<any>(null);

  const filteredOptions = points_birds.filter((option:any) => 
    selected.includes(option.species)
  );
  console.log("filteredOptions", filteredOptions);

  
  
  useEffect(() => {
    // Aqui você carrega os dados do GeoJSON e os armazena em geoData
    setGeoData(worldGeoJson);
  }, []);
  return (
    
    <div >
      <Navbar />
      
      <div className="grid grid-cols-[70%_30%] w-full h-screen">
        <div className="bg-white-100 p-4">
          <WorldMap geoData={geoData} 
          points={filteredOptions} />
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
      

      <p>{selected.join(', ') || 'Nenhum selecionado'}</p>
    </div>
  );
}
