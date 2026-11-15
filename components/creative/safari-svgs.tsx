"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SvgProps {
  className?: string;
}

/**
 * 1. Kilimanjaro Tri-Peak Azimuth Compass
 * Rotating survey bezel + oscillating magnetic needle + pulsing Uhuru beacon.
 */
export function KilimanjaroCompassSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={cn("safari-svg text-primary", className)}
      aria-hidden="true"
    >
      {/* Outer degree ring */}
      <g className="svg-spin-slow" style={{ transformOrigin: "60px 60px" }}>
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="3 5"
          opacity="0.45"
        />
        <path
          d="M60 6V13 M60 107V114 M6 60H13 M107 60H114"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M22 22L26 26 M98 22L94 26 M22 98L26 94 M98 98L94 94"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>

      {/* Inner horizon circle */}
      <circle cx="60" cy="60" r="36" stroke="currentColor" strokeWidth="1.4" opacity="0.25" />

      {/* Kilimanjaro Shira / Kibo / Mawenzi silhouette */}
      <path
        d="M26 73 L43 54 L51 60 L60 40 L71 58 L79 48 L94 73 Z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      {/* Glacial snow cap */}
      <path
        d="M54 51 L60 40 L67 51 L63 53 L60 49 L57 53 Z"
        fill="#e5a853"
        opacity="0.9"
      />

      {/* Oscillating compass needle */}
      <g className="svg-needle" style={{ transformOrigin: "60px 60px" }}>
        <polygon points="60,24 63.5,58 56.5,58" fill="#e5a853" />
        <polygon points="60,96 63.5,62 56.5,62" fill="currentColor" opacity="0.3" />
      </g>

      {/* Uhuru Summit Pulse */}
      <circle cx="60" cy="40" r="3.5" fill="#e5a853">
        <animate attributeName="r" values="2.5;6;2.5" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.95;0.2;0.95" dur="2.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/**
 * 2. Extended 4x4 Land Cruiser Expedition Wheel
 * Spools up on card hover via --svg-dur CSS variable.
 */
export function SafariCruiserWheelSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={cn("safari-svg text-primary", className)}
      aria-hidden="true"
    >
      {/* Ground dust streak */}
      <line
        x1="14"
        y1="106"
        x2="106"
        y2="106"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="6 6"
        opacity="0.35"
      />

      {/* Spinning tire & lugs */}
      <g className="svg-wheel" style={{ transformOrigin: "60px 58px" }}>
        <circle
          cx="60"
          cy="58"
          r="42"
          stroke="currentColor"
          strokeWidth="6"
          strokeDasharray="9 4.2"
          opacity="0.88"
        />
        <circle cx="60" cy="58" r="36" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
        <circle
          cx="60"
          cy="58"
          r="26"
          fill="currentColor"
          fillOpacity="0.08"
          stroke="currentColor"
          strokeWidth="1.8"
        />

        {/* 6 rugged off-road spokes */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <g key={deg} transform={`rotate(${deg} 60 58)`}>
            <path
              d="M60 32 L63 49 L57 49 Z"
              fill="currentColor"
              opacity="0.72"
            />
            <circle cx="60" cy="50" r="1.8" fill="#e5a853" />
          </g>
        ))}

        {/* Locking hub */}
        <circle cx="60" cy="58" r="7" fill="currentColor" />
        <circle cx="60" cy="58" r="3" fill="#e5a853" />
      </g>
    </svg>
  );
}

/**
 * 3. Serengeti Great Migration Flow Arc
 * Animated SMIL herd dots flowing along the Grumeti → Mara River curve.
 */
export function MigrationArcSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={cn("safari-svg text-primary", className)}
      aria-hidden="true"
    >
      {/* Topographic contour rings */}
      <ellipse cx="60" cy="60" rx="50" ry="34" stroke="currentColor" strokeWidth="1" opacity="0.18" />
      <ellipse cx="60" cy="60" rx="35" ry="22" stroke="currentColor" strokeWidth="1" opacity="0.22" />

      {/* Mara & Grumeti river ribbons */}
      <path
        d="M14 44 Q42 28, 60 44 T106 40"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.3"
        strokeLinecap="round"
      />
      <path
        d="M14 78 Q46 92, 68 74 T106 82"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.3"
        strokeLinecap="round"
      />

      {/* Migration Loop Path */}
      <path
        id="migrationLoopPath"
        d="M24 72 C24 38, 64 26, 88 44 C104 56, 94 92, 58 92 C34 92, 24 84, 24 72 Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeDasharray="4 4"
        opacity="0.75"
      />

      {/* Camp / Crossing nodes */}
      <circle cx="24" cy="72" r="4" fill="currentColor" />
      <circle cx="88" cy="44" r="4" fill="#e5a853" />
      <circle cx="58" cy="92" r="4" fill="currentColor" />

      {/* Animated SMIL herd couriers */}
      {[0, -1.6, -3.2].map((begin, idx) => (
        <circle key={idx} r={idx === 0 ? 4.2 : 3} fill="#e5a853">
          <animateMotion
            dur="4.8s"
            begin={`${begin}s`}
            repeatCount="indefinite"
            path="M24 72 C24 38, 64 26, 88 44 C104 56, 94 92, 58 92 C34 92, 24 84, 24 72 Z"
          />
        </circle>
      ))}
    </svg>
  );
}

