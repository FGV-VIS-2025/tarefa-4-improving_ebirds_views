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
  species: string;
};

const WorldMap: React.FC<Props> = ({ width = 800, height = 450, geoData, points = [] }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    console.log("GeoData recebido no WorldMap:", geoData);
    if (!geoData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Limpa antes de desenhar

    const g = svg.append("g");

    const projection = d3.geoMercator().fitSize([width, height], geoData);
    const pathGenerator = d3.geoPath().projection(projection);

    
    g.selectAll('path')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('d', (d) => pathGenerator(d) || "")
      .attr('fill', '#4dabf7')
      .attr('stroke', '#fff');

    g.selectAll('circle')
      .data(points) // Aqui você pode usar os dados de pontos se necessário
      .enter()
      .append('circle')
      .attr('cx', (d) => projection([d.lon, d.lat])![0])
      .attr('cy', (d) => projection([d.lon, d.lat])![1])
      .attr('r', (d) => Math.sqrt(d.value) * 2) // Ajuste o tamanho do círculo conforme necessário
      .attr('fill', 'red')
      .attr('opacity', 0.1); // Ajuste a opacidade conforme necessário
      
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8]) // define o range de zoom
      .on("zoom", (event) => {
        g.attr("transform", event.transform); // aplica transformação no grupo
      });

      (svg as d3.Selection<SVGSVGElement, unknown, null, undefined>).call(zoom);

    const brush = d3.brush()
      .extent([[0, 0], [width, height]])
      .on("end", (event) => {
        if (!event.selection) return;
    
        const [[x0, y0], [x1, y1]] = event.selection;
        
        // Aplicar a transformação do zoom para a seleção do brush
        const transform = d3.zoomTransform(svg.node() as SVGSVGElement);

        // Aplica a transformação nas coordenadas da seleção
        const [[adjustedX0, adjustedY0], [adjustedX1, adjustedY1]] = [
          transform.invert([x0, y0]),
          transform.invert([x1, y1]),
        ];

        // Calcula o zoom para a área selecionada
        const scale = Math.min(width / (adjustedX1 - adjustedX0), height / (adjustedY1 - adjustedY0));
        const translate = [
          width / 2 - scale * (adjustedX0 + (adjustedX1 - adjustedX0) / 2),
          height / 2 - scale * (adjustedY0 + (adjustedY1 - adjustedY0) / 2),
        ];
    
        if (svgRef.current) {
          d3.select<SVGSVGElement, unknown>(svgRef.current).call(
            zoom.transform,
            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
          );
        }

        svg.select<SVGGElement>(".brush").remove(); // Remove o brush após o zoom
        
        // Reativa o zoom
        (svg as d3.Selection<SVGSVGElement, unknown, null, undefined>).call(zoom);

        // Corrige o bug do botão esquerdo "preso"
        d3.select(window).on("mouseup.zoom", null); // limpa o evento de mouseup do D3
        
      });
    // Adiciona o brush como camada separada
    svg.on("contextmenu", (event) => {
      event.preventDefault(); // evita o menu do navegador
      svg.select(".brush").remove(); // limpa brushes anteriores se houver

      svg.on(".zoom", null); // Remove temporariamente o comportamento de zoom
  
      svg.append("g")
        .attr("class", "brush")
        .call(brush);
    });
    
    
    }, [geoData, width, height, points]); // Adicionando points como dependência

  return <svg ref={svgRef} width={width} height={height} style={{ cursor: "grab" }} />;
};

export default WorldMap;
