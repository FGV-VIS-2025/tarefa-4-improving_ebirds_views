import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FeatureCollection, Geometry } from 'geojson';
import {ReportBirds} from '@/lib/Components';

type Props = {
  width?: number;
  height?: number;
  geoData: FeatureCollection<Geometry>;
  points?: ReportBirds[]; // Adicionando a propriedade points
  onBrushSelection?: (selection: [[number, number], [number, number]]) => void;
  color?: d3.ScaleOrdinal<string, string>;
};

type Points = {
  lat: number;
  lon: number;
  value: number;
  species: string;
};

const WorldGlobe: React.FC<Props> = ({ width = 900, height = 900, geoData, points = [], onBrushSelection, color }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [flattened, setFlattened] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [brushEnabled, setBrushEnabled] = React.useState(false);

  const colorScale = color || d3.scaleOrdinal(d3.schemeCategory10); // Define a escala de cores

  // create consts null for use in useEffect
  const projectionRef = useRef<d3.GeoProjection | null>(null);
  const pathGeneratorRef = useRef<d3.GeoPath | null>(null);
  const updateMapRef = useRef<() => void>(() => {});
  const brushRef = useRef<d3.BrushBehavior<unknown> | null>(null);
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef<[number, number] | null>(null);

  const zoomHandler = (event: WheelEvent) => {
    event.preventDefault();
    if (!projectionRef.current) return;
  
    const scaleFactor = event.deltaY < 0 ? 1.1 : 0.9;
    const scale = projectionRef.current.scale();
    projectionRef.current.scale(scale * scaleFactor);
    updateMapRef.current?.();
  };
  
  const mouseDownHandler = (event: MouseEvent) => {
    isDraggingRef.current = true;
    lastPosRef.current = [event.clientX, event.clientY];
    event.preventDefault();
  };
  
  const mouseMoveHandler = (event: MouseEvent) => {
    if (!isDraggingRef.current || !lastPosRef.current || !projectionRef.current) return;
  
    const [lastX, lastY] = lastPosRef.current;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
  
    const rotate = projectionRef.current.rotate();
    const sensitivity = 0.25;
  
    projectionRef.current.rotate([
      rotate[0] + dx * sensitivity,
      rotate[1] - dy * sensitivity,
      rotate[2]
    ]);
  
    lastPosRef.current = [event.clientX, event.clientY];
    updateMapRef.current?.();
  };

  useEffect(() => {
    
    setIsMounted(true);

    // create svg element
    const svg = d3.select(svgRef.current);

    svg.on("wheel", zoomHandler);
    svg.on("mousedown", mouseDownHandler);
    svg.on("mousemove", mouseMoveHandler);
    svg.selectAll("path").remove();
    svg.selectAll("circle").remove(); // Limpa antes de desenhar

    const tooltip = d3.select(svgRef.current!.parentElement)
      .append("div")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "white")
      .style("padding", "6px 10px")
      .style("border", "1px solid #999")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none");
    
     // Verifica se a projeção foi criada corretamente
    projectionRef.current = flattened 
     ? d3.geoEquirectangular()
         .scale(Math.min(width, height) / 2.2)
         .translate([width / 2, height / 2])
     : d3.geoOrthographic()
         .scale(Math.min(width, height) / 2.2)
         .translate([width / 2, height / 2]);
       if (!geoData) return;

    pathGeneratorRef.current = d3.geoPath().projection(projectionRef.current!);
  
    const defs = svg.append('defs');

    defs.append('clipPath')
      .attr('id', 'globeClip')
      .append('path')
      .datum({ type: 'Sphere' } as any)
      .attr('d', pathGeneratorRef.current!);

    const g = svg.append("g");



    let isDragging = false;
    let lastPos: [number, number] | null = null;

    const dragHandler = (event: MouseEvent) => {
      if (!isDragging || !lastPos) return;
      
      const [lastX, lastY] = lastPos;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      
      const rotate = projectionRef.current!.rotate();
      const sensitivity = 0.25; // Sensibilidade do movimento
      
      // Aplica a rotação
      projectionRef.current!.rotate([
        rotate[0] + dx * sensitivity,
        rotate[1] - dy * sensitivity,
        rotate[2]
      ]);
      
      lastPos = [event.clientX, event.clientY];
      
      updateMapRef.current(); // Atualiza o mapa, incluindo a rotação
    };
    

    updateMapRef.current = () => {
      

      const [lon_ajust, lat_ajust] = projectionRef.current!.rotate(); 
      const center: [number, number] = [-lon_ajust, -lat_ajust];

      const visiblePoints = points.filter(d =>
        d3.geoDistance([d.lng, d.lat], center)! <= Math.PI / 2
      );

      ocean.attr('d', pathGeneratorRef.current!({ type: "Sphere" }));
    
    
      g.selectAll<SVGPathElement, any>('path.country')
        .data(geoData.features)
        .join(
          enter => enter.append('path')
            .attr('class', 'country')
            .attr('d', pathGeneratorRef.current!)
            .attr('fill', '#ffddcc')
            .attr('stroke', '#fff'),
          update => update
            .attr('d', pathGeneratorRef.current!),
          exit => exit.remove()
        );
    
      g.selectAll<SVGCircleElement, any>('circle')
        .data(visiblePoints)
        .join(
          enter => enter.append('circle')
            .attr('cx', (d) => projectionRef.current!([d.lng, d.lat])![0])
            .attr('cy', (d) => projectionRef.current!([d.lng, d.lat])![1])
            .attr('r', (d) => Math.sqrt(d.howMany) * 2)
            .attr('fill', 'red')
            .attr('opacity', 0.5)
            .attr('fill', (d) => colorScale(d.comName))
            .on("mouseover", (event, d) => {
              tooltip
                .html(`<strong>Espécie:</strong> ${d.comName}<br/><strong>Quantidade:</strong> ${d.howMany}`)
                .style("opacity", 1)
                .style("visibility", "visible");
            })
            .on("mousemove", (event) => {
              const svgRect = svgRef.current!.getBoundingClientRect();
              tooltip
                .style("left", `${event.clientX - svgRect.left + 10}px`)
                .style("top", `${event.clientY - svgRect.top - 28}px`);
            })
            .on("mouseout", () => {
              tooltip.style("opacity", 0);
            }),
          update => update
            .attr('cx', (d) => projectionRef.current!([d.lng, d.lat])![0])
            .attr('cy', (d) => projectionRef.current!([d.lng, d.lat])![1]),
          exit => exit.remove()
        );
    };

    d3.select(window).on("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        lastPos = null;
      }
    });
    
    d3.select(window).on("mouseleave", () => {
      if (isDragging) {
        isDragging = false;
        lastPos = null;
      }
    });

    

    
    const ocean = g.append("path")
      .datum({ type: "Sphere" } as any)
      .attr("fill", "#aadaff");

    updateMapRef.current(); // Chama a função para desenhar o mapa inicialmente

    g.selectAll('path.country')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', pathGeneratorRef.current!)
      .attr('fill', '#ffddcc')
      .attr('stroke', '#fff');
      
    brushRef.current = d3.brush()
      .extent([[0, 0], [width, height]])
      .on("start", () => {
        // Desabilita o zoom e o drag quando o brush começa
        setBrushEnabled(true);
        svg.on("wheel", null); // Desativa o zoom
        svg.on("mousedown", null); // Desativa o drag
      })
      .on("end", (event) => {
        
        if (!event.selection) {
          setBrushEnabled(false); // Desativa o estado de brush ativo
          return;
        }

        if (typeof projectionRef.current!.invert !== "function") {
          console.warn("Projection does not support invert.");
          return;
        }

        console.log("brush end", event.selection);

        const [[x0, y0], [x1, y1]] = event.selection;
        const p0 = projectionRef.current!.invert([x0, y0]);
        const p1 = projectionRef.current!.invert([x1, y1]);
        console.log("p0", p0, "p1", p1);

        if (!p0 || !p1) {
          console.log("Seleção fora da esfera, ignorando.");
          return;
        }

        if (onBrushSelection) {
          onBrushSelection([
            [p0[0], p0[1]], // Coordenadas do ponto superior esquerdo do brush (longitude, latitude)
            [p1[0], p1[1]], // Coordenadas do ponto inferior direito do brush (longitude, latitude)
          ]);
        }

        // Calcula o centro em coordenadas geográficas
        const centerLon = (p0[0] + p1[0]) / 2;
        const centerLat = (p0[1] + p1[1]) / 2;

        // Calcula o quanto o usuário selecionou no SVG
        const selectionWidth = Math.abs(x1 - x0);
        const selectionHeight = Math.abs(y1 - y0);
        const selectionSize = Math.max(selectionWidth, selectionHeight);

        // Ajusta a escala da projeção
        const currentScale = projectionRef.current!.scale();
        const newScale = currentScale * (Math.min(width, height) / selectionSize) * 0.5; // 0.5 para não ficar exagerado
        projectionRef.current!.scale(newScale);

        // Para recentralizar, mudamos a rotação da projeção
        projectionRef.current!.rotate([-centerLon, -centerLat]);

        // Recria o pathGenerator com a nova projeção
        pathGeneratorRef.current = d3.geoPath().projection(projectionRef.current!);

        updateMapRef.current();

        // Atualiza o mapa com a nova projeção e path
        

        // Reativa o zoom e drag após finalizar o brush
        
        svg.on("wheel", zoomHandler);
        svg.on("mousedown", mouseDownHandler);
        svg.on("mousemove", mouseMoveHandler);

         // Atualiza o mapa após o brush
        setBrushEnabled(false); // Desativa o estado de brush ativo
      });
    
    return () => {
      tooltip.remove();
    };
    
    }, [geoData, width, height, points, onBrushSelection, flattened]); // Adicionando points como dependência

    const toggleBrush = () => {
      setBrushEnabled(prev => !prev); // Alterna entre habilitar e desabilitar o brush
    };
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll(".brush").remove(); // <- remove todos
  
    if (brushEnabled && brushRef.current) {
      svg.append("g")
        .attr("class", "brush")
        .call(brushRef.current)
        .raise();
    }
  }, [brushEnabled]);
  
  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      lastPosRef.current = null;
    };
  
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseleave", handleMouseUp); // adicional
  
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseleave", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (!points.length || !projectionRef.current) return;
  
    // Calcula a média da latitude e longitude dos pontos
    const avgLon = d3.mean(points, (d) => d.lng)!;
    const avgLat = d3.mean(points, (d) => d.lat)!;
  
    // Atualiza a rotação da projeção para centralizar os pontos
    projectionRef.current.rotate([-avgLon, -avgLat]);
  
    // Atualiza o mapa com a nova rotação
    updateMapRef.current?.();
  }, [points]);


  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef} width={width} height={height} style={{ cursor: "grab", backgroundColor: "#0a0a0a" }} />
      {isMounted && (
        <>
          <button
            onClick={() => setFlattened((prev) => !prev)}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              padding: "8px 12px",
              backgroundColor: "#4dabf7",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {flattened ? "Voltar ao globo" : "Flatten globe"}
          </button>

          <button
            onClick={toggleBrush} // Chama toggleBrush ao clicar no botão
            style={{
              position: "absolute",
              top: 50, // Um pouco abaixo do primeiro botão
              right: 10,
              padding: "8px 12px",
              backgroundColor: "#82c91e",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {brushEnabled ? "Desabilitar Brush" : "Habilitar Brush"}
          </button>
        </>
      )}
    </div>
  );

  
  
};

export default WorldGlobe;
