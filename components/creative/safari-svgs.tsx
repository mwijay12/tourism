"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SvgProps {
  className?: string;
}

/**
 * 01 / ALTITUDE — Kilimanjaro Elevation & Azimuth Compass Blueprint
 * Pure Motion Lab stroke drawing (360×260) driven by GSAP DrawSVGPlugin + MotionPathPlugin.
 */
export function KilimanjaroCompassSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 360 260"
      className={cn("ml-art", className)}
      aria-hidden="true"
      focusable="false"
      data-draw
      data-draw-step="0.05"
    >
      {/* Blueprint card frame */}
      <rect x="20" y="20" width="320" height="220" rx="14" />
      <path className="f" d="M20 58h320" />
      <path d="M40 39h84" strokeWidth="2" />
      <text x="316" y="42" textAnchor="end" data-fade>
        3°04′S · 37°21′E
      </text>

      {/* Left: Kilimanjaro Elevation Contours & Lemosho Ascent */}
      <path className="f" d="M36 96h142M36 138h142M36 180h142" />
      <text x="38" y="91" data-fade>
        5,895M
      </text>
      <text x="38" y="133" data-fade>
        3,850M
      </text>
      <path
        d="M36 206 L64 166 L82 174 L112 102 L138 148 L156 124 L178 206"
        strokeWidth="1.5"
      />
      <path className="a" d="M98 134 L112 102 L126 130 L119 134 L112 126 L105 134 Z" />
      <path
        id="ml-kili-route"
        className="a"
        d="M42 204 Q68 184, 82 174 T112 102"
        strokeDasharray="3 4"
      />
      <circle className="dot" cx="112" cy="102" r="4" data-pop />
      <circle
        className="dot-p"
        cx="42"
        cy="204"
        r="4"
        data-travel="#ml-kili-route"
        data-travel-time="4.2"
      />

      {/* Divider */}
      <path className="f" d="M196 58v182" />

      {/* Right: Magnetic Azimuth Compass (data-wander="38") */}
      <circle cx="268" cy="146" r="56" data-draw-time="1.0" />
      <circle className="f" cx="268" cy="146" r="42" />
      <path d="M268 90v9M324 146h-9M268 202v-9M212 146h9" />
      <path className="f" d="M307 107l-5 5M307 185l-5-5M229 185l5-5M229 107l5 5" />
      <text x="268" y="114" textAnchor="middle" data-fade>
        N
      </text>
      <text x="307" y="149" textAnchor="middle" data-fade>
        E
      </text>
      <text x="268" y="185" textAnchor="middle" data-fade>
        S
      </text>
      <text x="229" y="149" textAnchor="middle" data-fade>
        W
      </text>
      <g data-wander="38" data-wander-cx="268" data-wander-cy="146">
        <path className="a" d="M268 112l6 34h-12z" />
        <path className="wash" d="M268 112l6 34h-12z" data-fade />
        <path d="M268 180l6-34h-12z" />
      </g>
      <circle className="dot" cx="268" cy="146" r="3.5" data-pop />
    </svg>
  );
}

/**
 * 02 / FLEET — Extended Safari 4x4 Land Cruiser Telemetry Blueprint
 */
