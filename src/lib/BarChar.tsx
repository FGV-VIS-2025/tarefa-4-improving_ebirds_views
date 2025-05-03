import React, { useEffect, useRef } from 'react';
import { ReportBirds } from './Components';
import * as d3 from 'd3';

type Props = {
  data: ReportBirds[];
  width?: number;
  height?: number;
  color?: d3.ScaleOrdinal<string, string>;
  onBarClick?: any;
};

const BarChart: React.FC<Props> = ({ data, width = 350, height = 900, color, onBarClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  height = data.length * 12 + 70


  const colorScale = color || d3.scaleOrdinal(d3.schemeCategory10); // Define a escala de cores

  useEffect(() => {

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // limpa o SVG


    if (!data || data.length === 0) return;

    // interactividade

    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("padding", "6px")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "white")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("font-size", "12px")
      .style("display", "none");

    

    const margin = { top: 20, right: 30, bottom: 40, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const sortedData = [...data].sort((a, b) => 
      d3.descending(a.howMany, b.howMany));

    const x = d3.scaleLinear()
      .domain([0, d3.max(sortedData, d => d.howMany)!])
      .nice()
      .range([0, innerWidth]);
      
    const y = d3.scaleBand()
      .domain(sortedData.map(d => d.locName))
      .range([0, innerHeight])
      .padding(0.1);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g')
      .call(d3.axisLeft(y));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    g.selectAll('rect')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', d => y(d.locName)!)
      .attr('height', y.bandwidth())
      .attr('width', d => x(d.howMany)!)
      .attr('fill',  (d) => colorScale(d.comName)) // Cor da barra;
      .on('mouseover', (event, d) => {
        tooltip
          .style("display", "block")
          .html(`
            <strong>${d.comName}</strong><br/>
            Local: ${d.locName}<br/>
            Quantidade: ${d.howMany}
          `);
      })
      .on('mousemove', (event) => {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on('mouseout', () => {
        tooltip.style("display", "none");
      })
      .on('click', (event, d) => {
        // Envia as coordenadas de latitude e longitude para o componente do globo
        onBarClick(d.lat, d.lng);
      });





  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height} />;
};

export default BarChart;