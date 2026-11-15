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

    float strength = u_hover * 0.022;
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
 * Renders a fast native <img> by default (zero idle WebGL contexts on load)
 * and lazily activates a WebGL GLSL ripple + chromatic hover shader ONLY while
 * actively hovered on pointer-capable devices.
 */
export function WebGLImagePlane({ src, alt, className }: WebGLImagePlaneProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeHover, setActiveHover] = useState(false);
  const [shaderReady, setShaderReady] = useState(false);

  useEffect(() => {
    if (!activeHover) return;

    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
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
    let disposed = false;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (disposed) return;
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

    const r = wrap.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(r.width));
    canvas.height = Math.max(1, Math.floor(r.height));
    gl.viewport(0, 0, canvas.width, canvas.height);

    let targetHover = 1;
    let currentHover = 0.2;
    let mx = 0.5;
    let my = 0.5;
    let tmx = 0.5;
    let tmy = 0.5;
    let raf = 0;
    const start = performance.now();

    const drawFrame = (now: number) => {
      if (disposed) return;
      raf = 0;
      if (texLoaded) {
        currentHover += (targetHover - currentHover) * 0.14;
        mx += (tmx - mx) * 0.16;
        my += (tmy - my) * 0.16;

        gl.useProgram(prog);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uTex, 0);
        gl.uniform2f(uMouse, mx, my);
        gl.uniform1f(uHover, currentHover);
        gl.uniform1f(uTime, (now - start) / 1000);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      if (targetHover > 0.01 || currentHover > 0.01) {
        raf = requestAnimationFrame(drawFrame);
      }
    };

    raf = requestAnimationFrame(drawFrame);

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      tmx = (e.clientX - rect.left) / rect.width;
      tmy = (e.clientY - rect.top) / rect.height;
      targetHover = 1;
      if (!raf) raf = requestAnimationFrame(drawFrame);
    };
    const onLeave = () => {
      targetHover = 0;
    };

    wrap.addEventListener("pointermove", onMove, { passive: true });
    wrap.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      setShaderReady(false);
    };
  }, [activeHover, src]);

  return (
    <div
      ref={wrapRef}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setActiveHover(true);
      }}
      onPointerLeave={() => setActiveHover(false)}
      className={cn("relative overflow-hidden bg-muted", className)}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {activeHover && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-200",
            shaderReady ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
}