export function SafariCruiserWheelSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 360 260"
      className={cn("ml-art", className)}
      aria-hidden="true"
      focusable="false"
      data-draw
      data-draw-step="0.05"
      data-draw-delay="0.15"
    >
      <rect x="20" y="20" width="320" height="220" rx="14" />
      <path className="f" d="M20 58h320" />
      <path d="M40 39h72" strokeWidth="2" />
      <rect className="wash" x="242" y="29" width="80" height="20" rx="10" data-fade />
      <text className="ml-grade" x="282" y="42" textAnchor="middle" data-fade>
        320L · 24V
      </text>

      {/* Cruiser Body Profile with Open Pop-Top Roof */}
      <path
        d="M66 156h-8c-4 0-6-3-6-7v-26c0-5 3-8 8-8h16l14-34h124v-12h42v12h16v68c0 4-3 7-7 7h-9"
        strokeWidth="1.5"
      />
      {/* Raised Safari Roof Hatch */}
      <path className="a" d="M114 78l48-16h44v16" />
      <path className="f" d="M104 92h44M158 92h44M212 92h34" />
      {/* Rear Mounted Dual Spare & Snorkel */}
      <rect x="274" y="106" width="12" height="36" rx="4" />
      <path className="a" d="M76 115v-22h10" />

      {/* Suspension Coils */}
      <path className="a" d="M106 140v22M102 146l8 4-8 4 8 4" />
      <path className="a" d="M236 140v22M232 146l8 4-8 4 8 4" />

      {/* Front & Rear All-Terrain Wheels */}
      <circle cx="106" cy="176" r="22" strokeWidth="1.6" />
      <circle className="f" cx="106" cy="176" r="13" />
      <circle className="dot" cx="106" cy="176" r="3.5" data-pop />

      <circle cx="236" cy="176" r="22" strokeWidth="1.6" />
      <circle className="f" cx="236" cy="176" r="13" />
      <circle className="dot" cx="236" cy="176" r="3.5" data-pop />

      {/* Corrugated Serengeti Track & Moving Traction Pulse */}
      <path
        id="ml-cruiser-road"
        className="f"
        d="M36 198h288"
        strokeDasharray="6 6"
      />
      <circle
        className="dot"
        cx="36"
        cy="198"
        r="3.5"
        data-travel="#ml-cruiser-road"
        data-travel-time="2.8"
      />

      {/* Checklist footer bar inside blueprint */}
      <path className="f" d="M40 220h42M138 220h46M240 220h54" />
      <circle className="dot-p" cx="92" cy="220" r="3" data-pop />
      <circle className="dot-p" cx="194" cy="220" r="3" data-pop />
      <circle className="dot" cx="304" cy="220" r="3" data-pop />
    </svg>
  );
}

/**
 * 03 / ECOLOGY — Great Migration Basin & GPS Caravan Loop
 */
export function MigrationArcSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 360 260"
      className={cn("ml-art", className)}
      aria-hidden="true"
      focusable="false"
      data-draw
      data-draw-step="0.05"
      data-draw-delay="0.25"
    >
      <rect x="20" y="20" width="320" height="220" rx="14" />
      <path className="f" d="M20 58h320" />
      <path d="M40 39h80" strokeWidth="2" />
      <text x="316" y="42" textAnchor="end" data-fade>
        2°19′S · SIRINGET
      </text>

      {/* Rift Valley Basin Contours */}
      <ellipse className="f" cx="180" cy="150" rx="126" ry="70" />
      <ellipse className="f" cx="180" cy="150" rx="92" ry="48" />
      <ellipse className="f" cx="180" cy="150" rx="54" ry="26" />

      {/* Mara & Grumeti River Crossings */}
      <path d="M48 112 Q124 84, 184 114 T312 104" strokeWidth="1.4" />
      <path className="f" d="M48 186 Q130 212, 198 182 T312 192" />

      {/* Dashed Migration Loop */}
      <path
        id="ml-mig-loop"
        className="a"
        d="M84 166 C84 102, 194 76, 256 108 C294 128, 272 204, 174 204 C116 204, 84 186, 84 166 Z"
        strokeDasharray="4 4"
      />

      {/* Staging Camps */}
      <circle className="dot" cx="256" cy="108" r="4.5" data-pop />
      <circle className="dot-p" cx="174" cy="204" r="4" data-pop />
      <circle className="dot-p" cx="84" cy="166" r="4" data-pop />
      <text className="ml-grade" x="266" y="96" data-fade>
        MARA
      </text>
      <text x="174" y="224" textAnchor="middle" data-fade>
        NDUTU
      </text>

      {/* GPS Signal Arcs */}
      <path className="a" d="M276 92a14 14 0 0 1 12 12" data-blink />
      <path className="f" d="M282 84a24 24 0 0 1 18 20" data-blink />

      {/* Synchronized MotionPath Caravan */}
      <circle
        className="dot"
        cx="84"
        cy="166"
        r="4.5"
        data-travel="#ml-mig-loop"
        data-travel-time="4.8"
        data-travel-delay="0"
      />
      <circle
        className="dot-p"
        cx="84"
        cy="166"
        r="3.2"
        data-travel="#ml-mig-loop"
        data-travel-time="4.8"
        data-travel-delay="-1.6"
      />
      <circle
        className="dot"
        cx="84"
        cy="166"
        r="3.2"
        data-travel="#ml-mig-loop"
        data-travel-time="4.8"
        data-travel-delay="-3.2"
      />
    </svg>
  );
}

