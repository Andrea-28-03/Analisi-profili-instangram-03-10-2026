import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { InstagramProfile } from '../types';
import { ProfilePreviewContent } from './ProfilePreview';

interface StudioGraphProps {
  profiles: InstagramProfile[];
  onSelectProfile: (profile: InstagramProfile) => void;
  theme?: 'light' | 'dark';
}

type GroupBy = 'category' | 'locationCountry' | 'visualStyle' | 'designTags';

const CRAYON_PALETTE = [
  '#FF5E8E', // Crayon Pink
  '#3A86FF', // Crayon Blue
  '#FFBE0B', // Crayon Yellow
  '#38B000', // Crayon Green
  '#FB8500', // Crayon Orange
  '#8338EC', // Crayon Violet
  '#00B4D8', // Crayon Cyan
  '#E63946', // Crayon Red
];

export const StudioGraph: React.FC<StudioGraphProps> = ({ profiles, onSelectProfile, theme = 'light' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('category');
  const [colorBy, setColorBy] = useState<GroupBy | 'none'>('designTags');
  const [hoveredProfile, setHoveredProfile] = useState<{ profile: InstagramProfile, x: number, y: number } | null>(null);

  const colorScale = useMemo(() => {
    return d3.scaleOrdinal(CRAYON_PALETTE);
  }, []);

  const { nodes, links, colorDomain } = useMemo(() => {
    const graphNodes: any[] = [];
    const graphLinks: any[] = [];
    const groupMap = new Map<string, any>();
    const colors = new Set<string>();

    const normalizeStyle = (styleStr: string) => {
      const lower = styleStr.toLowerCase();
      if (lower.includes('cinematic')) return 'Cinematic';
      if (lower.includes('minimal') || lower.includes('clean')) return 'Minimalista';
      if (lower.includes('dark') || lower.includes('moody')) return 'Dark / Moody';
      if (lower.includes('bright') || lower.includes('light')) return 'Luminoso';
      if (lower.includes('vintage') || lower.includes('retro')) return 'Vintage / Film';
      if (lower.includes('editorial') || lower.includes('fashion')) return 'Editorial';
      if (lower.includes('vibrant') || lower.includes('colorful') || lower.includes('pop')) return 'Vibrante / Pop';
      if (lower.includes('geometric') || lower.includes('architettur')) return 'Geometrico';
      
      const firstPart = styleStr.split(',')[0]?.trim();
      if (firstPart && firstPart.length > 18) {
        return firstPart.substring(0, 18) + '...';
      }
      return firstPart || 'Altro';
    };

    profiles.forEach(profile => {
      const ai = profile.aiAnalysis;
      if (!ai) return;

      let groupValues: string[] = [];
      if (groupBy === 'category') groupValues = [ai.category || 'Altro'];
      else if (groupBy === 'locationCountry') groupValues = [ai.locationCountry || 'Sconosciuta'];
      else if (groupBy === 'visualStyle') groupValues = [normalizeStyle(ai.visualStyle || '')];
      else if (groupBy === 'designTags') groupValues = ai.designTags && ai.designTags.length > 0 ? ai.designTags : ['Altro'];

      if (!groupValues || groupValues.length === 0) groupValues = ['Altro'];

      let colorValue = '';
      if (colorBy === 'category') colorValue = ai.category || 'Altro';
      else if (colorBy === 'locationCountry') colorValue = ai.locationCountry || 'Sconosciuta';
      else if (colorBy === 'visualStyle') colorValue = normalizeStyle(ai.visualStyle || '');
      else if (colorBy === 'designTags') colorValue = ai.designTags && ai.designTags.length > 0 ? ai.designTags[0] : 'Altro';

      if (colorValue) colors.add(colorValue);

      const profileNode = { 
        id: profile.id, 
        label: ai.displayName || profile.username, 
        type: 'profile', 
        profile,
        radius: 7,
        colorValue
      };
      graphNodes.push(profileNode);

      groupValues.forEach(groupValue => {
        if (!groupMap.has(groupValue)) {
          const groupNode = { 
            id: `group-${groupValue}`, 
            label: groupValue, 
            type: 'group', 
            radius: 16,
            count: 0
          };
          groupMap.set(groupValue, groupNode);
          graphNodes.push(groupNode);
        }

        const groupNode = groupMap.get(groupValue);
        groupNode.count += 1;
        
        graphLinks.push({
          source: profileNode.id,
          target: `group-${groupValue}`,
          value: 1
        });
      });
    });

    graphNodes.forEach(node => {
      if (node.type === 'group') {
        node.radius = 16 + Math.sqrt(node.count) * 4.5;
      }
    });

    return { nodes: graphNodes, links: graphLinks, colorDomain: Array.from(colors) };
  }, [profiles, groupBy, colorBy]);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    containerRef.current.innerHTML = '';

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height]);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoom);

    const g = svg.append('g');

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance((d: any) => {
        const targetNode = nodes.find(n => n.id === d.target || n.id === d.target.id);
        const targetRadius = targetNode?.radius || 16;
        return targetRadius + 38;
      }))
      .force('charge', d3.forceManyBody().strength((d: any) => d.type === 'group' ? -420 : -35))
      .force('x', d3.forceX().strength(0.05))
      .force('y', d3.forceY().strength(0.05));

    const link = g.append('g')
      .attr('stroke', theme === 'dark' ? '#8C827A' : '#6B635B')
      .attr('stroke-opacity', 0.5)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '2,2');

    const nodeGroup = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Group nodes (big crayon hubs)
    nodeGroup.filter((d: any) => d.type === 'group')
      .append('circle')
      .attr('r', (d: any) => d.radius)
      .attr('fill', '#FFD13B')
      .attr('stroke', '#1C1A17')
      .attr('stroke-width', 2.5);

    // Group node labels
    nodeGroup.filter((d: any) => d.type === 'group')
      .append('text')
      .text((d: any) => d.label)
      .attr('x', 0)
      .attr('y', (d: any) => d.radius + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', theme === 'dark' ? '#F7F4EB' : '#1C1A17')
      .attr('font-family', 'Patrick Hand, cursive')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none');

    // Profile nodes
    nodeGroup.filter((d: any) => d.type === 'profile')
      .append('circle')
      .attr('r', (d: any) => d.radius)
      .attr('fill', (d: any) => colorBy !== 'none' && d.colorValue ? colorScale(d.colorValue) : '#FF5E8E')
      .attr('stroke', '#1C1A17')
      .attr('stroke-width', 2)
      .on('mouseover', function(event, d: any) {
        d3.select(this)
          .attr('fill', '#FFD13B')
          .attr('r', d.radius * 1.6);
        
        if (d.profile) {
          const [x, y] = d3.pointer(event, containerRef.current);
          setHoveredProfile({ profile: d.profile, x, y });
        }
      })
      .on('mousemove', function(event, d: any) {
         if (d.profile) {
          const [x, y] = d3.pointer(event, containerRef.current);
          setHoveredProfile(prev => prev ? { ...prev, x, y } : null);
         }
      })
      .on('mouseout', function(event, d: any) {
        d3.select(this)
          .attr('fill', colorBy !== 'none' && d.colorValue ? colorScale(d.colorValue) : '#FF5E8E')
          .attr('r', d.radius);
          
        setHoveredProfile(null);
      })
      .on('click', (event, d: any) => {
        // Click-to-zoom on node
        const targetX = d.x || 0;
        const targetY = d.y || 0;
        svg.transition()
          .duration(750)
          .call(
            zoom.transform,
            d3.zoomIdentity.translate(width / 2 - targetX * 2, height / 2 - targetY * 2).scale(2)
          );

        if (d.type === 'profile' && d.profile) {
          onSelectProfile(d.profile);
        }
      });

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroup
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links, colorBy, colorScale, theme]);

  const containerBg = theme === 'dark' ? 'bg-[#22201D] text-[#F7F4EB] border-[#38332E]' : 'bg-[#FFFDF7] text-[#1C1A17] border-[#1C1A17]';
  const subBoxBg = theme === 'dark' ? 'bg-[#2C2A26] border-[#38332E]' : 'bg-[#FFF9E6] border-[#E5DFD2]';

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className={`${containerBg} p-3.5 rounded-2xl border-2 shadow-doodle-sm flex flex-wrap items-center justify-between gap-3 transition-colors`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-hand font-bold text-sm">Raggruppa per:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className={`text-xs font-hand font-bold border-2 rounded-xl py-1.5 px-3 focus:outline-none cursor-pointer ${subBoxBg}`}
            >
              <option value="category">Disciplina Creativa</option>
              <option value="locationCountry">Paese / Area Geografica</option>
              <option value="visualStyle">Stile & Linguaggio Visivo</option>
              <option value="designTags">Tag & Ambiti di Progetto</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-hand font-bold text-sm">Colora pastelli per:</span>
            <select
              value={colorBy}
              onChange={(e) => setColorBy(e.target.value as GroupBy | 'none')}
              className={`text-xs font-hand font-bold border-2 rounded-xl py-1.5 px-3 focus:outline-none cursor-pointer ${subBoxBg}`}
            >
              <option value="designTags">Tag di Progetto</option>
              <option value="category">Disciplina</option>
              <option value="locationCountry">Paese</option>
              <option value="visualStyle">Stile Visivo</option>
              <option value="none">Tinta Unita</option>
            </select>
          </div>
        </div>

        <div className="font-hand text-xs opacity-75">
          💡 Clicca su un nodo per zoomare e centrarlo
        </div>
      </div>

      {/* Graph Area */}
      <div className={`${containerBg} rounded-2xl border-2 shadow-doodle-sm overflow-hidden h-[540px] relative transition-colors`}>
        <div 
          ref={containerRef} 
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{
            backgroundImage: theme === 'dark' ? 'radial-gradient(#38332E 1px, transparent 1px)' : 'radial-gradient(#D6CEBF 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Hover Tooltip */}
        {hoveredProfile && (
          <div
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${hoveredProfile.x}px`,
              top: `${hoveredProfile.y}px`,
            }}
          >
            <div className={`${containerBg} border-2 rounded-xl p-3 shadow-doodle-sm min-w-[200px] max-w-[260px]`}>
              <div className="font-sans font-bold text-xs truncate">
                {hoveredProfile.profile.aiAnalysis?.displayName || hoveredProfile.profile.username}
              </div>
              <div className="font-typewriter text-[11px] opacity-75">
                @{hoveredProfile.profile.username}
              </div>
              {hoveredProfile.profile.aiAnalysis?.category && (
                <div className="mt-1.5 inline-block font-hand font-bold text-[11px] px-2 py-0.5 rounded-md bg-[#FFD13B] text-[#1C1A17] border border-[#1C1A17]">
                  {hoveredProfile.profile.aiAnalysis.category}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
