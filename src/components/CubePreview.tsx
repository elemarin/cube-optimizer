import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Side } from '../utils/calculations';

interface CubePreviewProps {
  sides: Side[];
  tileWidth: number;
  tileHeight: number;
  groutSize: number;
  pattern: 'checkered' | 'solid';
  color1: string;
  color2: string;
  groutColor: string;
}

function TiledCubeMesh({ 
  sides, 
  tileWidth, 
  tileHeight, 
  groutSize, 
  pattern, 
  color1, 
  color2,
  groutColor 
}: CubePreviewProps) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  const top = sides.find(s => s.name === 'Top')!;
  const front = sides.find(s => s.name === 'Front')!;
  const left = sides.find(s => s.name === 'Left')!;

  // Calculate cube dimensions (simplified)
  const groutCm = groutSize / 10;
  const cubeWidth = (top.tilesX * tileWidth) + ((top.tilesX + 1) * groutCm);
  const cubeHeight = (front.tilesY * tileHeight) + ((front.tilesY + 1) * groutCm);
  const cubeDepth = (left.tilesX * tileWidth) + ((left.tilesX + 1) * groutCm);

  // Create textures for each face
  const createFaceTexture = (tilesX: number, tilesY: number, sideName: string) => {
    const canvas = document.createElement('canvas');
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Background (grout color)
    ctx.fillStyle = groutColor;
    ctx.fillRect(0, 0, size, size);

    if (sideName === 'Bottom') {
      // Cork texture for bottom
      ctx.fillStyle = '#d4a574';
      ctx.fillRect(0, 0, size, size);
    } else {
      // Draw tiles
      const tilePixelWidth = size / tilesX;
      const tilePixelHeight = size / tilesY;

      for (let y = 0; y < tilesY; y++) {
        for (let x = 0; x < tilesX; x++) {
          let tileColor = color1;
          if (pattern === 'checkered') {
            tileColor = (x + y) % 2 === 0 ? color1 : color2;
          }

          const groutPixels = 2;
          ctx.fillStyle = tileColor;
          ctx.fillRect(
            x * tilePixelWidth + groutPixels,
            y * tilePixelHeight + groutPixels,
            tilePixelWidth - groutPixels * 2,
            tilePixelHeight - groutPixels * 2
          );
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  const topTexture = createFaceTexture(top.tilesX, top.tilesY, 'Top');
  const bottomTexture = createFaceTexture(top.tilesX, top.tilesY, 'Bottom');
  const frontTexture = createFaceTexture(front.tilesX, front.tilesY, 'Front');
  const backTexture = createFaceTexture(front.tilesX, front.tilesY, 'Back');
  const leftTexture = createFaceTexture(left.tilesX, left.tilesY, 'Left');
  const rightTexture = createFaceTexture(left.tilesX, left.tilesY, 'Right');

  const materials = [
    new THREE.MeshStandardMaterial({ map: rightTexture }), // right
    new THREE.MeshStandardMaterial({ map: leftTexture }), // left
    new THREE.MeshStandardMaterial({ map: topTexture }), // top
    new THREE.MeshStandardMaterial({ map: bottomTexture }), // bottom
    new THREE.MeshStandardMaterial({ map: frontTexture }), // front
    new THREE.MeshStandardMaterial({ map: backTexture }), // back
  ];

  return (
    <group ref={meshRef} position={[0, cubeHeight / 20, 0]}>
      <mesh material={materials}>
        <boxGeometry args={[cubeWidth / 10, cubeHeight / 10, cubeDepth / 10]} />
      </mesh>
    </group>
  );
}

export default function CubePreview(props: CubePreviewProps) {
  return (
    <div className="w-full h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-gray-300">
      <Canvas camera={{ position: [8, 6, 8], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        <TiledCubeMesh {...props} />
        <OrbitControls 
          enablePan={false} 
          minDistance={5} 
          maxDistance={20}
          autoRotate={false}
        />
        <gridHelper args={[20, 20, '#cccccc', '#eeeeee']} />
      </Canvas>
    </div>
  );
}