/**
 * 04 / MEDICAL — KPAP SpO2 Oximetry & Lake Louise Log
 * Modeled directly after Motion Lab's caretrack.html telemetry sketch.
 */
export function PulseOximeterSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 360 260"
      className={cn("ml-art", className)}
      aria-hidden="true"
      focusable="false"
      data-draw
      data-draw-step="0.05"
      data-draw-delay="0.35"
    >
      <rect x="20" y="20" width="320" height="220" rx="14" />
      <circle cx="62" cy="56" r="15" />
      <circle cx="62" cy="51" r="4.5" />
      <path d="M53 65a9 9 0 0 1 18 0" />
      <path d="M90 50h88" strokeWidth="2" />
      <path className="f" d="M90 64h52" />

      <rect className="wash" x="236" y="42" width="84" height="26" rx="13" data-fade />
      <rect className="a" x="236" y="42" width="84" height="26" rx="13" />
      <text className="ml-grade" x="278" y="59" textAnchor="middle" data-fade>
        SpO2 94%
      </text>

      <path className="f" d="M20 88h320" />

      {/* Live EKG / Oximetry Waveform + MotionPath Tracer */}
      <path
        id="ml-spo2-wave"
        className="a"
        d="M42 132h48l10-24 14 48 14-42 9 18h46l8-14 9 14h118"
        strokeWidth="1.65"
      />
      <circle
        className="dot"
        cx="42"
        cy="132"
        r="4"
        data-travel="#ml-spo2-wave"
        data-travel-time="3.1"
      />

      {/* 3 KPAP Morning / Evening Lake Louise Checks */}
      <path className="a" d="M44 176h10" />
      <path d="M66 176h156" />
      <rect className="wash-p" x="294" y="166" width="20" height="20" rx="5" data-fade data-at=">0.12" />
      <path className="p" d="M299 176l4 4 7-8" strokeWidth="1.6" data-at="<" />

      <path className="a" d="M44 198h10" />
      <path d="M66 198h184" />
      <rect className="wash-p" x="294" y="188" width="20" height="20" rx="5" data-fade data-at=">0.12" />
      <path className="p" d="M299 198l4 4 7-8" strokeWidth="1.6" data-at="<" />

      <path className="a" d="M44 220h10" />
      <path className="f" d="M66 220h128" />
      <text x="278" y="224" textAnchor="end" data-fade>
        4,673M O2 READY
      </text>
    </svg>
  );
}

/**
 * 05 / OPTICS — Swarovski Rangefinder Optics & Sighting Checklist
 */
