"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface WebGLImagePlaneProps {
  src: string;
  alt: string;
  className?: string;
}

const VERT = `
  attribute vec2 a_pos;
  varying vec2 v_uv;
  void main() {
    v_uv = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

const FRAG = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_tex;
  uniform vec2 u_mouse;
  uniform float u_hover;
  uniform float u_time;

  void main() {
    vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);
    vec2 m = vec2(u_mouse.x, 1.0 - u_mouse.y);

    float dist = distance(uv, m);
    float ripple = sin(dist * 24.0 - u_time * 5.0) * exp(-dist * 4.5);
    vec2 dir = normalize(uv - m + 0.0001);

    // Subtle Codrops-style chromatic & liquid hover displacement
    float strength = u_hover * 0.024;
    vec2 offsetR = dir * ripple * strength * 1.35;
    vec2 offsetG = dir * ripple * strength * 1.0;
    vec2 offsetB = dir * ripple * strength * 0.65;

    float r = texture2D(u_tex, clamp(uv + offsetR, 0.002, 0.998)).r;
    float g = texture2D(u_tex, clamp(uv + offsetG, 0.002, 0.998)).g;
    float b = texture2D(u_tex, clamp(uv + offsetB, 0.002, 0.998)).b;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

/**
 * Renders a crisp static <img> at all times and progressively enhances hover
 * interactions with a WebGL GLSL ripple & chromatic aberration shader.
 */
export function WebGLImagePlane({ src, alt, className }: WebGLImagePlaneProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shaderReady, setShaderReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: true });
    if (!gl) return;

    const compile = (type: number, code: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, code);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTex = gl.getUniformLocation(prog, "u_tex");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uHover = gl.getUniformLocation(prog, "u_hover");
    const uTime = gl.getUniformLocation(prog, "u_time");

    const texture = gl.createTexture();
    let texLoaded = false;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      texLoaded = true;
      setShaderReady(true);
    };
    img.src = src;

    const syncSize = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(wrap);

    let targetHover = 0;
    let currentHover = 0;
    let mx = 0.5;
    let my = 0.5;
    let tmx = 0.5;
    let tmy = 0.5;
    let raf = 0;
    const start = performance.now();

    const drawFrame = (now: number) => {
      raf = 0;
      if (!texLoaded) return;

      currentHover += (targetHover - currentHover) * 0.12;
      mx += (tmx - mx) * 0.14;
      my += (tmy - my) * 0.14;

      gl.useProgram(prog);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uTex, 0);
      gl.uniform2f(uMouse, mx, my);
      gl.uniform1f(uHover, currentHover);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (targetHover > 0.01 || currentHover > 0.005) {
        raf = requestAnimationFrame(drawFrame);
      }
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(drawFrame);
    };

    const onEnter = () => {
      targetHover = 1;
      wake();
    };
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      tmx = (e.clientX - r.left) / r.width;
      tmy = (e.clientY - r.top) / r.height;
      targetHover = 1;
      wake();
    };
    const onLeave = () => {
      targetHover = 0;
      wake();
    };

    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [src]);

  return (
    <div ref={wrapRef} className={cn("relative overflow-hidden bg-muted", className)}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-300",
          shaderReady ? "opacity-0 group-hover:opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
