import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FeatureCollection, Geometry } from 'geojson';

type Props = {
  width?: number;
  height?: number;
  geoData: FeatureCollection<Geometry>;
};

const WorldMap: React.FC<Props> = ({ width = 800, height = 450, geoData }) => {
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
  }, [geoData, width, height]);

  return <svg ref={svgRef} width={width} height={height} />;
};

export default WorldMap;
