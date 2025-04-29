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
};

type Points = {
  lat: number;
  lon: number;
  value: number;
  species: string;
};

const WorldGlobe: React.FC<Props> = ({ width = 800, height = 450, geoData, points = [], onBrushSelection }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [flattened, setFlattened] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [brushEnabled, setBrushEnabled] = React.useState(false);

  useEffect(() => {
    
    setIsMounted(true);

    const svg = d3.select(svgRef.current);
    svg.selectAll("path").remove();
    svg.selectAll("circle").remove(); // Limpa antes de desenhar

    const tooltip = d3.select(svgRef.current!.parentElement)
      .append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "5px 10px")
      .style("border", "1px solid #999")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);
    
    //.clipAngle(90); // mostra só metade visível
     // Verifica se a projeção foi criada corretamente
     const projection = flattened 
     ? d3.geoEquirectangular()
         .scale(Math.min(width, height) / 2.2)
         .translate([width / 2, height / 2])
     : d3.geoOrthographic()
         .scale(Math.min(width, height) / 2.2)
         .translate([width / 2, height / 2]);
       if (!geoData) return;

    const pathGenerator = d3.geoPath().projection(projection);
  
    const defs = svg.append('defs');

    defs.append('clipPath')
      .attr('id', 'globeClip')
      .append('path')
      .datum({ type: 'Sphere' } as any)
      .attr('d', pathGenerator);

    const g = svg.append("g");



    let isDragging = false;
    let lastPos: [number, number] | null = null;

    const zoomHandler = (event: WheelEvent) => {
      event.preventDefault();
      
      const scaleFactor = event.deltaY < 0 ? 1.1 : 0.9; // Aumenta ou diminui conforme o scroll
      const scale = projection.scale();
      projection.scale(scale * scaleFactor); // Aplica o zoom na projeção
      
      updateMap(); // Atualiza a visualização após o zoom
    };

    const dragHandler = (event: MouseEvent) => {
      if (!isDragging || !lastPos) return;
      
      const [lastX, lastY] = lastPos;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      
      const rotate = projection.rotate();
      const sensitivity = 0.25; // Sensibilidade do movimento
      
      // Aplica a rotação
      projection.rotate([
        rotate[0] + dx * sensitivity,
        rotate[1] - dy * sensitivity,
        rotate[2]
      ]);
      
      lastPos = [event.clientX, event.clientY];
      
      updateMap(); // Atualiza o mapa, incluindo a rotação
    };
    

    const updateMap = () => {
      ocean.attr('d', pathGenerator({ type: "Sphere" }));
    
    
      g.selectAll<SVGPathElement, any>('path.country')
        .data(geoData.features)
        .join(
          enter => enter.append('path')
            .attr('class', 'country')
            .attr('d', pathGenerator)
            .attr('fill', '#efa400')
            .attr('stroke', '#fff'),
          update => update
            .attr('d', pathGenerator),
          exit => exit.remove()
        );

      const [lon_ajust, lat_ajust] = projection.rotate(); 
      const center: [number, number] = [-lon_ajust, -lat_ajust];

      const visiblePoints = points.filter(d =>
        d3.geoDistance([d.lng, d.lat], center)! <= Math.PI / 2
      );
    
      g.selectAll<SVGCircleElement, any>('circle')
        .data(visiblePoints)
        .join(
          enter => enter.append('circle')
            .attr('cx', (d) => projection([d.lng, d.lat])![0])
            .attr('cy', (d) => projection([d.lng, d.lat])![1])
            .attr('r', (d) => Math.sqrt(d.howMany) * 2)
            .attr('fill', 'red')
            .attr('opacity', 0.5)
            .on("mouseover", (event, d) => {
              tooltip
                .html(`<strong>Espécie:</strong> ${d.comName}<br/><strong>Quantidade:</strong> ${d.howMany}`)
                .style("opacity", 1);
            })
            .on("mousemove", (event) => {
              tooltip
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`);
            })
            .on("mouseout", () => {
              tooltip.style("opacity", 0);
            }),
          update => update
            .attr('cx', (d) => projection([d.lng, d.lat])![0])
            .attr('cy', (d) => projection([d.lng, d.lat])![1]),
          exit => exit.remove()
        );
    };

    svg.on("wheel", (event) => {
      event.preventDefault();
    
      const scaleFactor = event.deltaY < 0 ? 1.1 : 0.9;  // Aumenta ou diminui conforme o scroll
      const scale = projection.scale();
      projection.scale(scale * scaleFactor);  // Aplica o zoom na projeção
      updateMap();  // Atualiza a visualização após o zoom
    });
    
    svg.on("mousedown", (event) => {
      isDragging = true;
      lastPos = [event.clientX, event.clientY];
      event.preventDefault();

      //updateMap();
    });

    svg.on("mousemove", (event) => {
      if (!isDragging || !lastPos) return;
    
      const [lastX, lastY] = lastPos;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
    
      const rotate = projection.rotate();
      const sensitivity = 0.25; // Sensibilidade do movimento
    
      // Aplica a rotação
      projection.rotate([
        rotate[0] + dx * sensitivity,
        rotate[1] - dy * sensitivity,
        rotate[2]
      ]);
    
      lastPos = [event.clientX, event.clientY];
    
      // Atualiza o mapa, incluindo a rotação
      updateMap();
    });
    

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

    updateMap(); // Chama a função para desenhar o mapa inicialmente

    g.selectAll('path.country')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', pathGenerator)
      .attr('fill', '#efa400')
      .attr('stroke', '#fff');
      
    const brush = d3.brush()
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

        if (typeof projection.invert !== "function") {
          console.warn("Projection does not support invert.");
          return;
        }

        const [[x0, y0], [x1, y1]] = event.selection;
        const p0 = projection.invert([x0, y0]);
        const p1 = projection.invert([x1, y1]);
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
        const currentScale = projection.scale();
        const newScale = currentScale * (Math.min(width, height) / selectionSize) * 0.5; // 0.5 para não ficar exagerado
        projection.scale(newScale);

        // Para recentralizar, mudamos a rotação da projeção
        projection.rotate([-centerLon, -centerLat]);

        updateMap();

        if (onBrushSelection) {
          onBrushSelection([p0, p1]);
        }

        // Reativa o zoom e drag após finalizar o brush
        setBrushEnabled(false);
        svg.on("wheel", zoomHandler); // Reativa o zoom
        svg.on("mousedown", dragHandler); // Reativa o drag
      });
    
      if (brushEnabled) {
        svg.select(".brush").remove(); // Remove o brush anterior, se existir
        svg.append("g")
          .attr("class", "brush")
          .call(brush); // Adiciona o brush se brushEnabled for true
      } else {
        svg.select(".brush").remove(); // Remove o brush se brushEnabled for false
      }


    
    
    return () => {
      tooltip.remove();
    };
    
    }, [geoData, width, height, points, onBrushSelection, flattened]); // Adicionando points como dependência

    const toggleBrush = () => {
      setBrushEnabled(prev => !prev); // Alterna entre habilitar e desabilitar o brush
    };


    return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef} width={width} height={height} style={{ cursor: "grab", backgroundColor: "#000" }} />
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
