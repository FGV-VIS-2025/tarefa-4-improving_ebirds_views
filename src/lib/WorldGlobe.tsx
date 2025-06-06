import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FeatureCollection, Geometry } from 'geojson';
import {ReportBirds} from '@/lib/Components';
import type { Feature, Polygon } from 'geojson';

type Props = {
  width?: number;
  height?: number;
  geoData: FeatureCollection<Geometry>;
  points?: ReportBirds[]; // Adicionando a propriedade points
  onBrushSelection?: (selection: [[number, number], [number, number]]) => void;
  color?: d3.ScaleOrdinal<string, string>;
  center_by_bar: [number, number] | null;
  zoom_by_bar: number;
};

type Points = {
  lat: number;
  lon: number;
  value: number;
  species: string;
};

const WorldGlobe: React.FC<Props> = ({ width = 830, height = 520, geoData, points = [], onBrushSelection, color, center_by_bar, zoom_by_bar }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [flattened, setFlattened] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [brushEnabled, setBrushEnabled] = React.useState(false);
  const [brushPolygonGeo, setBrushPolygonGeo] = React.useState<Feature<Polygon> | null>(null);
  const [projectionVersion, setProjectionVersion] = useState(0);

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

  function transitionProjection(
    projection: d3.GeoProjection,
    newRotate: [number, number, number],
    newScale: number,
    duration: number,
    updateMap: () => void
  ) {
    const currentRotate = projection.rotate();
    const currentScale = projection.scale();
  
    const rotateInterp = d3.interpolate(currentRotate, newRotate);
    const scaleInterp = d3.interpolate(currentScale, newScale);
  
    d3.transition()
      .duration(duration)
      .tween("projection", () => t => {
        projection.rotate(rotateInterp(t));
        projection.scale(scaleInterp(t));
        updateMap();
      });
  }

  const radiusScale = d3.scaleSqrt()
    .domain([0, d3.max(points, d => d.howMany)!])
    .range([1, 50]);

    const howManyValues = points.map(d => d.howMany).filter(v => v != null);
    const minVal = d3.min(howManyValues) ?? 0;
    const maxVal = d3.max(howManyValues) ?? 0;
    const meanVal = d3.mean(howManyValues) ?? (minVal + maxVal) / 2;
    const meanInf = (meanVal + minVal) / 2;
    const meanMax = (meanVal + maxVal) / 2;

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

    const brushPolygon = svg.append("path")
      .attr("id", "brush-polygon")
      .attr("fill", "rgba(88, 88, 72, 0.2)")
      .attr("stroke", "orange")
      .attr("stroke-width", 2);



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
        .data(visiblePoints, d => d.locID + d.comName)
        .join(
          enter => enter.append('circle')
            .attr('cx', (d) => projectionRef.current!([d.lng, d.lat])![0])
            .attr('cy', (d) => projectionRef.current!([d.lng, d.lat])![1])
            .attr('r', (d) => radiusScale(d.howMany))
            .attr('opacity', 0.70)
            .attr('fill', (d) => colorScale(d.comName))
            .on("mouseover", (event, d) => {
              tooltip
                .html(
                  `<strong>${d.comName}</strong><br/>
                   Place: ${d.locName}<br/>
                   How many: ${d.howMany}`)
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
          .attr('cy', (d) => projectionRef.current!([d.lng, d.lat])![1])
          .attr('r', (d) => radiusScale(d.howMany)),
          exit => exit.remove()
        );
      setProjectionVersion(prev => prev + 1);

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
      .on("brush", (event) => {
        const selection = event.selection;
        if (!selection) return;
      
        const [[x0, y0], [x1, y1]] = selection;
        

        if (typeof projectionRef.current!.invert !== "function") {
          console.warn("Projection does not support invert.");
          return;
        }

        const p1 = projectionRef.current!.invert([x0, y0]); // [lng, lat]
        const p2 = projectionRef.current!.invert([x1, y1]);

        if (!p1 || !p2) return;
      
        // Convertemos os cantos do retângulo para coordenadas geográficas
        const lngMin = Math.min(p1[0], p2[0]);
        const lngMax = Math.max(p1[0], p2[0]);
        const latMin = Math.min(p1[1], p2[1]);
        const latMax = Math.max(p1[1], p2[1]);

        //if (!pTopLeft || !pTopRight || !pBottomRight || !pBottomLeft) return;
              
        // Criamos um polígono em GeoJSON
        const polygon: Feature<Polygon> = {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [lngMin, latMin],
              [lngMin, latMax],
              [lngMax, latMax],
              [lngMax, latMin],
              [lngMin, latMin] // Fechar o polígono
            ]]
          },
          properties: {}
        };
      
        // Atualizamos um path que será desenhado sobre o globo
        setBrushPolygonGeo(polygon); // pathGenerator = d3.geoPath().projection(projection)
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

    const clearBrush = () => {
      setBrushPolygonGeo(null); // Remove o polígono
      setBrushEnabled(false);   // Desativa o brush
      onBrushSelection?.(null as any); // Reseta o callback externo (pode ajustar o tipo se preferir)

      // Limpa o path do brush visualmente
      d3.select("#brush-polygon").attr("d", null);
    };
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll(".brush").remove(); // <- remove todos
  
    if (brushEnabled && brushRef.current) {
      svg.append("g")
        .attr("class", "brush")
        .call(brushRef.current)
        d3.select(svgRef.current)
        .select<SVGGElement>(".brush")
        .call(brushRef.current)
        .selectAll("rect")
        .style("opacity", 0)
        .raise();
    }
  }, [brushEnabled]);

  useEffect(() => {
    if (!brushPolygonGeo || !pathGeneratorRef.current) return;
  
    d3.select("#brush-polygon")
      .attr("d", pathGeneratorRef.current(brushPolygonGeo))
      .attr("stroke", "rgba(0, 0, 0, 0.2)")         // cor da borda
      .attr("fill", "rgba(75, 75, 75, 0.2)"); // preenchimento com opacidade
  }, [brushPolygonGeo, projectionVersion]);
  
  
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

  useEffect(() => {
    if (!center_by_bar || !projectionRef.current || !updateMapRef.current) return;
  
    const [lat, lon] = center_by_bar;
  
    // Aplica rotação e zoom na projeção existente
    const newRotate:[number, number, number] = [-lon, -lat, 0];
    const projection = projectionRef.current;
    
  
    // Atualiza os paths
    const newScale = 2000;
    transitionProjection(projection, newRotate, newScale, 1000, updateMapRef.current);
  }, [center_by_bar, zoom_by_bar]);


  return (
    <div style={{ position: "relative" }} className='ml-6 mt-6'>
      <svg ref={svgRef} width={width} height={height} style={{ cursor: "grab", backgroundColor: "#0a0a0a" }} />
      {isMounted && (
        <>
          <button
            onClick={() => setFlattened((prev) => !prev)}
            style={{
              width: "200px",
              height: "40px",
              position: "absolute",
              top: 10,
              right: 10,
              padding: "8px 12px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {flattened ? <img src="./returnglobe.png" alt="retunr globe" /> : <img src="./flatemglobe.png" alt="flatem globe" />}
          </button>

          <button
            onClick={toggleBrush} // Chama toggleBrush ao clicar no botão
            style={{
              width: "200px",
              height: "40px",
              position: "absolute",
              top: 50, // Um pouco abaixo do primeiro botão
              right: 10,
              padding: "8px 12px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {brushEnabled ? <img src="./cancelselect.png" alt="Cancelar Filtro" /> : <img src="./selectarea.png" alt="Ativar Filtro" />}
          </button>

          <button
            onClick={clearBrush}
            style={{ 
              width: "200px",
              height: "40px",
              position: "absolute",  
              top: 90,                
              right: 10, 
              padding: '6px 12px', 
              border: 'none', 
              cursor: 'pointer' }}
          >
            {brushPolygonGeo? <img src="./clearon.png" alt="climpar ativado" /> : <img src="./clearoff.png" alt="limbar escondido" />}
          </button>

          <div
            style={{
              position: "absolute",
              top: 150, // abaixo dos botões
              right: 10,
              padding: "4px",
              backgroundColor: "#ffffffdd",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#000",
              width: "170px", // Definindo uma largura fixa para a div
            }}
          >
            <strong>How many birds:</strong>
            {/* Verificar se algum valor é maior que 0 antes de renderizar a legenda */}
            {[minVal, meanInf, meanVal, meanMax, maxVal].some(n => n > 0) && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  marginTop: "6px",
                }}
              >
                {[minVal, meanInf, meanVal, meanMax, maxVal].map((n) => {
                  if (n > 0) { // Exibir valores apenas se forem positivos
                    const r = radiusScale(n);
                    return (
                      <div key={n} 
                        style={{
                          display: "flex",
                          justifyContent: "space-between", // Alinha números à esquerda e círculos à direita
                          width: "100%", // Para garantir que ocupe toda a largura disponível
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "11px", whiteSpace: "nowrap" }}>{Math.round(n)}   </span>
                        <svg width={r * 2} height={r * 2}>
                          <circle
                            cx={r}
                            cy={r}
                            r={r}
                            fill="#aaa"
                            opacity={0.6}
                            stroke="#666"
                          />
                        </svg>
                        
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>

        </>
      )}
    </div>
  );

  
  
};

export default WorldGlobe;
