import React, { useEffect, useRef } from 'react';
import { ReportBirds } from './Components';
import * as d3 from 'd3';

type Props = {
  data: ReportBirds[];
  width?: number;
  //height?: number;
  color?: d3.ScaleOrdinal<string, string>;
  onBarClick?: any;
};

const BarChart: React.FC<Props> = ({ data, width = 461, color, onBarClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const height = data.length * 12  + 90


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

    const title = "Places with most sightings";  // Aqui você pode definir o título
    const titleHeight = 20; 

    const margin = { top: 40, right: 30, bottom: 60, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    

    svg.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", margin.top / 2) // Ajuste a posição vertical conforme necessário
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(title);
    
    //ordenar dada
    const sortedData = [...data].sort((a, b) => 
      d3.descending(a.howMany, b.howMany));
    const groups = Array.from(new Set(sortedData.map(d => d.locName)));

    const groupData = Array.from(
      d3.group(sortedData, d => d.locName),
      ([key, values]) => ({ group: key, values })
    );

    const grouped = d3.groups(sortedData, d => d.locName).map(([group, values]) => ({
      group,
      values,
      total: d3.sum(values, d => d.howMany),
    }));
    
    // Ordena decrescentemente pelo total de aves
    grouped.sort((a, b) => d3.descending(a.total, b.total));

    const maxX = d3.max(sortedData, d => d.howMany)!;

    const x = d3.scaleLinear()
      .domain([0, d3.max(sortedData, d => d.howMany)!])
      .nice()
      .range([0, innerWidth]);
      
    const y = d3.scaleBand()
      .domain(grouped.map(d => d.group))
      .range([0, innerHeight])
      .padding(0.1);

    // const ySubgroup = d3.scaleBand()
    //   .domain(subgroups)
    //   .range([0, y.bandwidth()])
    //   .padding(0.05);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

      
    
    
    const maxLabelLength = 15
    g.append('g')
      .call(d3.axisLeft(y).tickFormat(d => {
        const name = String(d);
        return name.length > maxLabelLength
          ? name.slice(0, maxLabelLength - 3) + '...'
          : name;
      }));

    const xAxis = d3.axisBottom(x);
    if (maxX > 100) {
      const tickInterval = 20;
      const tickValues = d3.range(0, maxX + tickInterval, tickInterval);
      xAxis.tickValues(tickValues); // Ajusta a quantidade de ticks para 30 em 30
    }
    if (maxX > 200) {
      const tickInterval = 30;
      const tickValues = d3.range(0, maxX + tickInterval, tickInterval);
      xAxis.tickValues(tickValues); // Ajusta a quantidade de ticks para 30 em 30
    }
    if (maxX > 300) {
      const tickInterval = 40;
      const tickValues = d3.range(0, maxX + tickInterval, tickInterval);
      xAxis.tickValues(tickValues); // Ajusta a quantidade de ticks para 30 em 30
    }
    if (maxX > 400) {
      const tickInterval = 50;
      const tickValues = d3.range(0, maxX + tickInterval, tickInterval);
      xAxis.tickValues(tickValues); // Ajusta a quantidade de ticks para 30 em 30
    }
    if (maxX > 500) {
      const tickInterval = 100;
      const tickValues = d3.range(0, maxX + tickInterval, tickInterval);
      xAxis.tickValues(tickValues); // Ajusta a quantidade de ticks para 30 em 30
    }
    if (maxX > 1000) {
      const tickInterval = 200;
      const tickValues = d3.range(0, maxX + tickInterval, tickInterval);
      xAxis.tickValues(tickValues); // Ajusta a quantidade de ticks para 30 em 30
    }
    if (maxX > 2000) {
      const tickInterval = 300;
      const tickValues = d3.range(0, maxX + tickInterval, tickInterval);
      xAxis.tickValues(tickValues); // Ajusta a quantidade de ticks para 30 em 30
    }
    if (maxX > 3000) {
      const tickInterval = 400;
      const tickValues = d3.range(0, maxX + tickInterval, tickInterval);
      xAxis.tickValues(tickValues); // Ajusta a quantidade de ticks para 30 em 30
    }
    if (maxX > 4000) {
      const tickInterval = 500;
      const tickValues = d3.range(0, maxX + tickInterval, tickInterval);
      xAxis.tickValues(tickValues); // Ajusta a quantidade de ticks para 30 em 30
    }
    if (maxX > 5000) {
      const tickInterval = 1000;
      const tickValues = d3.range(0, maxX + tickInterval, tickInterval);
      xAxis.tickValues(tickValues); // Ajusta a quantidade de ticks para 30 em 30
    }
    if (maxX > 10000) {
      const tickInterval = 2000;
      const tickValues = d3.range(0, maxX + tickInterval, tickInterval);
      xAxis.tickValues(tickValues); // Ajusta a quantidade de ticks para 30 em 30
    }

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);
    
    g.selectAll('g.layer')
      .data(groupData)
      .join('g')
        .attr('transform', d => `translate(0,${y(d.group)!})`)
        .each(function(groupDatum: { group: string, values: ReportBirds[] }) {
          const group = d3.select(this);
          const groupSpecies = groupDatum.values.map((d:ReportBirds) => d.comName); // apenas as espécies presentes no grupo
      
          const localYSubgroup = d3.scaleBand()
            .domain(groupSpecies)
            .range([0, y.bandwidth()])
            .padding(0.05);
        
    group.selectAll('rect')
      .data((d:any) => d.values)
      .join('rect')
        .attr('y', (d:any) => localYSubgroup(d.comName)!)
        .attr('x', 0)
        .attr('height', localYSubgroup.bandwidth())
        .attr('width', (d:any) => x(d.howMany)!)
        .attr('fill', (d:any) => colorScale(d.comName))
        .on('mouseover', (event, d:any) => {
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
        .on('mouseout', () => tooltip.style("display", "none"))
        .on('click', (event, d:any) => {
          onBarClick?.(d.lat, d.lng);
        });
      });

    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 35) // abaixo do eixo X
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "12px")
      .text("How many birds");

    g.append("text")
      .attr("transform", `rotate(-90)`)
      .attr("x", -innerHeight / 2)
      .attr("y", -margin.left + 20) // distância da borda esquerda
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "12px")
      .text("Local da observação");





  }, [data, width, height]);

  return (
    <div style={{ height: 540, overflowY: 'auto', overflowX: 'hidden' }} className='mt-6'>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};

export default BarChart;