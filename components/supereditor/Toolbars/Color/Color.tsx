"use client";

import React, { useState, useEffect, useRef } from 'react';

// Convert RGB to Hex
const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Convert Hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Convert RGB to CMYK
const rgbToCmyk = (r, g, b) => {
  // Normalize RGB values
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  
  let k = 1 - Math.max(nr, ng, nb);
  
  // Edge case: pure black
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }
  
  const c = Math.round(((1 - nr - k) / (1 - k)) * 100);
  const m = Math.round(((1 - ng - k) / (1 - k)) * 100);
  const y = Math.round(((1 - nb - k) / (1 - k)) * 100);
  k = Math.round(k * 100);
  
  return { c, m, y, k };
};

// Convert CMYK to RGB
const cmykToRgb = (c, m, y, k) => {
  // Normalize CMYK values
  const nc = c / 100;
  const nm = m / 100;
  const ny = y / 100;
  const nk = k / 100;
  
  const r = Math.round(255 * (1 - nc) * (1 - nk));
  const g = Math.round(255 * (1 - nm) * (1 - nk));
  const b = Math.round(255 * (1 - ny) * (1 - nk));
  
  return { r, g, b };
};

// Convert RGB to HSV
const rgbToHsv = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  let s = max === 0 ? 0 : diff / max;
  let v = max;
  
  if (max !== min) {
    if (max === r) {
      h = (g - b) / diff + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
    h /= 6;
  }
  
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
};

