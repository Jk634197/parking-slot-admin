import type * as React from 'react';
import { useCallback, useRef } from 'react';

import { NODE_SPECS, STATUS_COLORS } from '../constants';
import type { Node } from '../types';

interface UseCanvasProps {
  nodes: Node[];
  viewMode: boolean;
  onNodeClick: (node: Node) => void;
  onNodeDoubleClick: (node: Node, index: number) => void;
  onNodeDragStart: (e: React.MouseEvent, index: number, node: Node) => void;
  selectedNode: Node | null;
}

export function useCanvas({
  nodes,
  viewMode,
  onNodeClick,
  onNodeDoubleClick,
  onNodeDragStart,
  selectedNode,
}: UseCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const renderNode = useCallback(
    (node: Node, index: number) => {
      const spec = NODE_SPECS[node.type];
      if (!spec) return null;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${node.x},${node.y})`);
      g.setAttribute('data-index', index.toString());
      g.setAttribute('class', 'node');

      let startTime = 0;

      g.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        startTime = Date.now();
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const syntheticEvent = {
            clientX: e.clientX,
            clientY: e.clientY,
            nativeEvent: { offsetX: x, offsetY: y },
            preventDefault: () => {
              //code
            },
            currentTarget: svgRef.current,
          } as unknown as React.MouseEvent;
          onNodeDragStart(syntheticEvent, index, node);
        }
      });

      g.addEventListener('click', (e) => {
        e.stopPropagation();
        // Only trigger click if it wasn't a drag (less than 200ms between mousedown and click)
        if (Date.now() - startTime < 200) {
          onNodeClick(node);
        }
      });

      g.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        onNodeDoubleClick(node, index);
      });

      // Add selection indicator
      if (selectedNode && selectedNode.id === node.id) {
        const selectionRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const width = node.width || spec.width;
        const height = node.height || spec.height;
        selectionRect.setAttribute('width', (width + 8).toString());
        selectionRect.setAttribute('height', (height + 8).toString());
        selectionRect.setAttribute('x', '-4');
        selectionRect.setAttribute('y', '-4');
        selectionRect.setAttribute('fill', 'none');
        selectionRect.setAttribute('stroke', '#2196f3');
        selectionRect.setAttribute('stroke-width', '2');
        selectionRect.setAttribute('stroke-dasharray', '4');
        g.appendChild(selectionRect);
      }

      if (node.type.startsWith('slot')) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', (node.width || spec.width).toString());
        rect.setAttribute('height', (node.height || spec.height).toString());
        rect.setAttribute('fill', node.status ? STATUS_COLORS[node.status || 'available'] : spec.fill);
        rect.style.cursor = viewMode ? 'pointer' : 'move';
        g.appendChild(rect);

        if (node.status === 'booked') {
          // Create a foreignObject to render React components
          const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
          foreignObject.setAttribute('width', (node.width || spec.width).toString());
          foreignObject.setAttribute('height', (node.height || spec.height).toString());
          foreignObject.setAttribute('x', '0');
          foreignObject.setAttribute('y', '0');

          // Create a div to hold the Car icon
          const div = document.createElement('div');
          div.style.width = '100%';
          div.style.height = '100%';
          div.style.display = 'flex';
          div.style.alignItems = 'center';
          div.style.justifyContent = 'center';

          // Create and append the Car icon
          const carIcon = document.createElement('div');
          carIcon.innerHTML = `<svg width="24" height="24" viewBox="0 0 256 256" fill="white">
            <path d="M240,112H229.2L201.9,49.7A15.9,15.9,0,0,0,186.8,40H69.2A15.9,15.9,0,0,0,54.1,49.7L26.8,112H16a8,8,0,0,0,0,16h8v80a16,16,0,0,0,16,16H64a16,16,0,0,0,16-16V192h96v16a16,16,0,0,0,16,16h24a16,16,0,0,0,16-16V128h8A8,8,0,0,0,240,112ZM69.2,56H186.8l24.9,56H44.3ZM64,208H40V192H64Zm160,0H192V192h32Zm0-32H32V128H224Z"/>
          </svg>`;
          div.appendChild(carIcon);
          foreignObject.appendChild(div);
          g.appendChild(foreignObject);
        } else {
          // Show label only for non-booked slots
          if (node.label) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', ((node.width || spec.width) / 2).toString());
            text.setAttribute('y', ((node.height || spec.height) / 2 + 5).toString());
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'white');
            text.setAttribute('font-size', '12');
            text.textContent = node.label;
            g.appendChild(text);
          }
        }

        if (node.vehicleNumber) {
          const vehicleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          vehicleText.setAttribute('x', ((node.width || spec.width) / 2).toString());
          vehicleText.setAttribute('y', ((node.height || spec.height) - 4).toString());
          vehicleText.setAttribute('text-anchor', 'middle');
          vehicleText.setAttribute('fill', 'white');
          vehicleText.setAttribute('font-size', '10');
          vehicleText.textContent = node.vehicleNumber;
          g.appendChild(vehicleText);
        }
      } else if (node.type === 'text') {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '0');
        text.setAttribute('y', '20');
        text.setAttribute('fill', '#000000');
        text.setAttribute('font-size', (node.fontSize || 14).toString());
        text.setAttribute('font-weight', node.fontWeight || 'normal');
        text.setAttribute('text-anchor', node.textAlign || 'left');
        text.textContent = node.label;
        text.style.cursor = viewMode ? 'pointer' : 'move';
        g.appendChild(text);
      } else if (node.type === 'security') {
        const size = node.width || spec.width;
        // Draw security cabin as a rounded square
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', size.toString());
        rect.setAttribute('height', size.toString());
        rect.setAttribute('x', '0');
        rect.setAttribute('y', '0');
        rect.setAttribute('rx', '8');
        rect.setAttribute('fill', spec.fill);
        rect.style.cursor = viewMode ? 'pointer' : 'move';
        g.appendChild(rect);

        // Add 'S' letter in the center
        const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        centerText.setAttribute('x', (size / 2).toString());
        centerText.setAttribute('y', (size / 2 + size * 0.1).toString());
        centerText.setAttribute('text-anchor', 'middle');
        centerText.setAttribute('fill', 'white');
        centerText.setAttribute('font-size', (size * 0.5).toString());
        centerText.setAttribute('font-weight', 'bold');
        centerText.textContent = 'S';
        g.appendChild(centerText);

        // Render label below cabin if provided
        if (node.label) {
          const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          labelText.setAttribute('x', (size / 2).toString());
          labelText.setAttribute('y', (size + 15).toString());
          labelText.setAttribute('text-anchor', 'middle');
          labelText.setAttribute('fill', '#000000');
          labelText.setAttribute('font-size', '12');
          labelText.textContent = node.label;
          g.appendChild(labelText);
        }
      } else {
        const size = node.width || spec.width;
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', size.toString());
        rect.setAttribute('height', size.toString());
        rect.setAttribute('fill', spec.fill);
        rect.setAttribute('rx', '5');
        g.appendChild(rect);

        // Draw arrow based on type
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const arrowSize = size * 0.6;
        const arrowOffset = (size - arrowSize) / 2;

        switch (node.type) {
          case 'arrow-right':
            path.setAttribute(
              'd',
              `M${arrowOffset} ${arrowOffset} L${size - arrowOffset} ${size / 2} L${arrowOffset} ${size - arrowOffset}`
            );
            break;
          case 'arrow-left':
            path.setAttribute(
              'd',
              `M${size - arrowOffset} ${arrowOffset} L${arrowOffset} ${size / 2} L${size - arrowOffset} ${size - arrowOffset}`
            );
            break;
          case 'arrow-up':
            path.setAttribute(
              'd',
              `M${arrowOffset} ${size - arrowOffset} L${size / 2} ${arrowOffset} L${size - arrowOffset} ${size - arrowOffset}`
            );
            break;
          case 'arrow-down':
            path.setAttribute(
              'd',
              `M${arrowOffset} ${arrowOffset} L${size / 2} ${size - arrowOffset} L${size - arrowOffset} ${arrowOffset}`
            );
            break;
          default:
            break;
        }

        path.setAttribute('fill', 'white');
        g.appendChild(path);
      }

      return g;
    },
    [viewMode, onNodeClick, onNodeDoubleClick, onNodeDragStart, selectedNode]
  );

  const renderNodes = useCallback(() => {
    if (svgRef.current) {
      svgRef.current.innerHTML = '';
      nodes.forEach((node, index) => {
        const element = renderNode(node, index);
        if (element) {
          svgRef.current?.appendChild(element);
        }
      });
    }
  }, [nodes, renderNode]);

  return {
    canvasRef,
    svgRef,
    renderNodes,
  };
}
