"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SvgProps {
  className?: string;
}

/**
 * 1. Kilimanjaro Tri-Peak Azimuth Compass
 * Multi-ring topographic degree dial, rotating reticle, Shira/Kibo/Mawenzi profile,
 * oscillating magnetic pointer, and Uhuru Summit beacon pulse.
 */
export function KilimanjaroCompassSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 140 140"
      fill="none"
      className={cn("safari-svg text-primary", className)}
      aria-hidden="true"
    >
      {/* Subtle topographic radar rings */}
      <circle cx="70" cy="48" r="14" stroke="#e5a853" strokeWidth="1" opacity="0.25">
        <animate attributeName="r" values="6;28" dur="3.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.65;0" dur="3.2s" repeatCount="indefinite" />
      </circle>

      {/* Outer rotating azimuth degree ring */}
      <g className="svg-spin-slow" style={{ transformOrigin: "70px 70px" }}>
        <circle
          cx="70"
          cy="70"
          r="58"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="3 5"
          opacity="0.45"
        />
        <circle
          cx="70"
          cy="70"
          r="50"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeDasharray="1 7"
          opacity="0.35"
        />
        {/* Cardinal ticks */}
        <path
          d="M70 7V15 M70 125V133 M7 70H15 M125 70H133"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M25 25L31 31 M115 25L109 31 M25 115L31 109 M115 115L109 109"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>

      {/* Inner horizon frame */}
      <circle
        cx="70"
        cy="70"
        r="41"
        fill="currentColor"
        fillOpacity="0.04"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeOpacity="0.28"
      />

      {/* Kilimanjaro Shira / Kibo / Mawenzi silhouette */}
      <path
        className="svg-draw-path"
        d="M32 86 L49 65 L58 72 L70 46 L83 68 L93 56 L108 86 Z"
        fill="currentColor"
        fillOpacity="0.14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Glacial ice dome */}
      <path
        d="M62 59 L70 46 L79 59 L74 62 L70 57 L66 62 Z"
        fill="#e5a853"
        opacity="0.95"
      />

      {/* Oscillating compass needle */}
      <g className="svg-needle" style={{ transformOrigin: "70px 70px" }}>
        <polygon points="70,22 74,67 66,67" fill="#e5a853" />
        <polygon points="70,118 74,73 66,73" fill="currentColor" opacity="0.28" />
        <circle cx="70" cy="70" r="4" fill="currentColor" />
      </g>

      {/* Elevation tag */}
      <text
        x="70"
        y="102"
        textAnchor="middle"
        className="fill-current font-mono text-[7.5px] font-semibold"
        opacity="0.85"
      >
        5,895M UHURU
      </text>

      {/* Uhuru Summit Glow */}
      <circle cx="70" cy="46" r="3.5" fill="#e5a853">
        <animate attributeName="r" values="2.5;5.5;2.5" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.3;1" dur="2.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/**
 * 2. Extended 4x4 Land Cruiser Wheel + Coil Suspension Damper
 * Tire spools faster on hover/active while coil suspension compresses gently & dust streaks drift.
 */
export function SafariCruiserWheelSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 140 140"
      fill="none"
      className={cn("safari-svg text-primary", className)}
      aria-hidden="true"
    >
      {/* Suspension arch & shock coil above wheel */}
      <path
        d="M22 44 Q70 20 118 44"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.28"
        strokeLinecap="round"
      />
      <path
        className="svg-draw-path"
        d="M70 18 L70 26 L75 29 L65 33 L75 37 L65 41 L70 44"
        stroke="#e5a853"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dust streaks */}
      <line
        x1="14"
        y1="122"
        x2="126"
        y2="122"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="8 6"
        opacity="0.4"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;28"
          dur="1.6s"
          repeatCount="indefinite"
        />
      </line>

      {/* Spinning all-terrain wheel */}
      <g className="svg-wheel" style={{ transformOrigin: "70px 76px" }}>
        <circle
          cx="70"
          cy="76"
          r="42"
          stroke="currentColor"
          strokeWidth="7"
          strokeDasharray="9.5 4.2"
          opacity="0.9"
        />
        <circle cx="70" cy="76" r="35.5" stroke="currentColor" strokeWidth="1.5" opacity="0.42" />
        <circle
          cx="70"
          cy="76"
          r="26"
          fill="currentColor"
          fillOpacity="0.08"
          stroke="currentColor"
          strokeWidth="1.8"
        />

        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <g key={deg} transform={`rotate(${deg} 70 76)`}>
            <path d="M70 50 L73.5 66 L66.5 66 Z" fill="currentColor" opacity="0.75" />
            <circle cx="70" cy="68" r="2" fill="#e5a853" />
          </g>
        ))}

        {/* Free-wheel locking hub */}
        <circle cx="70" cy="76" r="8" fill="currentColor" />
        <circle cx="70" cy="76" r="3.4" fill="#e5a853" />
      </g>
    </svg>
  );
}

