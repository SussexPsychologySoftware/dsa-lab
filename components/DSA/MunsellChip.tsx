import React, { useMemo } from 'react';
import { ColorValue, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface MunsellChipProps {
    color: ColorValue;
    height?: number; // Dimensions of the rectangular body
    width?: number;
    style?: ViewStyle;
}

export default function MunsellChip({
                                        color,
                                        height = 120,
                                        width = 100,
                                        style
                                    }: MunsellChipProps) {

    // Ratios
    const TAB_WIDTH_RATIO = 0.6;
    const TAB_HEIGHT_RATIO = .5;
    const RADIUS_RATIO = 100;

    // Calculate dimensions
    const tabWidth = width * TAB_WIDTH_RATIO;
    const tabHeight = height * TAB_HEIGHT_RATIO;
    const cornerRadius = width * RADIUS_RATIO;

    // Safety clamp: prevent radius from overlapping if chip is very small
    const r = Math.min(cornerRadius, tabWidth/2, tabHeight/2, (width-tabWidth)/4);
    const w = width;
    const h = height;

    // Total SVG Size
    const totalHeight = h + tabHeight;
    const totalWidth = w;

    const pathData = useMemo(() => {
        const tabLeft = (w - tabWidth) / 2;
        const tabRight = tabLeft + tabWidth;
        return `
            M 0,${r}
            
            // Top-Left Corner & Edge
            A ${r},${r} 0 0 1 ${r},0
            L ${w - r},0
            
            // Top-Right Corner & Edge
            A ${r},${r} 0 0 1 ${w},${r}
            L ${w},${h - r}
            
            // Bottom-Right Body Corner
            A ${r},${r} 0 0 1 ${w - r},${h}
            
            // Bottom Edge -> RIGHT FILLET (The smooth join)
            // Stop 'r' distance before the tab to leave room for the curve
            L ${tabRight + r},${h}
            // Arc curves DOWN and LEFT into the tab (Counter-Clockwise)
            A ${r},${r} 0 0 0 ${tabRight},${h + r}
            
            // Tab Right Edge
            L ${tabRight},${h + tabHeight - r}
            
            // Tab Bottom-Right Corner
            A ${r},${r} 0 0 1 ${tabRight - r},${h + tabHeight}
            
            // Tab Bottom Edge
            L ${tabLeft + r},${h + tabHeight}
            
            // Tab Bottom-Left Corner
            A ${r},${r} 0 0 1 ${tabLeft},${h + tabHeight - r}
            
            // Tab Left Edge -> LEFT FILLET
            // Stop 'r' distance before the body to leave room for the curve
            L ${tabLeft},${h + r}
            // Arc curves UP and LEFT out to the body (Counter-Clockwise)
            A ${r},${r} 0 0 0 ${tabLeft - r},${h}
            
            // Bottom Edge to start
            L ${r},${h}
            
            // Bottom-Left Body Corner
            A ${r},${r} 0 0 1 0,${h - r}
            
            Z
        `.replace(/\/\/.*$/gm, ''); // Regex strip comments
    }, [w, h, tabWidth, tabHeight, r]);

    return (
        <Svg
            width={totalWidth}
            height={totalHeight}
            viewBox={`0 0 ${totalWidth} ${totalHeight}`}
            style={style}
        >
            <Path
                d={pathData}
                fill={color}
                stroke="none"
            />
        </Svg>
    );
}
