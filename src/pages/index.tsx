import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from '@/lib/Navbar';
import { MultiSelect } from "@/lib/MultiSelect";
import React, { useState , useEffect, useCallback, useMemo} from 'react';
import {keys_ebird, 
  data_global, 
  data_categorias_ebirds,
  getUniqueJson} from '@/lib/getFromApi';
import WorldMap from '@/lib/WorldMap';
import WorldGlobe from '@/lib/WorldGlobe';
import BarChart from "@/lib/BarChar";
import worldGeoJson from '@/lib/world.json';
import { ReportBirds, BirdData } from "@/lib/Components";
import * as d3 from "d3";


export async function getStaticProps() {
  try {
    // Fetch the data from the API
      const global_data_ram = await data_global();
      if (!global_data_ram) {
        throw new Error("Failed to fetch data from the API");
      };
      const global_data = global_data_ram.filter((a:any) => a.howMany !== undefined)
      const list_visible_raw = getUniqueJson(global_data, 'comName');
      const list_visible = list_visible_raw.filter((item) => item !== undefined && item !== null);

      return {
        props: {global_data, list_visible}, // Pass the data as props to the page component
      };

      

  } catch (error) {
        console.error("Error fetching data:", error);
        return {
          props: { global_data: [],
          list_visible: [], // Return an empty array or handle the error as needed
          }, // Return an empty array or handle the error as needed
        };
    };
}
   
type Props = {
  global_data: any;
  list_visible: any; 
};



export default function Home({global_data, list_visible}: Props) {

  const [selected, setSelected] = useState<string[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<ReportBirds[]>([]);

  const [geoData, setGeoData] = useState<any>(null);

  const filteredOptions = useMemo(() => {
    return global_data.filter((option:any) => 
    selected.includes(option.comName) 
    );
  }, [selected, global_data]);


  const customColors = [
    "#e41a1c", "#377eb8", "#4daf4a", "#ff7f00", "#ffff33", "#a65628", "#f781bf", "#999999",
    "#d95f02", "#1b9e77", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666",
    "#1f77b4", "#ff9896", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22",
    "#17becf", "#8c8c8c", "#9b59b6", "#d62728", "#ff7f0e", "#2ca02c"
  ];



  const color = d3.scaleOrdinal<string, string>()
    .domain(Array.from(new Set(list_visible.map((d : any) => d.comName)))) // Todas espécies únicas
    .range(customColors);
  
  
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

  const handleBrush =  useCallback((selection: [[number, number], [number, number]]) => {
    if (!selection) {
      setSelectedPoints([]); // Nenhuma seleção? Limpa os selecionados
      return;
    }
  
    const [[lon0, lat0], [lon1, lat1]] = selection;
    console.log(selection)
  
    const minLon = Math.min(lon0, lon1);
    const maxLon = Math.max(lon0, lon1);
    const minLat = Math.min(lat0, lat1);
    const maxLat = Math.max(lat0, lat1);
  
    const filtered = filteredOptions.filter((d : any) => {
      const lon = d.lng;
      const lat = d.lat;
  
      return (
        lon >= minLon && lon <= maxLon &&
        lat >= minLat && lat <= maxLat
      );
    });
    console.log(filtered)
  
    setSelectedPoints(filtered);
  }, [filteredOptions]);

    //console.log("geoData", selectedPoints);
    
  return (
    
    <div >      
      <div className="bg-white-100 p-4 max-h-60 overflow-auto">
        <MultiSelect
            options={list_visible}
            selected={selected}
            onChange={setSelected}
            label="Select options"
        />
      </div>
        
      <div className="bg-white-100 p-4 max-h-60 overflow-auto">
        {selected.length > 0 ? (
          <div className="p-4">
            <ul className="list-none p-0">
              {selected.map((item) => (
                <li key={item} className="mb-2 flex items-center">
                  {/* <span>{item}</span> */}
                  <button
                    onClick={() => {
                      const updated = selected.filter(sel => sel !== item);
                      setSelected(updated);
                    }}
                    style={{ backgroundColor: color(item) }}
                    className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-600"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="p-4">Nenhum selecionado</p>
        )}
      </div>
      
      <div className="grid grid-cols-[25%_75%] w-full h-screen">
        
        <div className="bg-black-100 p-4">
          <BarChart
          data={
            selected.length === 0
              ? [] // Nenhuma espécie selecionada
              : selectedPoints.length > 0
                ? selectedPoints
                : filteredOptions
          }
          color={color}/>
        </div>

        <div className="w-full h-screen bg-white-100 p-4">
          <WorldGlobe geoData={geoData} 
          points={filteredOptions} 
          onBrushSelection={handleBrush}
          color={color}/>
        </div>

      </div>     

      {/* <p>{selected.join(', ') || 'Nenhum selecionado'}</p> */}
    </div>
  );
}