/**
 * 3. Serengeti Great Migration Trajectory Map
 * Multi-contour Rift Valley basin with 4 SMIL herd dots flowing across river crossings.
 */
export function MigrationArcSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 140 140"
      fill="none"
      className={cn("safari-svg text-primary", className)}
      aria-hidden="true"
    >
      {/* Topographic terrain rings */}
      <ellipse cx="70" cy="70" rx="58" ry="40" stroke="currentColor" strokeWidth="1" opacity="0.16" />
      <ellipse cx="70" cy="70" rx="43" ry="29" stroke="currentColor" strokeWidth="1" opacity="0.22" />
      <ellipse cx="70" cy="70" rx="26" ry="17" stroke="currentColor" strokeWidth="1" opacity="0.16" />

      {/* Mara & Grumeti river ribbons */}
      <path
        className="svg-draw-path"
        d="M16 48 Q50 30, 72 48 T124 44"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeOpacity="0.32"
        strokeLinecap="round"
      />
      <path
        className="svg-draw-path"
        d="M16 92 Q52 108, 78 88 T124 96"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeOpacity="0.32"
        strokeLinecap="round"
      />

      {/* Migration Loop Trail */}
      <path
        className="svg-draw-path"
        d="M28 84 C28 42, 74 26, 104 48 C122 62, 110 108, 66 108 C40 108, 28 96, 28 84 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="5 4"
        opacity="0.82"
      />

      {/* Key staging points */}
      <circle cx="28" cy="84" r="4.5" fill="currentColor" />
      <circle cx="104" cy="48" r="5" fill="#e5a853" />
      <circle cx="66" cy="108" r="4.5" fill="currentColor" />
      <text x="104" y="38" textAnchor="middle" className="fill-current font-mono text-[7px]" opacity="0.8">
        MARA
      </text>
      <text x="66" y="122" textAnchor="middle" className="fill-current font-mono text-[7px]" opacity="0.8">
        NDUTU
      </text>

      {/* Synchronized SMIL Migration Caravan */}
      {[0, -1.2, -2.4, -3.6].map((begin, idx) => (
        <circle key={idx} r={idx === 0 ? 4.5 : 3.2} fill="#e5a853">
          <animateMotion
            dur="4.8s"
            begin={`${begin}s`}
            repeatCount="indefinite"
            path="M28 84 C28 42, 74 26, 104 48 C122 62, 110 108, 66 108 C40 108, 28 96, 28 84 Z"
          />
        </circle>
      ))}
    </svg>
  );
}

/**
 * 4. High-Altitude Pulse Oximeter & SpO2 Telemetry
 * Animated waveform + expanding lung barometer + Barafu Camp altitude check.
 */
