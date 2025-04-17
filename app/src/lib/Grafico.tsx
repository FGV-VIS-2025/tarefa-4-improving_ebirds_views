// components/Grafico.tsx
'use client'; // necessário se estiver usando App Router

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function Grafico() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // limpa antes de desenhar

    svg
      .append('circle')
      .attr('cx', 150)
      .attr('cy', 70)
      .attr('r', 50)
      .attr('fill', 'steelblue');
  }, []);

  return (
    <div className="flex justify-center mt-10">
      <svg ref={svgRef} width={300} height={150}></svg>
    </div>
  );
}