
import React from 'react';

export const CustomBar = (props: any) => {
  const { x, y, width, height, isCurrent, isFuture, fill, dataKey, payload, ...rest } = props;
  
  // Different styling for future months (empty state)
  if (isFuture) {
    return (
      <g>
        <defs>
          <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
            <path d="M -1,1 l 2,-2
                   M 0,4 l 4,-4
                   M 3,5 l 2,-2" 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect 
          x={x} 
          y={y} 
          width={width} 
          height={height} 
          fill="url(#diagonalHatch)"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth={1}
          rx={4}
          ry={4}
          {...rest}
        />
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="rgba(255, 255, 255, 0.03)"
          rx={4}
          ry={4}
        />
        <rect
          x={x}
          y={y + height - 2}
          width={width}
          height={2}
          fill="rgba(255, 255, 255, 0.08)"
          rx={1}
        />
        <text
          x={x + width / 2}
          y={y + height / 2 + 5}
          textAnchor="middle"
          fill="rgba(255, 255, 255, 0.5)"
          fontSize="9"
          fontWeight="500"
          letterSpacing="0.5"
        >
          FUTURE
        </text>
      </g>
    );
  }
  
  // Different styling based on whether it's the current period
  if (isCurrent) {
    // For current period, use a gradient and special styling
    const gradientId = `currentPeriodGradient-${dataKey}`;
    const baseColor = fill;
    const lighterColor = (() => {
      // Create a lighter version of the base color for the gradient
      if (baseColor === '#3399FF') return '#66BBFF'; // For total flights
      if (baseColor === '#1EAE6D') return '#25D684'; // For successful
      if (baseColor === '#F8473A') return '#FF5F52'; // For failed 
      if (baseColor === '#FDB022') return '#FFCC44'; // For aborted
      return baseColor; // Fallback
    })();
    
    // Get the glow color that matches the bar's color instead of using purple
    const getGlowColor = () => {
      if (baseColor === '#3399FF') return 'rgba(51, 153, 255, 0.6)'; // Blue for total
      if (baseColor === '#1EAE6D') return 'rgba(30, 174, 109, 0.6)'; // Green for success
      if (baseColor === '#F8473A') return 'rgba(248, 71, 58, 0.6)'; // Red for failed
      if (baseColor === '#FDB022') return 'rgba(253, 176, 34, 0.6)'; // Yellow/orange for error
      return 'rgba(255, 255, 255, 0.6)'; // Default white glow
    };
    
    const glowColor = getGlowColor();
    
    // Only show the CURRENT label for the first item in a stack
    // This fixes the issue with multiple CURRENT labels
    const shouldShowCurrentLabel = dataKey === 'flights' || 
      (payload && payload.isFirstInStack === true);
    
    return (
      <g>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lighterColor} />
            <stop offset="100%" stopColor={baseColor} />
          </linearGradient>
          {/* Add outer glow filter with the color matching the bar */}
          <filter id={`glow-${dataKey}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor={baseColor} floodOpacity="0.5" result="color" />
            <feComposite operator="in" in="color" in2="blur" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Bar with gradient fill and glow effect */}
        <rect 
          x={x} 
          y={y} 
          width={width} 
          height={height} 
          fill={`url(#${gradientId})`}
          stroke="#ffffff"
          strokeWidth={2}
          strokeOpacity={0.5}
          rx={4}
          ry={4}
          filter={`url(#glow-${dataKey})`}
          className="drop-shadow-lg"
          {...rest}
        />
        {/* Highlight indicator at bottom */}
        <rect
          x={x}
          y={y + height - 4}
          width={width}
          height={4}
          fill={baseColor}
          rx={2}
          className="animate-pulse"
          style={{ filter: `drop-shadow(0 0 5px ${glowColor})` }}
        />
        {/* Star/highlight at top - Only show for the first bar in stack */}
        {shouldShowCurrentLabel && (
          <circle
            cx={x + width / 2}
            cy={y - 5}
            r={4}
            fill={baseColor}
            className="animate-pulse"
            style={{ filter: `drop-shadow(0 0 3px ${glowColor})` }}
          />
        )}
        {/* "Current" label on top - Only show for the first bar in stack */}
        {shouldShowCurrentLabel && (
          <text
            x={x + width / 2}
            y={y - 12}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="bold"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))' }}
          >
            CURRENT
          </text>
        )}
      </g>
    );
  }
  
  // Regular bar for non-current periods
  return (
    <rect 
      x={x} 
      y={y} 
      width={width} 
      height={height} 
      fill={fill}
      rx={4}
      ry={4}
      {...rest}
    />
  );
};
