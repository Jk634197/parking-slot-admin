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
        rect.setAttribute('fill', node.status ? STATUS_COLORS[node.status] : spec.fill);
        rect.style.cursor = viewMode ? 'pointer' : 'move';
        g.appendChild(rect);

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
      } else if (node.type === 'manager') {
        const size = node.width || spec.width;
        // Create a house-like shape for manager cabin
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const halfSize = size / 2;
        const wallHeight = size * 0.6;
        const wallY = size - wallHeight;

        // Draw the house shape: roof + walls
        path.setAttribute(
          'd',
          `M0 ${wallY} L${halfSize} 0 L${size} ${wallY} L${size} ${size} L0 ${size} Z
           M${size * 0.2} ${size} L${size * 0.2} ${wallY + wallHeight * 0.4} L${size * 0.4} ${wallY + wallHeight * 0.4} L${size * 0.4} ${size} Z
           M${size * 0.6} ${size} L${size * 0.6} ${wallY + wallHeight * 0.4} L${size * 0.8} ${wallY + wallHeight * 0.4} L${size * 0.8} ${size} Z`
        );
        path.setAttribute('fill', spec.fill);
        g.appendChild(path);

        // Add 'M' letter in the center of the house
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (size / 2).toString());
        text.setAttribute('y', (size * 0.5).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'white');
        text.setAttribute('font-size', (size * 0.4).toString());
        text.setAttribute('font-weight', 'bold');
        text.textContent = 'M';
        g.appendChild(text);

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
