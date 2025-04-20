import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FeatureCollection, Geometry } from 'geojson';

type Props = {
  width?: number;
  height?: number;
  geoData: FeatureCollection<Geometry>;
  points?: Points[]; // Adicionando a propriedade points
};

type Points = {
  lat: number;
  lon: number;
  value: number;
};

const WorldMap: React.FC<Props> = ({ width = 800, height = 450, geoData, points = [] }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    console.log("GeoData recebido no WorldMap:", geoData);
    if (!geoData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Limpa antes de desenhar

    const projection = d3.geoMercator().fitSize([width, height], geoData);
    const pathGenerator = d3.geoPath().projection(projection);

    svg
      .selectAll('path')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('d', pathGenerator as any)
      .attr('fill', '#4dabf7')
      .attr('stroke', '#fff');

    svg
      .selectAll('circle')
      .data(points) // Aqui você pode usar os dados de pontos se necessário
      .enter()
      .append('circle')
      .attr('cx', (d) => projection([d.lon, d.lat])![0])
      .attr('cy', (d) => projection([d.lon, d.lat])![1])
      .attr('r', (d) => Math.sqrt(d.value) * 2) // Ajuste o tamanho do círculo conforme necessário
      .attr('fill', 'red')
      .attr('opacity', 0.1); // Ajuste a opacidade conforme necessário
      }, [geoData, width, height]);

  return <svg ref={svgRef} width={width} height={height} />;
};

export default WorldMap;
