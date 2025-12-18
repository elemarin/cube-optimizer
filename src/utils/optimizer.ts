import type { WoodDimension } from './calculations';

export interface Panel {
  id: number;
  width: number;
  height: number;
}

export interface PlacedPiece {
  piece: WoodDimension;
  x: number;
  y: number;
  rotated: boolean;
}

export interface OptimizedPanel {
  panel: Panel;
  pieces: PlacedPiece[];
  wasteArea: number;
  efficiency: number;
}

// Simple bin packing algorithm - First Fit Decreasing Height (FFDH)
export const optimizeCuts = (
  woodDimensions: WoodDimension[],
  panels: Panel[]
): OptimizedPanel[] => {
  const results: OptimizedPanel[] = [];
  const remainingPieces = [...woodDimensions];

  // Sort pieces by area (largest first)
  remainingPieces.sort((a, b) => (b.width * b.height) - (a.width * a.height));

  for (const panel of panels) {
    const placedPieces: PlacedPiece[] = [];
    const usedSpace: { x: number; y: number; width: number; height: number }[] = [];

    // Try to fit pieces
    for (let i = remainingPieces.length - 1; i >= 0; i--) {
      const piece = remainingPieces[i];

      // Try normal orientation
      const position = findPosition(piece.width, piece.height, panel.width, panel.height, usedSpace);
      if (position) {
        placedPieces.push({
          piece,
          x: position.x,
          y: position.y,
          rotated: false
        });
        usedSpace.push({
          x: position.x,
          y: position.y,
          width: piece.width,
          height: piece.height
        });
        remainingPieces.splice(i, 1);
      } else {
        // Try rotated orientation
        const rotatedPosition = findPosition(piece.height, piece.width, panel.width, panel.height, usedSpace);
        if (rotatedPosition) {
          placedPieces.push({
            piece,
            x: rotatedPosition.x,
            y: rotatedPosition.y,
            rotated: true
          });
          usedSpace.push({
            x: rotatedPosition.x,
            y: rotatedPosition.y,
            width: piece.height,
            height: piece.width
          });
          remainingPieces.splice(i, 1);
        }
      }
    }

    // Calculate efficiency
    const usedArea = placedPieces.reduce((sum, p) => {
      const w = p.rotated ? p.piece.height : p.piece.width;
      const h = p.rotated ? p.piece.width : p.piece.height;
      return sum + (w * h);
    }, 0);
    const panelArea = panel.width * panel.height;
    const wasteArea = panelArea - usedArea;
    const efficiency = (usedArea / panelArea) * 100;

    results.push({
      panel,
      pieces: placedPieces,
      wasteArea,
      efficiency
    });

    // Stop if all pieces are placed
    if (remainingPieces.length === 0) break;
  }

  return results;
};

function findPosition(
  width: number,
  height: number,
  panelWidth: number,
  panelHeight: number,
  usedSpace: { x: number; y: number; width: number; height: number }[]
): { x: number; y: number } | null {
  // Try to place at origin first
  if (width <= panelWidth && height <= panelHeight && !overlaps(0, 0, width, height, usedSpace)) {
    return { x: 0, y: 0 };
  }

  // Try positions based on existing pieces
  const tryPositions: { x: number; y: number }[] = [{ x: 0, y: 0 }];

  for (const used of usedSpace) {
    tryPositions.push(
      { x: used.x + used.width, y: used.y },
      { x: used.x, y: used.y + used.height }
    );
  }

  for (const pos of tryPositions) {
    if (
      pos.x + width <= panelWidth &&
      pos.y + height <= panelHeight &&
      !overlaps(pos.x, pos.y, width, height, usedSpace)
    ) {
      return pos;
    }
  }

  return null;
}

function overlaps(
  x: number,
  y: number,
  width: number,
  height: number,
  usedSpace: { x: number; y: number; width: number; height: number }[]
): boolean {
  for (const used of usedSpace) {
    if (
      x < used.x + used.width &&
      x + width > used.x &&
      y < used.y + used.height &&
      y + height > used.y
    ) {
      return true;
    }
  }
  return false;
}
