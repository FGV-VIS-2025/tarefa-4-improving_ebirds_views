import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from '@/lib/Navbar';
import { MultiSelect } from "@/lib/Multiselect";
import React, { useState , useEffect} from 'react';
import {keys_ebird, data_global} from '@/lib/getFromApi';
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
  const points_birds = global_data.map(item => ({
    lat: item.lat,
    lon: item.lng,
    value: item.howMany ?? 0,
  }));
  
  return {
    props: {
      points_birds,
    },
};}




export default function Home({points_birds}: any) {

  const [selected, setSelected] = useState<string[]>([]);

  const [geoData, setGeoData] = useState<any>(null);

  
  
  useEffect(() => {
    // Aqui você carrega os dados do GeoJSON e os armazena em geoData
    setGeoData(worldGeoJson);
  }, []);
  return (
    
    <div >
      <Navbar />
      
      <div className="grid grid-cols-[70%_30%] w-full h-screen">
        <div className="bg-red-100 p-4">
          <WorldMap geoData={geoData} points={points_birds} />
        </div>
        <div className="bg-yellow-100 p-4">
          <MultiSelect
            options={keys_ebird}
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
