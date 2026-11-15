"use client";

import React, { useEffect, useRef, useState } from "react";
import * as TWEEN from "@tweenjs/tween.js";
import { Compass, Mountain, Thermometer, Wind } from "lucide-react";

interface ShaderZone {
  id: string;
  label: string;
  swahili: string;
  elevationM: number;
  coords: string;
  tempC: string;
  note: string;
  colorA: [number, number, number];
  colorB: [number, number, number];
  ridgeFreq: number;
  mistDensity: number;
}

const SHADER_ZONES: ShaderZone[] = [
  {
    id: "kilimanjaro",
    label: "Uhuru Peak · Kibo",
    swahili: "Kilele cha Uhuru",
    elevationM: 5895,
    coords: "3°04′S · 37°21′E",
    tempC: "-7°C Dawn",
    note: "Volcanic obsidian ridges, glacial fields & sub-zero summit winds above equatorial cloud decks.",
    colorA: [0.04, 0.09, 0.08],
    colorB: [0.41, 0.69, 0.56],
    ridgeFreq: 3.4,
    mistDensity: 0.65,
  },
  {
    id: "ngorongoro",
    label: "Ngorongoro Rim",
    swahili: "Bonde la Ngorongoro",
    elevationM: 2286,
    coords: "3°09′S · 35°35′E",
    tempC: "14°C Mist",
    note: "Morning cloud cascades spilling over ancient caldera walls into lush soda-lake grasslands.",
    colorA: [0.05, 0.11, 0.08],
    colorB: [0.22, 0.56, 0.37],
    ridgeFreq: 2.3,
    mistDensity: 0.88,
  },
  {
    id: "serengeti",
    label: "Serengeti Kopjes",
    swahili: "Mbuga za Siringet",
    elevationM: 1450,
    coords: "2°19′S · 34°50′E",
    tempC: "26°C Golden",
    note: "Sun-warmed acacia plains, shimmering midday heat contours & two million migrating hooves.",
    colorA: [0.11, 0.09, 0.06],
    colorB: [0.82, 0.54, 0.25],
    ridgeFreq: 1.65,
    mistDensity: 0.42,
  },
  {
    id: "zanzibar",
    label: "Zanzibar Mnemba Atoll",
    swahili: "Bahari ya Hindi",
    elevationM: 0,
    coords: "5°49′S · 39°23′E",
    tempC: "29°C Trade Wind",
    note: "Indian Ocean coral shallows, lagoon currents & turquoise reef bathymetry off Unguja.",
    colorA: [0.03, 0.11, 0.15],
    colorB: [0.16, 0.68, 0.72],
    ridgeFreq: 1.25,
    mistDensity: 0.55,
  },
];

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 v_uv;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec3 u_colorA;
  uniform vec3 u_colorB;
  uniform float u_ridgeFreq;
  uniform float u_mistDensity;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float val = 0.0;
    float amp = 0.52;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      val += amp * noise(p);
      p = rot * p * 2.05;
      amp *= 0.5;
    }
    return val;
  }

  void main() {
    vec2 aspect = vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
    vec2 uv = (v_uv - 0.5) * aspect;
    vec2 mouse = (u_mouse - 0.5) * aspect;

    float t = u_time * 0.08;
    vec2 q = uv * u_ridgeFreq + vec2(t * 0.45, -t * 0.2);

    // Domain-warped ridged elevation field
    float warp = fbm(q * 0.8 + vec2(t * 0.3, 0.0));
    float ridge = 1.0 - abs(fbm(q + warp * 0.95) * 2.0 - 1.0);
    ridge = pow(clamp(ridge, 0.0, 1.0), 1.65);

    // Pointer lantern ripple
    float dMouse = length(uv - mouse);
    float lantern = exp(-dMouse * 3.4);
    ridge += lantern * 0.14 * sin(dMouse * 18.0 - u_time * 2.0) * 0.35;

    // Topographic contour isolines (real cartographic feel)
    float bands = ridge * 16.0;
    float line = abs(fract(bands - 0.5) - 0.5) / max(fwidth(bands), 0.004);
    float contour = 1.0 - smoothstep(0.0, 1.35, line);

    // Atmospheric mist veil
    float mist = smoothstep(0.32, 0.85, fbm(uv * 2.4 - vec2(t * 0.9, t * 0.18))) * u_mistDensity;
    mist *= (1.0 - lantern * 0.65);

    vec3 col = mix(u_colorA, u_colorB, ridge * 0.72 + lantern * 0.25);
    col += u_colorB * contour * (0.28 + lantern * 0.45);
    col = mix(col, u_colorA * 1.35 + u_colorB * 0.18, mist * 0.55);

    // Subtle film vignette
    float vig = smoothstep(1.2, 0.28, length(v_uv - 0.5));
    col *= mix(0.65, 1.05, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function WebGLTerrainShader() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [liveAltitude, setLiveAltitude] = useState(SHADER_ZONES[0].elevationM);

  const tweenGroupRef = useRef<TWEEN.Group | null>(null);
  const shaderStateRef = useRef({
    rA: SHADER_ZONES[0].colorA[0],
    gA: SHADER_ZONES[0].colorA[1],
    bA: SHADER_ZONES[0].colorA[2],
    rB: SHADER_ZONES[0].colorB[0],
    gB: SHADER_ZONES[0].colorB[1],
    bB: SHADER_ZONES[0].colorB[2],
    ridgeFreq: SHADER_ZONES[0].ridgeFreq,
    mistDensity: SHADER_ZONES[0].mistDensity,
    altitude: SHADER_ZONES[0].elevationM,
  });

  // Trigger @tweenjs/tween.js smooth interpolation whenever zone changes
  useEffect(() => {
    const target = SHADER_ZONES[activeIndex];
    const group = tweenGroupRef.current;
    if (!group) return;

    const tween = new TWEEN.Tween(shaderStateRef.current)
      .to(
        {
          rA: target.colorA[0],
          gA: target.colorA[1],
          bA: target.colorA[2],
          rB: target.colorB[0],
          gB: target.colorB[1],
          bB: target.colorB[2],
          ridgeFreq: target.ridgeFreq,
          mistDensity: target.mistDensity,
          altitude: target.elevationM,
        },
        1150
      )
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate((obj) => {
        setLiveAltitude(Math.round(obj.altitude));
      })
      .start();

    group.add(tween);
    return () => {
      group.remove(tween);
    };
  }, [activeIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tweenGroup = new TWEEN.Group();
    tweenGroupRef.current = tweenGroup;

    const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
    if (!gl) return;

    // Enable OES_standard_derivatives for crisp GLSL fwidth() contour lines in WebGL1
    gl.getExtension("OES_standard_derivatives");

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    // Fallback shader without fwidth if extension is missing
    const hasDerivatives = !!gl.getExtension("OES_standard_derivatives");
    const fragSource = hasDerivatives
      ? "#extension GL_OES_standard_derivatives : enable\n" + FRAGMENT_SHADER
      : FRAGMENT_SHADER.replace("max(fwidth(bands), 0.004)", "0.04");
    const fs = compile(gl.FRAGMENT_SHADER, fragSource);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uColA = gl.getUniformLocation(prog, "u_colorA");
    const uColB = gl.getUniformLocation(prog, "u_colorB");
    const uFreq = gl.getUniformLocation(prog, "u_ridgeFreq");
    const uMist = gl.getUniformLocation(prog, "u_mistDensity");

    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetX = 0.5;
    let targetY = 0.5;
    let isVisible = true;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      targetX = (e.clientX - r.left) / r.width;
      targetY = 1.0 - (e.clientY - r.top) / r.height;
    };
    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerdown", onMove, { passive: true });

    const start = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      if (!isVisible) return;

      tweenGroup.update(now);

      mouseX += (targetX - mouseX) * 0.08;
      mouseY += (targetY - mouseY) * 0.08;

      const s = shaderStateRef.current;
      const elapsed = reduced ? 0.5 : (now - start) / 1000;

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.uniform3f(uColA, s.rA, s.gA, s.bA);
      gl.uniform3f(uColB, s.rB, s.gB, s.bB);
      gl.uniform1f(uFreq, s.ridgeFreq);
      gl.uniform1f(uMist, s.mistDensity);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onMove);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  const current = SHADER_ZONES[activeIndex];

  return (
    <section className="relative w-full bg-[#08100c] text-[#e2eee7] border-y border-white/10">
      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8 py-16 md:py-24">
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#0a1610] shadow-2xl">
          {/* Interactive WebGL GLSL Topographic Shader Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full cursor-crosshair touch-pan-y"
            aria-label="Interactive WebGL topographic elevation terrain shader of Tanzania"
          />

          <div className="relative z-10 pointer-events-none grid gap-8 p-6 sm:p-10 md:p-14 lg:grid-cols-[1.2fr_0.9fr] lg:items-end">
            <div className="pointer-events-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#a5d7bb] backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#69b38a] animate-pulse" />
                Live GLSL Topographic Shader · Tween.js Morph
              </div>

              <h2 className="mt-5 font-serif text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.03]">
                Six thousand meters of East African relief.
              </h2>

              <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-white/80">
                {current.note} Move your pointer across the canvas to part atmospheric mist and illuminate contour isolines.
              </p>

              {/* Zone selector pills — clean 2x2 grid on phones, inline pills on sm+ */}
              <div className="mt-6 sm:mt-7 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                {SHADER_ZONES.map((z, idx) => {
                  const active = idx === activeIndex;
                  return (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={`cursor-pointer rounded-2xl sm:rounded-full border px-3 sm:px-4 py-2 text-left text-[11.5px] sm:text-xs font-medium transition-all duration-300 backdrop-blur-md ${
                        active
                          ? "border-white bg-white text-[#08100c] shadow-lg"
                          : "border-white/20 bg-black/40 text-white/85 hover:border-white/50 hover:bg-black/60"
                      }`}
                    >
                      <span className="block sm:inline font-mono text-[9.5px] sm:text-[10px] opacity-75 sm:mr-1.5">
                        {z.elevationM.toLocaleString()}m
                      </span>
                      <span className="line-clamp-1 sm:line-clamp-none">{z.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Tweened Telemetry Card */}
            <div className="pointer-events-auto rounded-2xl border border-white/15 bg-black/55 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#a5d7bb]">
                  {current.swahili}
                </span>
                <span className="font-mono text-[11px] text-white/70">{current.coords}</span>
              </div>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-mono text-4xl sm:text-5xl font-medium tracking-tight text-white tabular-nums">
                  {liveAltitude.toLocaleString("en-US")}
                </span>
                <span className="font-mono text-sm uppercase tracking-widest text-[#a5d7bb]">
                  meters ASL
                </span>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-xs">
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-white/55">
                    <Thermometer className="h-3.5 w-3.5 text-[#d8914f]" />
                    Microclimate
                  </div>
                  <div className="mt-1 font-medium text-white">{current.tempC}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-white/55">
                    <Wind className="h-3.5 w-3.5 text-[#a5d7bb]" />
                    Mist Density
                  </div>
                  <div className="mt-1 font-medium text-white">
                    {Math.round(current.mistDensity * 100)}%
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-white/55">
                    <Compass className="h-3.5 w-3.5 text-[#69b38a]" />
                    Terrain
                  </div>
                  <div className="mt-1 font-medium text-white flex items-center gap-1">
                    <Mountain className="h-3 w-3 opacity-70" />
                    {current.elevationM > 4000 ? "Alpine" : current.elevationM > 1500 ? "Caldera" : current.elevationM > 0 ? "Savannah" : "Pelagic"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