/**
 * 4. High-Altitude Pulse Oximeter & SpO2 Telemetry (KPAP Safety)
 */
export function PulseOximeterSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={cn("safari-svg text-primary", className)}
      aria-hidden="true"
    >
      {/* Monitor frame */}
      <rect
        x="14"
        y="24"
        width="92"
        height="72"
        rx="14"
        fill="currentColor"
        fillOpacity="0.06"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      {/* Grid lines */}
      <line x1="22" y1="45" x2="98" y2="45" stroke="currentColor" strokeOpacity="0.12" />
      <line x1="22" y1="75" x2="98" y2="75" stroke="currentColor" strokeOpacity="0.12" />

      {/* Animated ECG / SpO2 pulse trace */}
      <path
        d="M22 62 H40 L46 42 L53 80 L61 36 L68 70 L74 62 H98"
        stroke="#e5a853"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="140"
        strokeDashoffset="140"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="140;0;0;-140"
          keyTimes="0;0.45;0.75;1"
          dur="2.8s"
          repeatCount="indefinite"
        />
      </path>

      {/* Status text */}
      <text x="24" y="38" className="fill-current font-mono text-[8px] font-semibold" opacity="0.8">
        SpO2 · BARAFU 4,673M
      </text>
      <circle cx="94" cy="35" r="3" fill="#62b388">
        <animate attributeName="opacity" values="1;0.25;1" dur="1.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/**
 * 5. Swarovski Optics & Wildlife Binoculars
 */
export function OpticsBinocularsSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={cn("safari-svg text-primary", className)}
      aria-hidden="true"
    >
      {/* Left & right optical barrels */}
      <circle cx="38" cy="66" r="24" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2" />
      <circle cx="82" cy="66" r="24" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2" />

      {/* Bridge */}
      <rect x="52" y="42" width="16" height="10" rx="3" fill="currentColor" opacity="0.85" />
      <circle cx="60" cy="47" r="2.5" fill="#e5a853" />

      {/* Focus rings */}
      <g className="svg-optic-ring" style={{ transformOrigin: "38px 66px" }}>
        <circle cx="38" cy="66" r="17" stroke="currentColor" strokeWidth="1.4" strokeDasharray="5 3" opacity="0.7" />
      </g>
      <g className="svg-optic-ring-rev" style={{ transformOrigin: "82px 66px" }}>
        <circle cx="82" cy="66" r="17" stroke="currentColor" strokeWidth="1.4" strokeDasharray="5 3" opacity="0.7" />
      </g>

      {/* Lion / Savannah horizon reflection inside lenses */}
      <path d="M26 70 Q38 61 50 70" stroke="#e5a853" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M70 70 Q82 61 94 70" stroke="#e5a853" strokeWidth="1.8" strokeLinecap="round" />

      {/* Shimmer flare */}
      <path d="M30 56 L36 52 M74 56 L80 52" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
        <animate attributeName="opacity" values="0.25;0.95;0.25" dur="3s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

/**
 * 6. Zanzibar Ngalawa Dhow Sail & Indian Ocean Waves
 */
export function ZanzibarDhowSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={cn("safari-svg text-primary", className)}
      aria-hidden="true"
    >
      {/* Sun disc */}
      <circle cx="86" cy="32" r="11" fill="#e5a853" opacity="0.85" />

      {/* Rocking Dhow Boat */}
      <g className="svg-rock" style={{ transformOrigin: "60px 80px" }}>
        {/* Mast */}
        <line x1="56" y1="24" x2="56" y2="78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Lateen triangular sail */}
        <path
          d="M56 26 C72 44, 78 58, 76 70 L32 64 C40 48, 48 36, 56 26 Z"
          fill="currentColor"
          fillOpacity="0.16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Wooden Hull */}
        <path
          d="M26 78 H92 L82 90 H36 Z"
          fill="currentColor"
          opacity="0.85"
        />
      </g>

      {/* Oscillating Indian Ocean waves */}
      <path
        d="M12 96 Q28 90, 44 96 T76 96 T108 96"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.75"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="-4 0;4 0;-4 0"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M18 104 Q34 99, 50 104 T82 104 T106 104"
        stroke="#e5a853"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.7"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="4 0;-4 0;4 0"
          dur="3.4s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