// Convert HSV to RGB
const hsvToRgb = (h, s, v) => {
  h /= 360;
  s /= 100;
  v /= 100;
  
  let r, g, b;
  
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    default: r = 0; g = 0; b = 0;
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

const ColorPicker = ({ onColorSelect, onClose, initialColor = '#000000', title = 'Color Picker' }) => {
  const [selectedColor, setSelectedColor] = useState('#000000'); // Default to black
  const [displayMode, setDisplayMode] = useState('hex'); // 'hex', 'rgb', 'cmyk'
  const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });
  const [cmyk, setCmyk] = useState({ c: 0, m: 0, y: 0, k: 0 });
  const [hsv, setHsv] = useState({ h: 0, s: 0, v: 0 });
  const [hex, setHex] = useState('#000000'); // Default to black
  const [pickerMode, setPickerMode] = useState('preset'); // Default to preset
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0); // Start with black (index 0)
  
  const colorBoxRef = useRef(null);
  const hueSliderRef = useRef(null);
  const presetGridRef = useRef(null);
  
  // Predefined color palette - moved black to first position
  const colorPalette = [
    // Start with black as default
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#808080', 
    
    // Red shades
    '#800000', '#A52A2A', '#DC143C', '#FF6347', '#FF7F50',
    
    // Orange/Yellow shades
    '#FF4500', '#FFA500', '#FFD700', '#FFFF00', '#F0E68C',
    
    // Green shades
    '#006400', '#008000', '#228B22', '#32CD32', '#90EE90',
    
    // Blue shades
    '#000080', '#0000CD', '#4169E1', '#87CEEB', '#ADD8E6',
    
    // Purple/Pink shades
    '#800080', '#8B008B', '#9932CC', '#FF69B4', '#FFB6C1',
    
    // Brown/Beige shades
    '#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F5DEB3',
    
    // Additional colors
    '#2F4F4F', '#696969', '#708090', '#778899', '#DCDCDC'
  ];

  // Grid configuration for keyboard navigation
  const GRID_COLS = 8;
  const GRID_ROWS = Math.ceil(colorPalette.length / GRID_COLS);

  // Enhanced key handler for ESC, Enter, and Arrow keys
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        handleApplyColor();
      } else if (pickerMode === 'preset') {
        // Handle arrow key navigation only in preset mode
        let newIndex = selectedPresetIndex;
        
        switch (event.key) {
          case 'ArrowRight':
            event.preventDefault();
            event.stopPropagation();
            newIndex = (selectedPresetIndex + 1) % colorPalette.length;
            break;
          case 'ArrowLeft':
            event.preventDefault();
            event.stopPropagation();
            newIndex = selectedPresetIndex === 0 ? colorPalette.length - 1 : selectedPresetIndex - 1;
            break;
          case 'ArrowDown':
            event.preventDefault();
            event.stopPropagation();
            newIndex = selectedPresetIndex + GRID_COLS;
            if (newIndex >= colorPalette.length) {
              // Wrap to top of same column
              newIndex = selectedPresetIndex % GRID_COLS;
            }
            break;
          case 'ArrowUp':
            event.preventDefault();
            event.stopPropagation();
            newIndex = selectedPresetIndex - GRID_COLS;
            if (newIndex < 0) {
              // Wrap to bottom of same column
              const col = selectedPresetIndex % GRID_COLS;
              const lastRowStart = (GRID_ROWS - 1) * GRID_COLS;
              newIndex = Math.min(lastRowStart + col, colorPalette.length - 1);
            }
            break;
          default:
            return;
        }
        
        if (newIndex !== selectedPresetIndex) {
          setSelectedPresetIndex(newIndex);
          const newColor = colorPalette[newIndex];
          updateFromHex(newColor);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, selectedColor, pickerMode, selectedPresetIndex]);

  // Initialize with black color as default
  useEffect(() => {
    const blackColor = '#000000';
    const blackRgb = hexToRgb(blackColor);
    setRgb(blackRgb);
    setCmyk(rgbToCmyk(blackRgb.r, blackRgb.g, blackRgb.b));
    setHsv(rgbToHsv(blackRgb.r, blackRgb.g, blackRgb.b));
    setHex(blackColor);
    setSelectedColor(blackColor);
    setSelectedPresetIndex(0); // Black is at index 0
  }, []);

  // Update all color values when RGB changes
  const updateFromRgb = (newRgb) => {
    setRgb(newRgb);
    setCmyk(rgbToCmyk(newRgb.r, newRgb.g, newRgb.b));
    setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setSelectedColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  // Update all color values when CMYK changes
  const updateFromCmyk = (newCmyk) => {
    setCmyk(newCmyk);
    const newRgb = cmykToRgb(newCmyk.c, newCmyk.m, newCmyk.y, newCmyk.k);
    setRgb(newRgb);
    setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setSelectedColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  // Update all color values when HSV changes
  const updateFromHsv = (newHsv) => {
    setHsv(newHsv);
    const newRgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
    setRgb(newRgb);
    setCmyk(rgbToCmyk(newRgb.r, newRgb.g, newRgb.b));
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setSelectedColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  // Update all color values when Hex changes
  const updateFromHex = (newHex) => {
    setHex(newHex);
    const newRgb = hexToRgb(newHex);
    setRgb(newRgb);
    setCmyk(rgbToCmyk(newRgb.r, newRgb.g, newRgb.b));
    setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
    setSelectedColor(newHex);
    
    // Update selected preset index if the color matches a preset
    const presetIndex = colorPalette.indexOf(newHex.toLowerCase());
    if (presetIndex !== -1) {
      setSelectedPresetIndex(presetIndex);
    }
  };

  // Handle color selection from the color box
  const handleColorBoxPick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!colorBoxRef.current) return;
    
    const rect = colorBoxRef.current.getBoundingClientRect();
    
    // Calculate S and V based on the position in the color box
    const s = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const v = Math.max(0, Math.min(100, 100 - ((e.clientY - rect.top) / rect.height) * 100));
    
    // Keep the current hue and update S and V
    updateFromHsv({ h: hsv.h, s, v });
  };

  // Handle color selection from the hue slider
  const handleHueSliderPick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hueSliderRef.current) return;
    
    const rect = hueSliderRef.current.getBoundingClientRect();
    
    // Calculate hue based on the position in the slider
    const h = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
    
    // Keep current S and V, update just the hue
    updateFromHsv({ h, s: hsv.s, v: hsv.v });
  };

  // Handle color pick from the preset palette
  const handlePresetPick = (e, color, index) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedPresetIndex(index);
    updateFromHex(color);
  };

  // Handle applying the selected color
  const handleApplyColor = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    onColorSelect(selectedColor);
    onClose();
  };

  // Handle input change for RGB values
  const handleRgbChange = (component, value) => {
    const intValue = parseInt(value, 10);
    if (isNaN(intValue)) return;
    
    const validValue = Math.max(0, Math.min(255, intValue));
    const newRgb = { ...rgb, [component]: validValue };
    updateFromRgb(newRgb);
  };

  // Handle input change for CMYK values
  const handleCmykChange = (component, value) => {
    const intValue = parseInt(value, 10);
    if (isNaN(intValue)) return;
    
    const validValue = Math.max(0, Math.min(100, intValue));
    const newCmyk = { ...cmyk, [component]: validValue };
    updateFromCmyk(newCmyk);
  };

  // Handle input change for Hex value
  const handleHexChange = (value) => {
    // Basic hex validation
    if (/^#?([0-9A-F]{6})$/i.test(value)) {
      const formattedHex = value.startsWith('#') ? value : `#${value}`;
      updateFromHex(formattedHex);
    } else {
      setHex(value); // Allow typing but don't update other values until valid
    }
  };

  // Enhanced input handlers with Enter key support
  const handleInputKeyDown = (e, handler, value) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handler(value);
      handleApplyColor(e);
    }
  };

  // Mouse event handlers for continuous color selection
  const handleMouseDown = (handler) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    handler(e);
    
    const onMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      handler(moveEvent);
    };
    
    const onMouseUp = (upEvent) => {
      upEvent.preventDefault();
      upEvent.stopPropagation();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div 
      className="tw-absolute tw-z-50 tw-bg-white tw-border tw-border-purple-300 tw-rounded tw-shadow-lg tw-p-4 tw-min-w-[300px]"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Color picker title */}
      <div className="tw-text-center tw-font-medium tw-text-purple-700 tw-mb-3">
        {title}
      </div>
      
      {/* Color preview */}
      <div 
        className="tw-w-full tw-h-16 tw-rounded tw-mb-4 tw-border tw-border-gray-300" 
        style={{ backgroundColor: selectedColor }}
      />
      
      {/* Picker mode tabs */}
      <div className="tw-flex tw-mb-4 tw-border-b tw-border-gray-300">
        <button 
          className={`tw-px-3 tw-py-1 tw-mr-2 ${pickerMode === 'preset' ? 'tw-bg-purple-100 tw-border-b-2 tw-border-purple-500' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPickerMode('preset');
          }}
        >
          Preset Colors
        </button>
        <button 
          className={`tw-px-3 tw-py-1 ${pickerMode === 'advanced' ? 'tw-bg-purple-100 tw-border-b-2 tw-border-purple-500' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPickerMode('advanced');
          }}
        >
          Advanced
        </button>
      </div>
      
      {/* Color picker content based on mode */}
      {pickerMode === 'preset' && (
        <div className="tw-mb-4">
          <div ref={presetGridRef} className="tw-grid tw-grid-cols-8 tw-gap-1">
            {colorPalette.map((color, index) => (
              <div
                key={color}
                onClick={(e) => handlePresetPick(e, color, index)}
                onMouseDown={(e) => e.preventDefault()}
                className={`tw-w-6 tw-h-6 tw-cursor-pointer tw-border tw-border-gray-300 tw-rounded ${
                  selectedPresetIndex === index 
                    ? 'tw-ring-2 tw-ring-purple-500 tw-ring-offset-1' 
                    : selectedColor === color 
                      ? 'tw-ring-2 tw-ring-purple-300' 
                      : ''
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="tw-mt-2 tw-text-xs tw-text-gray-500 tw-text-center">
            Use arrow keys to navigate, Enter to select
          </div>
        </div>
      )}
      
      {pickerMode === 'advanced' && (
        <div className="tw-mb-4">
          {/* Color box (saturation/value) */}
          <div 
            ref={colorBoxRef}
            className="tw-w-full tw-h-40 tw-cursor-crosshair tw-mb-2 tw-relative tw-border tw-border-gray-300 tw-rounded"
            style={{ 
              backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
              backgroundImage: `
                linear-gradient(to top, #000, transparent),
                linear-gradient(to right, #fff, transparent)
              `
            }}
            onMouseDown={handleMouseDown(handleColorBoxPick)}
          >
            {/* Selection point */}
            <div 
              className="tw-absolute tw-w-4 tw-h-4 tw-border-2 tw-border-white tw-rounded-full tw-transform tw--translate-x-1/2 tw--translate-y-1/2 tw-pointer-events-none tw-shadow-md"
              style={{ 
                left: `${hsv.s}%`, 
                top: `${100 - hsv.v}%`,
                backgroundColor: selectedColor
              }}
            />
          </div>
          
          {/* Hue slider */}
          <div 
            ref={hueSliderRef}
            className="tw-w-full tw-h-6 tw-cursor-crosshair tw-mb-4 tw-relative tw-border tw-border-gray-300 tw-rounded"
            style={{ 
              background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
            }}
            onMouseDown={handleMouseDown(handleHueSliderPick)}
          >
            {/* Hue slider marker */}
            <div 
              className="tw-absolute tw-h-full tw-w-1 tw-border tw-border-white tw-pointer-events-none tw-transform tw--translate-x-1/2"
              style={{ left: `${hsv.h / 360 * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Color format tabs */}
      <div className="tw-flex tw-mb-2 tw-border-b tw-border-gray-300">
        <button 
          className={`tw-px-3 tw-py-1 tw-mr-2 ${displayMode === 'hex' ? 'tw-bg-purple-100 tw-border-b-2 tw-border-purple-500' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDisplayMode('hex');
          }}
        >
          HEX
        </button>
        <button 
          className={`tw-px-3 tw-py-1 tw-mr-2 ${displayMode === 'rgb' ? 'tw-bg-purple-100 tw-border-b-2 tw-border-purple-500' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDisplayMode('rgb');
          }}
        >
          RGB
        </button>
        <button 
          className={`tw-px-3 tw-py-1 ${displayMode === 'cmyk' ? 'tw-bg-purple-100 tw-border-b-2 tw-border-purple-500' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDisplayMode('cmyk');
          }}
        >
          CMYK
        </button>
      </div>
      
      {/* Color input fields based on mode */}
      <div className="tw-mb-4">
        {displayMode === 'hex' && (
          <div className="tw-flex tw-items-center">
            <label className="tw-w-10">Hex:</label>
            <input 
              type="text"
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              onKeyDown={(e) => handleInputKeyDown(e, handleHexChange, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="tw-flex-1 tw-p-1 tw-border tw-border-gray-300 tw-rounded"
            />
          </div>
        )}
        
        {displayMode === 'rgb' && (
          <div className="tw-space-y-2">
            <div className="tw-flex tw-items-center">
              <label className="tw-w-10">R:</label>
              <input 
                type="number"
                min="0"
                max="255"
                value={rgb.r}
                onChange={(e) => handleRgbChange('r', e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(e, () => handleRgbChange('r', e.target.value), e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="tw-flex-1 tw-p-1 tw-border tw-border-gray-300 tw-rounded"
              />
            </div>
            <div className="tw-flex tw-items-center">
              <label className="tw-w-10">G:</label>
              <input 
                type="number"
                min="0"
                max="255"
                value={rgb.g}
                onChange={(e) => handleRgbChange('g', e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(e, () => handleRgbChange('g', e.target.value), e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="tw-flex-1 tw-p-1 tw-border tw-border-gray-300 tw-rounded"
              />
            </div>
            <div className="tw-flex tw-items-center">
              <label className="tw-w-10">B:</label>
              <input 
                type="number"
                min="0"
                max="255"
                value={rgb.b}
                onChange={(e) => handleRgbChange('b', e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(e, () => handleRgbChange('b', e.target.value), e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="tw-flex-1 tw-p-1 tw-border tw-border-gray-300 tw-rounded"
              />
            </div>
          </div>
        )}
        
        {displayMode === 'cmyk' && (
          <div className="tw-space-y-2">
            <div className="tw-flex tw-items-center">
              <label className="tw-w-10">C:</label>
              <input 
                type="number"
                min="0"
                max="100"
                value={cmyk.c}
                onChange={(e) => handleCmykChange('c', e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(e, () => handleCmykChange('c', e.target.value), e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="tw-flex-1 tw-p-1 tw-border tw-border-gray-300 tw-rounded"
              />
              <span className="tw-ml-1">%</span>
            </div>
            <div className="tw-flex tw-items-center">
              <label className="tw-w-10">M:</label>
              <input 
                type="number"
                min="0"
                max="100"
                value={cmyk.m}
                onChange={(e) => handleCmykChange('m', e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(e, () => handleCmykChange('m', e.target.value), e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="tw-flex-1 tw-p-1 tw-border tw-border-gray-300 tw-rounded"
              />
              <span className="tw-ml-1">%</span>
            </div>
            <div className="tw-flex tw-items-center">
              <label className="tw-w-10">Y:</label>
              <input 
                type="number"
                min="0"
                max="100"
                value={cmyk.y}
                onChange={(e) => handleCmykChange('y', e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(e, () => handleCmykChange('y', e.target.value), e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="tw-flex-1 tw-p-1 tw-border tw-border-gray-300 tw-rounded"
              />
              <span className="tw-ml-1">%</span>
            </div>
            <div className="tw-flex tw-items-center">
              <label className="tw-w-10">K:</label>
              <input 
                type="number"
                min="0"
                max="100"
                value={cmyk.k}
                onChange={(e) => handleCmykChange('k', e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(e, () => handleCmykChange('k', e.target.value), e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="tw-flex-1 tw-p-1 tw-border tw-border-gray-300 tw-rounded"
              />
              <span className="tw-ml-1">%</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="tw-flex tw-justify-end tw-gap-2">
        <button 
          className="tw-px-3 tw-py-1 tw-bg-gray-200 tw-text-gray-700 tw-rounded"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
        >
          Cancel
        </button>
        <button 
          className="tw-px-3 tw-py-1 tw-bg-purple-600 tw-text-white tw-rounded"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleApplyColor(e);
          }}
        >
          Apply
        </button>
      </div>
      
      {/* Help text */}
      <div className="tw-mt-2 tw-text-xs tw-text-gray-500 tw-text-center">
        Press Enter to apply, ESC to close, or click outside this panel
      </div>
    </div>
  );
};

// Text Color Button Component
export const TextColorButton = ({ onClick, currentColor = '#000000', className = '' }) => {
  return (
    <button 
      className={`tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-flex tw-items-center tw-gap-1 ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
      onMouseDown={(e) => e.preventDefault()}
      title="Text Color (Ctrl+Shift+F)"
    >
      <div className="tw-relative">
        <div className="tw-text-xs tw-font-bold">A</div>
        <div 
          className="tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-h-1 tw-rounded-sm" 
          style={{ backgroundColor: currentColor }}
        />
      </div>
    </button>
  );
};

// Background Color Button Component
export const BackgroundColorButton = ({ onClick, currentColor = '#ffffff', className = '' }) => {
  return (
    <button 
      className={`tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-flex tw-items-center tw-gap-1 ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
      onMouseDown={(e) => e.preventDefault()}
      title="Background Color (Ctrl+Shift+H)"
    >
      <div className="tw-relative">
        <div 
          className="tw-w-4 tw-h-4 tw-border tw-border-gray-400 tw-rounded-sm tw-flex tw-items-center tw-justify-center tw-text-xs tw-font-bold" 
          style={{ backgroundColor: currentColor }}
        >
          <span className="tw-text-gray-700" style={{ textShadow: '0 0 2px rgba(255,255,255,0.8)' }}>
            H
          </span>
        </div>
      </div>
    </button>
  );
};

// Helper function to handle text color application
export const applyTextColor = (color, editorRef, handleChange) => {
  try {
    if (window.getSelection().toString() === '') {
      const selection = window.getSelection();
      const range = document.createRange();
      
      if (editorRef.current.childNodes.length === 0) {
        const textNode = document.createTextNode('\u200B');
        editorRef.current.appendChild(textNode);
        range.setStart(textNode, 0);
        range.setEnd(textNode, 0);
      } else {
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
      }
      
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    document.execCommand('foreColor', false, color);
    if (handleChange) handleChange();
  } catch (error) {
    console.error('Error applying text color:', error);
  }
};

// Helper function to handle background color application
export const applyBackgroundColor = (color, editorRef, handleChange) => {
  try {
    if (window.getSelection().toString() === '') {
      const selection = window.getSelection();
      const range = document.createRange();
      
      if (editorRef.current.childNodes.length === 0) {
        const textNode = document.createTextNode('\u200B');
        editorRef.current.appendChild(textNode);
        range.setStart(textNode, 0);
        range.setEnd(textNode, 0);
      } else {
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
      }
      
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    document.execCommand('hiliteColor', false, color);  
    if (handleChange) handleChange();
  } catch (error) {
    console.error('Error applying background color:', error);
  }
};

// Default export for the picker
export default ColorPicker;