export function PulseOximeterSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 140 140"
      fill="none"
      className={cn("safari-svg text-primary", className)}
      aria-hidden="true"
    >
      {/* Instrument shell */}
      <rect
        x="16"
        y="28"
        width="108"
        height="84"
        rx="16"
        fill="currentColor"
        fillOpacity="0.06"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      {/* Subtle grid */}
      <line x1="25" y1="54" x2="115" y2="54" stroke="currentColor" strokeOpacity="0.12" />
      <line x1="25" y1="74" x2="115" y2="74" stroke="currentColor" strokeOpacity="0.12" />
      <line x1="25" y1="94" x2="115" y2="94" stroke="currentColor" strokeOpacity="0.12" />

      {/* Live EKG / Oximetry Waveform */}
      <path
        d="M25 74 H44 L51 52 L59 96 L68 44 L76 82 L83 74 H115"
        stroke="#e5a853"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="160"
        strokeDashoffset="160"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="160;0;0;-160"
          keyTimes="0;0.45;0.78;1"
          dur="2.6s"
          repeatCount="indefinite"
        />
      </path>

      {/* Header telemetry */}
      <text x="26" y="44" className="fill-current font-mono text-[8px] font-semibold" opacity="0.88">
        SpO2 94% · 4,673M
      </text>
      <text x="26" y="104" className="fill-current font-mono text-[7px]" opacity="0.65">
        KPAP MEDICAL LOG · AM/PM
      </text>

      {/* Breathing status indicator */}
      <circle cx="109" cy="41" r="3.5" fill="#62b388">
        <animate attributeName="r" values="2.5;4.5;2.5" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.35;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/**
 * 5. Swarovski Twin-Barrel Safari Binoculars
 * Dual rotating focus bezels, acacia & horizon silhouette inside optics, sweeping glass glint.
 */
export function OpticsBinocularsSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 140 140"
      fill="none"
      className={cn("safari-svg text-primary", className)}
      aria-hidden="true"
    >
      {/* Bridge & focus wheel */}
      <rect x="60" y="42" width="20" height="14" rx="4" fill="currentColor" opacity="0.85" />
      <circle cx="70" cy="49" r="3" fill="#e5a853" />

      {/* Optical Barrels */}
      <circle
        cx="43"
        cy="78"
        r="29"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth="2.1"
      />
      <circle
        cx="97"
        cy="78"
        r="29"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth="2.1"
      />

      {/* Counter-rotating focus rings */}
      <g className="svg-optic-ring" style={{ transformOrigin: "43px 78px" }}>
        <circle
          cx="43"
          cy="78"
          r="21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="6 3.5"
          opacity="0.72"
        />
      </g>
      <g className="svg-optic-ring-rev" style={{ transformOrigin: "97px 78px" }}>
        <circle
          cx="97"
          cy="78"
          r="21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="6 3.5"
          opacity="0.72"
        />
      </g>

      {/* Serengeti horizon & acacia silhouette inside lenses */}
      <path d="M27 84 Q43 72 59 84" stroke="#e5a853" strokeWidth="2" strokeLinecap="round" />
      <path d="M81 84 Q97 72 113 84" stroke="#e5a853" strokeWidth="2" strokeLinecap="round" />
      <path d="M43 80 V71 M36 71 H50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M97 80 V71 M90 71 H104" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* Glass lens glint */}
      <path d="M33 65 L40 59 M87 65 L94 59" stroke="white" strokeWidth="1.8" strokeLinecap="round">
        <animate attributeName="opacity" values="0.2;0.95;0.2" dur="2.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

/**
 * 6. Zanzibar Ngalawa Dhow & Coral Reef Ripples
 * Tilting traditional dhow sail beneath golden coastal sun and opposing wave swells.
 */
export function ZanzibarDhowSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 140 140"
      fill="none"
      className={cn("safari-svg text-primary", className)}
      aria-hidden="true"
    >
      {/* Equatorial Sun Glow */}
      <circle cx="100" cy="36" r="14" fill="#e5a853" opacity="0.25">
        <animate attributeName="r" values="12;17;12" dur="3.6s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="36" r="10" fill="#e5a853" opacity="0.9" />

      {/* Gently rocking wooden dhow */}
      <g className="svg-rock" style={{ transformOrigin: "70px 92px" }}>
        <line x1="66" y1="26" x2="66" y2="90" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        {/* Billowing Lateen Sail */}
        <path
          className="svg-draw-path"
          d="M66 28 C88 48, 94 64, 90 80 L36 73 C46 54, 56 40, 66 28 Z"
          fill="currentColor"
          fillOpacity="0.16"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        {/* Wooden Hull */}
        <path d="M30 90 H108 L96 104 H42 Z" fill="currentColor" opacity="0.88" />
      </g>

      {/* Dual undulating ocean waves */}
      <path
        d="M14 111 Q34 104, 54 111 T94 111 T132 111"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        opacity="0.78"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="-5 0;5 0;-5 0"
          dur="4.2s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M18 121 Q38 115, 58 121 T98 121 T128 121"
        stroke="#e5a853"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.72"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="5 0;-5 0;5 0"
          dur="3.4s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
