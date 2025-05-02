import React, { useEffect, useRef } from 'react';
import { ReportBirds } from './Components';
import * as d3 from 'd3';

type Props = {
  data: ReportBirds[];
  width?: number;
  height?: number;
  color?: d3.ScaleOrdinal<string, string>;
};

const BarChart: React.FC<Props> = ({ data, width = 600, height = 400, color }) => {
  const svgRef = useRef<SVGSVGElement>(null);


  const colorScale = color || d3.scaleOrdinal(d3.schemeCategory10); // Define a escala de cores

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // limpa o SVG

    const margin = { top: 20, right: 30, bottom: 40, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.howMany)!])
      .nice()
      .range([0, innerWidth]);
      
    const y = d3.scaleBand()
      .domain(data.map(d => d.locName))
      .range([0, innerWidth])
      .padding(0.1);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g')
      .call(d3.axisLeft(y));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', d => y(d.locName)!)
      .attr('height', y.bandwidth())
      .attr('width', d => x(d.howMany)!)
      .attr('fill',  (d) => colorScale(d.comName)) // Cor da barra;

  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height} />;
};

export default BarChart;