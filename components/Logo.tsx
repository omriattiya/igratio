"use client";

import { useEffect, useRef } from "react";

type LogoProps = {
  className?: string;
};

const INTERVAL_MS = 6000;
const DRAW_DURATION_MS = 900;
const STAGGER_MS = 80;

export function Logo({ className = "size-8" }: LogoProps) {
  const pathsRef = useRef<(SVGLineElement | SVGPathElement | null)[]>([]);

  useEffect(() => {
    const paths = pathsRef.current.filter(Boolean) as SVGGeometryElement[];
    if (paths.length === 0) return;

    const lengths = paths.map((p) => p.getTotalLength());

    function reset() {
      paths.forEach((p, i) => {
        p.style.strokeDasharray = `${lengths[i]}`;
        p.style.strokeDashoffset = "0";
      });
    }

    function animate() {
      paths.forEach((p, i) => {
        p.style.transition = "none";
        p.style.strokeDashoffset = `${lengths[i]}`;
      });

      requestAnimationFrame(() => {
        paths.forEach((p, i) => {
          const delay = i * STAGGER_MS;
          p.style.transition = `stroke-dashoffset ${DRAW_DURATION_MS}ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`;
          p.style.strokeDashoffset = "0";
        });
      });
    }

    reset();

    const id = setInterval(animate, INTERVAL_MS);
    const initialTimeout = setTimeout(animate, 800);

    return () => {
      clearInterval(id);
      clearTimeout(initialTimeout);
    };
  }, []);

  const setRef = (index: number) => (el: SVGLineElement | SVGPathElement | null) => {
    pathsRef.current[index] = el;
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="100 120 300 240"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="header-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      <g transform="translate(0, -20)">
        <line ref={setRef(0)} x1="180" y1="320" x2="320" y2="160" stroke="url(#header-logo-grad)" strokeWidth="20" strokeLinecap="round" />
        <path ref={setRef(1)} d="M 185 240 L 185 185" stroke="url(#header-logo-grad)" strokeWidth="18" strokeLinecap="round" fill="none" />
        <path ref={setRef(2)} d="M 150 200 L 185 165 L 220 200" stroke="url(#header-logo-grad)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <line ref={setRef(3)} x1="155" y1="240" x2="215" y2="240" stroke="url(#header-logo-grad)" strokeWidth="16" strokeLinecap="round" />
        <path ref={setRef(4)} d="M 315 240 L 315 295" stroke="url(#header-logo-grad)" strokeWidth="18" strokeLinecap="round" fill="none" />
        <path ref={setRef(5)} d="M 280 280 L 315 315 L 350 280" stroke="url(#header-logo-grad)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <line ref={setRef(6)} x1="285" y1="240" x2="345" y2="240" stroke="url(#header-logo-grad)" strokeWidth="16" strokeLinecap="round" />
      </g>
    </svg>
  );
}
