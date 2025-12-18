export interface Side {
  id: number;
  name: string;
  tilesX: number;
  tilesY: number;
  thickness?: number;
}

export interface WoodDimension {
  name: string;
  width: number;
  height: number;
  qty: number;
  type: 'embedded' | 'external' | 'internal';
  tiled: boolean;
}

export const calculateDimensions = (
  tilesX: number,
  tilesY: number,
  tileWidth: number, // in cm
  tileHeight: number, // in cm
  groutSize: number // in mm
): { width: number; height: number } => {
  // Convert grout from mm to cm
  const groutCm = groutSize / 10;
  
  // Calculate total dimensions: tiles + grout between tiles (n-1 gaps)
  const totalX = (tilesX * tileWidth) + ((tilesX - 1) * groutCm);
  const totalY = (tilesY * tileHeight) + ((tilesY - 1) * groutCm);
  
  return { width: totalX, height: totalY };
};

export const getWoodDimensions = (
  sides: Side[],
  tileWidth: number,
  tileHeight: number,
  groutSize: number,
  globalThickness: number,
  useSeparateThickness: boolean
): WoodDimension[] => {
  const top = sides.find(s => s.name === 'Top')!;
  const front = sides.find(s => s.name === 'Front')!;
  const left = sides.find(s => s.name === 'Left')!;

  const topDim = calculateDimensions(top.tilesX, top.tilesY, tileWidth, tileHeight, groutSize);
  const frontDim = calculateDimensions(front.tilesX, front.tilesY, tileWidth, tileHeight, groutSize);
  const leftDim = calculateDimensions(left.tilesX, left.tilesY, tileWidth, tileHeight, groutSize);

  // Get thickness for each side (mm to cm)
  const getThickness = (side: Side) => {
    const t = useSeparateThickness ? (side.thickness || globalThickness) : globalThickness;
    return t / 10; // Convert mm to cm
  };

  const topThickness = getThickness(top);
  const frontThickness = getThickness(front);
  const leftThickness = getThickness(left);

  // The assembled cube structure:
  // - Front/Back are external (full dimensions from tiles)
  // - Top/Bottom fit inside the box (reduced by thickness on all 4 sides)
  // - Left/Right are internal (fit between Front/Back and Top/Bottom)

  return [
    {
      name: 'Top',
      width: topDim.width - (2 * leftThickness), // Width minus left+right thickness
      height: leftDim.width - (2 * frontThickness), // Depth minus front+back thickness
      qty: 1,
      type: 'embedded',
      tiled: true
    },
    {
      name: 'Bottom',
      width: topDim.width - (2 * leftThickness), // Width minus left+right thickness
      height: leftDim.width - (2 * frontThickness), // Depth minus front+back thickness
      qty: 1,
      type: 'embedded',
      tiled: false
    },
    {
      name: 'Front (external)',
      width: topDim.width,
      height: frontDim.height,
      qty: 1,
      type: 'external',
      tiled: true
    },
    {
      name: 'Back (external)',
      width: topDim.width,
      height: frontDim.height,
      qty: 1,
      type: 'external',
      tiled: true
    },
    {
      name: 'Left (internal)',
      width: leftDim.width - (2 * frontThickness), // Depth minus front+back thickness
      height: frontDim.height - (2 * topThickness), // Height minus top+bottom thickness
      qty: 1,
      type: 'internal',
      tiled: true
    },
    {
      name: 'Right (internal)',
      width: leftDim.width - (2 * frontThickness), // Depth minus front+back thickness
      height: frontDim.height - (2 * topThickness), // Height minus top+bottom thickness
      qty: 1,
      type: 'internal',
      tiled: true
    }
  ];
};

export const calculateTiles = (
  sides: Side[],
  pattern: 'checkered' | 'solid'
): { color1: number; color2: number } => {
  let color1Count = 0;
  let color2Count = 0;

  sides.forEach(side => {
    if (side.name === 'Bottom') return;

    const totalTiles = side.tilesX * side.tilesY;

    if (pattern === 'checkered') {
      for (let y = 0; y < side.tilesY; y++) {
        for (let x = 0; x < side.tilesX; x++) {
          if ((x + y) % 2 === 0) {
            color1Count++;
          } else {
            color2Count++;
          }
        }
      }
    } else {
      color1Count += totalTiles;
    }
  });

  return { color1: color1Count, color2: color2Count };
};
