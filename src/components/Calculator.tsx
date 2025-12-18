import { useState, useEffect } from 'react';
import { Calculator, Copy, Check, Save, Trash2, Plus } from 'lucide-react';
import type { Side } from '../utils/calculations';
import { getWoodDimensions, calculateTiles } from '../utils/calculations';
import type { Panel } from '../utils/optimizer';
import { optimizeCuts } from '../utils/optimizer';
import CutOptimizer from './CutOptimizer';
import CubePreview from './CubePreview';

export default function TiledCubeCalculator() {
  const [cubeName, setCubeName] = useState('New Cube');
  const [tileWidth, setTileWidth] = useState(11.5); // cm
  const [tileHeight, setTileHeight] = useState(11.5); // cm
  const [groutSize, setGroutSize] = useState(3); // mm
  const [groutColor, setGroutColor] = useState('#808080');
  const [woodThickness, setWoodThickness] = useState(9); // mm
  const [useSeparateThickness, setUseSeparateThickness] = useState(false);
  const [pattern, setPattern] = useState<'checkered' | 'solid'>('checkered');
  const [color1, setColor1] = useState('#ff6b35');
  const [color2, setColor2] = useState('#f7931e');
  const [sides, setSides] = useState<Side[]>([
    { id: 1, name: 'Top', tilesX: 2, tilesY: 2, thickness: 9 },
    { id: 2, name: 'Bottom', tilesX: 2, tilesY: 2, thickness: 9 },
    { id: 3, name: 'Front', tilesX: 2, tilesY: 3, thickness: 9 },
    { id: 4, name: 'Back', tilesX: 2, tilesY: 3, thickness: 9 },
    { id: 5, name: 'Left', tilesX: 2, tilesY: 3, thickness: 9 },
    { id: 6, name: 'Right', tilesX: 2, tilesY: 3, thickness: 9 }
  ]);
  const [savedCubes, setSavedCubes] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [panels, setPanels] = useState<Panel[]>([{ id: 1, width: 122, height: 244 }]);
  const [activeTab, setActiveTab] = useState<'config' | 'preview' | 'cuts'>('config');

  useEffect(() => {
    const saved = localStorage.getItem('savedCubes');
    if (saved) {
      setSavedCubes(JSON.parse(saved));
    }
  }, []);

  const updateSide = (id: number, field: keyof Side, value: any) => {
    setSides(sides.map(side => 
      side.id === id ? { ...side, [field]: value } : side
    ));
  };

  const saveCube = () => {
    const cube = {
      id: Date.now(),
      name: cubeName,
      tileWidth,
      tileHeight,
      groutSize,
      groutColor,
      woodThickness,
      useSeparateThickness,
      pattern,
      color1,
      color2,
      sides: [...sides]
    };
    const updated = [...savedCubes, cube];
    setSavedCubes(updated);
    localStorage.setItem('savedCubes', JSON.stringify(updated));
    alert(`Cube "${cubeName}" saved!`);
  };

  const loadCube = (cube: any) => {
    setCubeName(cube.name);
    setTileWidth(cube.tileWidth);
    setTileHeight(cube.tileHeight);
    setGroutSize(cube.groutSize);
    setGroutColor(cube.groutColor || '#808080');
    setWoodThickness(cube.woodThickness);
    setUseSeparateThickness(cube.useSeparateThickness || false);
    setPattern(cube.pattern);
    setColor1(cube.color1);
    setColor2(cube.color2);
    setSides(cube.sides);
  };

  const deleteCube = (id: number) => {
    const updated = savedCubes.filter(c => c.id !== id);
    setSavedCubes(updated);
    localStorage.setItem('savedCubes', JSON.stringify(updated));
  };

  const addPanel = () => {
    setPanels([...panels, { id: Date.now(), width: 122, height: 244 }]);
  };

  const updatePanel = (id: number, field: 'width' | 'height', value: number) => {
    setPanels(panels.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePanel = (id: number) => {
    if (panels.length > 1) {
      setPanels(panels.filter(p => p.id !== id));
    }
  };

  const woodDims = getWoodDimensions(sides, tileWidth, tileHeight, groutSize, woodThickness, useSeparateThickness);
  const tileCounts = calculateTiles(sides, pattern);
  const optimizedPanels = optimizeCuts(woodDims, panels);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-800">Tiled Cube Calculator</h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('config')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'config'
                  ? 'text-orange-600 border-b-2 border-orange-600 -mb-0.5'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Configuration
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'preview'
                  ? 'text-orange-600 border-b-2 border-orange-600 -mb-0.5'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              3D Preview
            </button>
            <button
              onClick={() => setActiveTab('cuts')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'cuts'
                  ? 'text-orange-600 border-b-2 border-orange-600 -mb-0.5'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Cut Optimizer
            </button>
          </div>

          {/* Configuration Tab */}
          {activeTab === 'config' && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cube Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cubeName}
                    onChange={(e) => setCubeName(e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                    placeholder="Enter cube name..."
                  />
                  <button
                    onClick={saveCube}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 font-semibold"
                  >
                    <Save className="w-5 h-5" />
                    Save
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tile Width (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tileWidth}
                    onChange={(e) => setTileWidth(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tile Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tileHeight}
                    onChange={(e) => setTileHeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Grout Size (mm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={groutSize}
                    onChange={(e) => setGroutSize(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Wood Thickness (mm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={woodThickness}
                    onChange={(e) => setWoodThickness(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                    disabled={useSeparateThickness}
                  />
                </div>
              </div>

              {/* Separate Thickness Toggle */}
              <div className="mb-8 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSeparateThickness}
                    onChange={(e) => setUseSeparateThickness(e.target.checked)}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <div>
                    <span className="font-semibold text-gray-800">Use separate thickness per side</span>
                    <p className="text-sm text-gray-600">Enable to set different thickness for each panel</p>
                  </div>
                </label>
              </div>

              <div className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Tile Pattern & Colors</h2>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pattern Type
                    </label>
                    <select
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value as 'checkered' | 'solid')}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                    >
                      <option value="checkered">Checkered</option>
                      <option value="solid">Solid Color</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tile Color 1
                    </label>
                    <input
                      type="color"
                      value={color1}
                      onChange={(e) => setColor1(e.target.value)}
                      className="w-full h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                  {pattern === 'checkered' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tile Color 2
                      </label>
                      <input
                        type="color"
                        value={color2}
                        onChange={(e) => setColor2(e.target.value)}
                        className="w-full h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Grout Color
                    </label>
                    <input
                      type="color"
                      value={groutColor}
                      onChange={(e) => setGroutColor(e.target.value)}
                      className="w-full h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-4">Configure Sides</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {sides.map(side => (
                  <div key={side.id} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-3">{side.name}</h3>
                    
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">Tiles Wide</label>
                        <input
                          type="number"
                          min="1"
                          value={side.tilesX}
                          onChange={(e) => updateSide(side.id, 'tilesX', parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">Tiles High</label>
                        <input
                          type="number"
                          min="1"
                          value={side.tilesY}
                          onChange={(e) => updateSide(side.id, 'tilesY', parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {useSeparateThickness && (
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Thickness (mm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={side.thickness}
                          onChange={(e) => updateSide(side.id, 'thickness', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 3D Preview Tab */}
          {activeTab === 'preview' && (
            <div>
              <CubePreview
                sides={sides}
                tileWidth={tileWidth}
                tileHeight={tileHeight}
                groutSize={groutSize}
                pattern={pattern}
                color1={color1}
                color2={color2}
                groutColor={groutColor}
              />
              <p className="text-center text-sm text-gray-600 mt-4">
                Drag to rotate • Scroll to zoom
              </p>
            </div>
          )}

          {/* Cut Optimizer Tab */}
          {activeTab === 'cuts' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Wood Panels</h2>
                <div className="space-y-3 mb-4">
                  {panels.map((panel, idx) => (
                    <div key={panel.id} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg">
                      <span className="font-semibold text-gray-700 w-20">Panel {idx + 1}:</span>
                      <input
                        type="number"
                        step="1"
                        value={panel.width}
                        onChange={(e) => updatePanel(panel.id, 'width', parseFloat(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                        placeholder="Width"
                      />
                      <span className="text-gray-600">×</span>
                      <input
                        type="number"
                        step="1"
                        value={panel.height}
                        onChange={(e) => updatePanel(panel.id, 'height', parseFloat(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                        placeholder="Height"
                      />
                      <span className="text-gray-600">cm</span>
                      {panels.length > 1 && (
                        <button
                          onClick={() => removePanel(panel.id)}
                          className="ml-auto px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addPanel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Add Panel
                </button>
              </div>
              
              <CutOptimizer optimizedPanels={optimizedPanels} />
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Wood Dimensions</h2>
            <div className="space-y-3">
              {woodDims.map((dim, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{dim.name}</h3>
                      <p className="text-2xl font-bold text-orange-600 mt-1">
                        {dim.width.toFixed(1)} × {dim.height.toFixed(1)} cm
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {dim.tiled ? '✓ Tiled' : '✗ Not tiled'} | {dim.type}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`${dim.width.toFixed(1)} × ${dim.height.toFixed(1)} cm`, idx)}
                      className="ml-2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Copy dimensions"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tile Count</h2>
            <div className="space-y-4">
              <div className="rounded-lg p-6 border-2" style={{ backgroundColor: color1 + '20', borderColor: color1 }}>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Color 1</h3>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: color1 }}></div>
                  <p className="text-4xl font-bold" style={{ color: color1 }}>{tileCounts.color1}</p>
                </div>
              </div>
              {pattern === 'checkered' && (
                <div className="rounded-lg p-6 border-2" style={{ backgroundColor: color2 + '20', borderColor: color2 }}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Color 2</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: color2 }}></div>
                    <p className="text-4xl font-bold" style={{ color: color2 }}>{tileCounts.color2}</p>
                  </div>
                </div>
              )}
              <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg p-6 border-2 border-gray-300">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Total Tiles</h3>
                <p className="text-4xl font-bold text-gray-700">
                  {tileCounts.color1 + tileCounts.color2}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Cubes */}
        {savedCubes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Saved Cubes</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedCubes.map(cube => (
                <div key={cube.id} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-orange-500 transition-colors">
                  <h3 className="font-bold text-gray-800 mb-2">{cube.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {cube.tileWidth}×{cube.tileHeight}cm tiles, {cube.groutSize}mm grout
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadCube(cube)}
                      className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteCube(cube.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Bottom side is not tiled (uses cork). Front/Back are external (full dimensions). Top/Bottom fit between Front/Back. Left/Right are internal (fit inside, reduced by wood thickness on all sides).
          </p>
        </div>
      </div>
    </div>
  );
}