export function OpticsBinocularsSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 360 260"
      className={cn("ml-art", className)}
      aria-hidden="true"
      focusable="false"
      data-draw
      data-draw-step="0.05"
      data-draw-delay="0.45"
    >
      <rect x="20" y="20" width="320" height="220" rx="14" />
      <path className="f" d="M20 58h320" />
      <path d="M40 39h86" strokeWidth="2" />
      <text x="316" y="42" textAnchor="end" data-fade>
        10×42 SWAROVSKI
      </text>

      {/* Left: Dual Calibrated Binocular Lenses */}
      <circle cx="88" cy="148" r="46" strokeWidth="1.5" />
      <circle className="f" cx="88" cy="148" r="34" />
      <circle cx="152" cy="148" r="46" strokeWidth="1.5" />
      <circle className="f" cx="152" cy="148" r="34" />
      <rect x="111" y="96" width="18" height="10" rx="3" />

      {/* Crosshair ticks & Serengeti acacia horizon */}
      <path className="f" d="M64 148h48M88 124v48M128 148h48M152 124v48" />
      <path className="a" d="M58 156 Q88 138 118 156" />
      <path className="a" d="M122 156 Q152 138 182 156" />
      <path d="M88 148v-12M78 136h20" />
      <path d="M152 148v-12M142 136h20" />
      <circle className="dot" cx="152" cy="142" r="3" data-blink />

      {/* Right: Field Sighting Log */}
      <path className="f" d="M214 58v182" />
      <text x="230" y="88" data-fade>
        FIELD LOG
      </text>
      <path d="M230 118h54" />
      <rect className="wash" x="298" y="106" width="22" height="22" rx="5" data-fade data-at=">0.1" />
      <path className="a" d="M303 117l4 4 8-9" strokeWidth="1.6" data-at="<" />

      <path d="M230 156h44" />
      <rect className="wash" x="298" y="144" width="22" height="22" rx="5" data-fade data-at=">0.1" />
      <path className="a" d="M303 155l4 4 8-9" strokeWidth="1.6" data-at="<" />

      <path d="M230 194h58" />
      <rect className="wash" x="298" y="182" width="22" height="22" rx="5" data-fade data-at=">0.1" />
      <path className="a" d="M303 193l4 4 8-9" strokeWidth="1.6" data-at="<" />
    </svg>
  );
}

/**
 * 06 / COAST — Seronera-to-Zanzibar Flight & Coral Reef Dhow Chart
 */
export function ZanzibarDhowSvg({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 360 260"
      className={cn("ml-art", className)}
      aria-hidden="true"
      focusable="false"
      data-draw
      data-draw-step="0.05"
      data-draw-delay="0.55"
    >
      <rect x="20" y="20" width="320" height="220" rx="14" />
      <path className="f" d="M20 58h320" />
      <path d="M40 39h80" strokeWidth="2" />
      <rect className="wash" x="252" y="29" width="68" height="20" rx="10" data-fade />
      <text className="ml-grade" x="286" y="42" textAnchor="middle" data-fade>
        29°C ZNZ
      </text>

      {/* Bush Flight Radar Arc: Seronera -> Mnemba Atoll */}
      <circle className="dot-p" cx="62" cy="186" r="4.5" data-pop />
      <text x="62" y="206" textAnchor="middle" data-fade>
        SERONERA
      </text>

      <path
        id="ml-znj-flight"
        className="a"
        d="M62 186 Q150 74, 266 132"
        strokeDasharray="4 4"
      />
      <circle
        className="dot"
        cx="62"
        cy="186"
        r="4"
        data-travel="#ml-znj-flight"
        data-travel-time="3.6"
      />

      {/* Zanzibar Ngalawa Dhow Sail on Indian Ocean Contours */}
      <path d="M236 86v76" strokeWidth="1.5" />
      <path className="a" d="M236 88 C264 110, 272 130, 268 150 L200 142 C212 120, 224 104, 236 88 Z" />
      <path className="wash" d="M236 88 C264 110, 272 130, 268 150 L200 142 Z" data-fade />
      <path d="M192 162h96l-14 16h-68z" strokeWidth="1.5" />

      {/* Coral Reef Swells */}
      <path d="M150 194q26-10 52 0t52 0t52 0" data-blink />
      <path className="f" d="M164 210q24-9 48 0t48 0t48 0" data-blink />
      <text x="276" y="226" textAnchor="middle" data-fade>
        MNEMBA ATOLL
      </text>
    </svg>
  );
}
