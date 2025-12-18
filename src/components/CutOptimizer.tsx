import { useRef, useEffect } from 'react';
import type { OptimizedPanel } from '../utils/optimizer';

interface CutOptimizerProps {
  optimizedPanels: OptimizedPanel[];
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B195', '#C06C84'
];

export default function CutOptimizer({ optimizedPanels }: CutOptimizerProps) {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    optimizedPanels.forEach((opt, panelIndex) => {
      const canvas = canvasRefs.current[panelIndex];
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { panel, pieces } = opt;
      
      // Calculate scale to fit canvas
      const padding = 40;
      const availableWidth = 800 - (2 * padding);
      const availableHeight = 600 - (2 * padding);
      const scaleX = availableWidth / panel.width;
      const scaleY = availableHeight / panel.height;
      const scale = Math.min(scaleX, scaleY, 3); // Max scale of 3

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw panel background
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(padding, padding, panel.width * scale, panel.height * scale);
      
      // Draw panel border
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.strokeRect(padding, padding, panel.width * scale, panel.height * scale);

      // Draw pieces
      pieces.forEach((placed, index) => {
        const w = placed.rotated ? placed.piece.height : placed.piece.width;
        const h = placed.rotated ? placed.piece.width : placed.piece.height;
        
        const x = padding + (placed.x * scale);
        const y = padding + (placed.y * scale);
        const width = w * scale;
        const height = h * scale;

        // Fill piece
        ctx.fillStyle = COLORS[index % COLORS.length];
        ctx.fillRect(x, y, width, height);

        // Border
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const label = `${w.toFixed(1)}×${h.toFixed(1)}`;
        const labelX = x + width / 2;
        const labelY = y + height / 2 - 8;
        
        // Background for text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        const textWidth = ctx.measureText(label).width;
        ctx.fillRect(labelX - textWidth / 2 - 4, labelY - 8, textWidth + 8, 16);
        
        // Text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, labelX, labelY);
        
        // Piece name
        ctx.font = '10px sans-serif';
        const nameY = y + height / 2 + 8;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        const nameWidth = ctx.measureText(placed.piece.name).width;
        ctx.fillRect(labelX - nameWidth / 2 - 4, nameY - 6, nameWidth + 8, 12);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(placed.piece.name, labelX, nameY);

        // Rotation indicator
        if (placed.rotated) {
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText('↻', x + 10, y + 12);
        }
      });

      // Draw dimensions
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `Panel: ${panel.width}×${panel.height} cm`,
        padding + (panel.width * scale) / 2,
        padding - 15
      );
    });
  }, [optimizedPanels]);

  if (optimizedPanels.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        Add wood panels to see cut optimization
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {optimizedPanels.map((opt, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">
              Panel {index + 1} ({opt.panel.width}×{opt.panel.height} cm)
            </h3>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600 font-semibold">
                Efficiency: {opt.efficiency.toFixed(1)}%
              </span>
              <span className="text-orange-600 font-semibold">
                Waste: {opt.wasteArea.toFixed(0)} cm²
              </span>
              <span className="text-blue-600 font-semibold">
                Pieces: {opt.pieces.length}
              </span>
            </div>
          </div>
          <canvas
            ref={el => { canvasRefs.current[index] = el; }}
            width={800}
            height={600}
            className="w-full border border-gray-300 rounded bg-white"
          />
        </div>
      ))}
    </div>
  );
}
