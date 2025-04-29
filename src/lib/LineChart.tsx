'use client';

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { z } from 'zod';

const DataPointSchema = z.object({
  date: z.string(),
  value: z.number(),
  category: z.string(),
});

const DataArraySchema = z.array(DataPointSchema);
type DataPoint = z.infer<typeof DataPointSchema>;
type ParsedDataPoint = {
    date: Date;
    value: number;
    category: string;
  };
type LineChartProps = {
    data: unknown;
  };

  const LineChart: React.FC<LineChartProps> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
  
    useEffect(() => {
      const result = DataArraySchema.safeParse(data);
  
      if (!result.success) {
        console.error('Dados inválidos:', result.error);
        return;
      }
  
      const parsedData: ParsedDataPoint[] = result.data.map(d => ({
        ...d,
        date: new Date(d.date),
      }));
  
      const categories = Array.from(new Set(parsedData.map(d => d.category)));
  
      const groupedData = categories.map(category => ({
        category,
        values: parsedData.filter(d => d.category === category),
      }));
  
      const width = 600;
      const height = 400;
      const margin = { top: 20, right: 30, bottom: 50, left: 50 };
  
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
  
      svg
        .attr('width', width)
        .attr('height', height);
  
      const x = d3.scaleTime()
        .domain(d3.extent(parsedData, d => d.date as Date) as [Date, Date])
        .range([margin.left, width - margin.right]);
  
      const y = d3.scaleLinear()
        .domain([0, d3.max(parsedData, d => d.value) || 0])
        .nice()
        .range([height - margin.bottom, margin.top]);
  
      const color = d3.scaleOrdinal<string>()
        .domain(categories)
        .range(d3.schemeCategory10);
  
        const line = d3.line<ParsedDataPoint>()
        .x(d => x(d.date))
        .y(d => y(d.value));
  
      // Eixos
      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%Y-%m-%d') as any))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');
  
      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
  
      // Linhas por categoria
      groupedData.forEach(group => {
        svg.append('path')
          .datum(group.values)
          .attr('fill', 'none')
          .attr('stroke', color(group.category) as string)
          .attr('stroke-width', 2)
          .attr('d', line);
  
        svg.append('text')
          .attr('x', width - margin.right - 60)
          .attr('y', y(group.values[group.values.length - 1].value))
          .attr('fill', color(group.category) as string)
          .text(group.category)
          .style('font-size', '12px');
      });
    }, [data]);
  
    return (
      <>
        <svg ref={svgRef}></svg>
      </>
    );
  };
  
  export default LineChart;