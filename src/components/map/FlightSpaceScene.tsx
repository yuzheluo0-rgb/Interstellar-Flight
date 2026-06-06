import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ==================== Shared Texture Helpers ====================

function makeGlowTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.15, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.4, 'rgba(200,220,255,0.4)');
  g.addColorStop(0.7, 'rgba(160,200,255,0.1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

function starLayerGeo(count: number, spread: number, colors: [number, number, number][]): THREE.BufferGeometry {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * spread;
    pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
    pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
    const c = colors[Math.floor(Math.random() * colors.length)];
    col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
    sizes[i] = 0.3 + Math.random() * 1.8;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  return geo;
}

// ==================== Planet Texture Generator ====================

function makePlanetTex(type: 'earth' | 'gas' | 'rocky' | 'ice'): THREE.CanvasTexture {
  const W = 512, H = 256;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;

  switch (type) {
    case 'earth': {
      // Deep ocean gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0e2a45');
      bg.addColorStop(0.1, '#16608a');
      bg.addColorStop(0.35, '#1a7aaa');
      bg.addColorStop(0.5, '#2080b0');
      bg.addColorStop(0.65, '#1a7aaa');
      bg.addColorStop(0.9, '#16608a');
      bg.addColorStop(1, '#0e2a45');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Continents — overlapping ellipses forming landmasses
      const continents = [
        { x: 0.58, y: 0.30, w: 0.22, h: 0.18 }, // Europe/Africa
        { x: 0.50, y: 0.38, w: 0.18, h: 0.22 },
        { x: 0.22, y: 0.22, w: 0.10, h: 0.20 }, // Americas
        { x: 0.25, y: 0.42, w: 0.12, h: 0.25 },
        { x: 0.28, y: 0.25, w: 0.16, h: 0.08 },
        { x: 0.70, y: 0.20, w: 0.14, h: 0.12 }, // Asia
        { x: 0.72, y: 0.32, w: 0.18, h: 0.14 },
        { x: 0.68, y: 0.28, w: 0.10, h: 0.08 },
        { x: 0.15, y: 0.38, w: 0.06, h: 0.08 }, // Islands
        { x: 0.82, y: 0.45, w: 0.08, h: 0.06 }, // Australia
        { x: 0.38, y: 0.45, w: 0.05, h: 0.08 },
      ];
      for (const cont of continents) {
        ctx.save();
        ctx.translate(cont.x * W, cont.y * H);
        for (let pass = 0; pass < 3; pass++) {
          const ox = (Math.random() - 0.5) * cont.w * W * 0.3;
          const oy = (Math.random() - 0.5) * cont.h * H * 0.3;
          ctx.beginPath();
          ctx.ellipse(ox, oy, cont.w * W * (0.4 + Math.random() * 0.4), cont.h * H * (0.4 + Math.random() * 0.4), Math.random() * Math.PI, 0, Math.PI * 2);
          const lg = ctx.createRadialGradient(ox, oy, 0, ox, oy, cont.w * W * 0.5);
          const shades = ['#3d7a30', '#4a8a3a', '#2d6a20', '#5a9a44', '#3a7030'];
          const s = shades[Math.floor(Math.random() * shades.length)];
          lg.addColorStop(0, s);
          lg.addColorStop(0.7, s);
          lg.addColorStop(1, '#1a4a10');
          ctx.fillStyle = lg;
          ctx.fill();
        }
        ctx.restore();
      }

      // Cloud layer — semi-transparent swirls
      for (let i = 0; i < 35; i++) {
        const cx = Math.random() * W, cy = Math.random() * H;
        const r = 12 + Math.random() * 45;
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        cg.addColorStop(0, `rgba(255,255,255,${0.1 + Math.random() * 0.25})`);
        cg.addColorStop(0.6, `rgba(240,245,255,${0.05})`);
        cg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = cg;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }

      // Ice caps
      const ic = ctx.createLinearGradient(0, 0, 0, H * 0.1);
      ic.addColorStop(0, 'rgba(220,240,255,0.7)');
      ic.addColorStop(1, 'rgba(220,240,255,0)');
      ctx.fillStyle = ic;
      ctx.fillRect(0, 0, W, H * 0.1);
      const ic2 = ctx.createLinearGradient(0, H, 0, H * 0.9);
      ic2.addColorStop(0, 'rgba(220,240,255,0.7)');
      ic2.addColorStop(1, 'rgba(220,240,255,0)');
      ctx.fillStyle = ic2;
      ctx.fillRect(0, H * 0.9, W, H * 0.1);
      break;
    }

    case 'gas': {
      // Gas giant with turbulent bands
      const bands = [
        { y: 0.00, h: 0.06, c: '#b0885a' },
        { y: 0.06, h: 0.05, c: '#dbb896' },
        { y: 0.11, h: 0.09, c: '#c4956a' },
        { y: 0.20, h: 0.04, c: '#e8c9a0' },
        { y: 0.24, h: 0.08, c: '#a0734a' },
        { y: 0.32, h: 0.05, c: '#c4956a' },
        { y: 0.37, h: 0.07, c: '#e0c8a8' },
        { y: 0.44, h: 0.04, c: '#8a6a4a' },
        { y: 0.48, h: 0.08, c: '#c4956a' },
        { y: 0.56, h: 0.05, c: '#dbb896' },
        { y: 0.61, h: 0.07, c: '#b0885a' },
        { y: 0.68, h: 0.04, c: '#e8c9a0' },
        { y: 0.72, h: 0.09, c: '#a0734a' },
        { y: 0.81, h: 0.05, c: '#dbb896' },
        { y: 0.86, h: 0.06, c: '#c4956a' },
        { y: 0.92, h: 0.04, c: '#8a6a4a' },
        { y: 0.96, h: 0.04, c: '#b0885a' },
      ];

      for (const b of bands) {
        for (let row = 0; row < Math.ceil(b.h * H); row++) {
          const y = b.y * H + row;
          if (y >= H) break;
          const wave = Math.sin(row * 0.15 + bands.indexOf(b)) * 4 + Math.sin(row * 0.07) * 3;
          for (let col = 0; col < W; col++) {
            const x = col + Math.sin(col * 0.02 + b.y * 10) * 3 + wave * (0.3 + Math.sin(col * 0.01) * 0.5);
            const ci = Math.round(x);
            if (ci < 0 || ci >= W) continue;
            // Parse hex color
            const r = parseInt(b.c.slice(1, 3), 16);
            const g = parseInt(b.c.slice(3, 5), 16);
            const bl = parseInt(b.c.slice(5, 7), 16);
            const noise = (Math.random() - 0.5) * 12;
            const idx = (Math.floor(y) * W + ci) * 4;
            const imgData = ctx.getImageData(0, 0, W, H);
            // We have to use putImageData per row, so let's do it differently — use fillRect approach
          }
        }
      }

      // Fallback: draw bands with simple fill for reliability
      ctx.clearRect(0, 0, W, H);
      for (const b of bands) {
        const y0 = b.y * H;
        const h = b.h * H;
        const c = b.c;
        ctx.fillStyle = c;
        ctx.fillRect(0, y0, W, h);
        // Add horizontal turbulence
        for (let pass = 0; pass < 3; pass++) {
          const tY = y0 + Math.random() * h;
          const tH = 1 + Math.random() * 3;
          const tW = 20 + Math.random() * 80;
          const tX = Math.random() * W;
          ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.06})`;
          ctx.fillRect(tX, tY, tW, tH);
          ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.04})`;
          ctx.fillRect(tX + Math.random() * 30, tY, tW * 0.5, tH);
        }
      }

      // Great Red Spot
      ctx.save();
      ctx.translate(W * 0.62, H * 0.38);
      const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, 38);
      sg.addColorStop(0, '#d44030');
      sg.addColorStop(0.3, '#c04038');
      sg.addColorStop(0.6, '#b04830');
      sg.addColorStop(0.85, '#a05038');
      sg.addColorStop(1, 'rgba(160,60,40,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.ellipse(0, 0, 42, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      // Spot swirl
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const r = 12 + Math.random() * 18;
        ctx.fillStyle = `rgba(200,80,50,${0.1 + Math.random() * 0.15})`;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.5, 8 + Math.random() * 10, 4 + Math.random() * 6, a * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    case 'rocky': {
      // Base surface with variation
      for (let y = 0; y < H; y++) {
        const v = 100 + Math.sin(y * 0.05) * 15 + Math.random() * 20;
        ctx.fillStyle = `rgb(${v + 30},${v + 20},${v})`;
        ctx.fillRect(0, y, W, 1);
      }

      // Craters
      for (let i = 0; i < 50; i++) {
        const cx = Math.random() * W, cy = Math.random() * H;
        const r = 2 + Math.random() ** 1.5 * 20;
        // Crater rim (light)
        ctx.beginPath();
        ctx.arc(cx - r * 0.15, cy - r * 0.15, r * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160,150,130,${0.1 + Math.random() * 0.15})`;
        ctx.fill();
        // Crater depression (dark)
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(30,25,20,${0.25 + Math.random() * 0.4})`;
        ctx.fill();
        // Inner highlight
        ctx.beginPath();
        ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,170,150,${0.05 + Math.random() * 0.1})`;
        ctx.fill();
      }

      // Polar caps
      const pc = ctx.createLinearGradient(0, 0, 0, H * 0.08);
      pc.addColorStop(0, 'rgba(200,195,185,0.5)');
      pc.addColorStop(1, 'rgba(200,195,185,0)');
      ctx.fillStyle = pc;
      ctx.fillRect(0, 0, W, H * 0.08);
      const pc2 = ctx.createLinearGradient(0, H, 0, H * 0.92);
      pc2.addColorStop(0, 'rgba(200,195,185,0.5)');
      pc2.addColorStop(1, 'rgba(200,195,185,0)');
      ctx.fillStyle = pc2;
      ctx.fillRect(0, H * 0.92, W, H * 0.08);
      break;
    }

    case 'ice': {
      // Subsurface gradient
      const ig = ctx.createLinearGradient(0, 0, 0, H);
      ig.addColorStop(0, '#a0c8e0');
      ig.addColorStop(0.15, '#c0e0f0');
      ig.addColorStop(0.35, '#d0eaf5');
      ig.addColorStop(0.5, '#ddf0f8');
      ig.addColorStop(0.65, '#d0eaf5');
      ig.addColorStop(0.85, '#c0e0f0');
      ig.addColorStop(1, '#a0c8e0');
      ctx.fillStyle = ig;
      ctx.fillRect(0, 0, W, H);

      // Subsurface glow pockets
      for (let i = 0; i < 20; i++) {
        const cx = Math.random() * W, cy = Math.random() * H;
        const r = 15 + Math.random() * 40;
        const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        sg.addColorStop(0, `rgba(160,220,255,${0.08 + Math.random() * 0.12})`);
        sg.addColorStop(0.5, `rgba(140,200,240,${0.03})`);
        sg.addColorStop(1, 'rgba(140,200,240,0)');
        ctx.fillStyle = sg;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }

      // Crack network
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        let x = Math.random() * W, y = Math.random() * H;
        ctx.moveTo(x, y);
        const segments = 3 + Math.floor(Math.random() * 8);
        for (let j = 0; j < segments; j++) {
          x += (Math.random() - 0.5) * 50;
          y += (Math.random() - 0.5) * 25;
          ctx.lineTo(x, y);
          // Branch
          if (Math.random() < 0.3) {
            const bx = x + (Math.random() - 0.5) * 20;
            const by = y + (Math.random() - 0.5) * 15;
            ctx.moveTo(x, y);
            ctx.lineTo(bx, by);
          }
        }
        ctx.strokeStyle = `rgba(60,120,160,${0.1 + Math.random() * 0.2})`;
        ctx.lineWidth = 0.3 + Math.random() * 1.2;
        ctx.stroke();
      }

      // Bright surface ridges
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * W, y = Math.random() * H;
        const angle = Math.random() * Math.PI;
        const len = 10 + Math.random() * 35;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
        ctx.strokeStyle = `rgba(220,245,255,${0.05 + Math.random() * 0.1})`;
        ctx.lineWidth = 1 + Math.random() * 3;
        ctx.stroke();
      }

      // Thicker polar ice
      const pic = ctx.createLinearGradient(0, 0, 0, H * 0.06);
      pic.addColorStop(0, 'rgba(220,240,255,0.4)');
      pic.addColorStop(1, 'rgba(220,240,255,0)');
      ctx.fillStyle = pic;
      ctx.fillRect(0, 0, W, H * 0.06);
      const pic2 = ctx.createLinearGradient(0, H, 0, H * 0.94);
      pic2.addColorStop(0, 'rgba(220,240,255,0.4)');
      pic2.addColorStop(1, 'rgba(220,240,255,0)');
      ctx.fillStyle = pic2;
      ctx.fillRect(0, H * 0.94, W, H * 0.06);
      break;
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

// ==================== Deep Stars ====================

export function DeepStars() {
  const layers = useMemo(() => {
    const glowTex = makeGlowTex();
    const palettes: [number, number, number][][] = [
      [[0.9, 0.9, 1], [1, 1, 1], [0.8, 0.85, 1]],
      [[1, 1, 0.9], [1, 0.95, 0.8], [1, 1, 1]],
      [[0.9, 1, 0.95], [0.85, 0.9, 1], [1, 1, 1]],
      [[1, 0.9, 0.95], [1, 0.85, 0.9], [1, 1, 1]],
    ];
    return palettes.map((p, i) => ({
      geo: starLayerGeo(300 + i * 100, 60 + i * 15, p),
      spread: 60 + i * 15,
      speed: 0.02 + i * 0.015,
      tex: glowTex,
    }));
  }, []);

  const refs = useRef<(THREE.Points | null)[]>([]);
  useFrame((_, delta) => {
    for (let i = 0; i < refs.current.length; i++) {
      if (refs.current[i]) refs.current[i]!.rotation.y += delta * (0.02 + i * 0.015);
    }
  });

  return (
    <>
      {layers.map((l, i) => (
        <points
          key={i}
          ref={(el: THREE.Points | null) => { refs.current[i] = el; }}
          geometry={l.geo}
        >
          <pointsMaterial
            size={0.2 + i * 0.08}
            map={l.tex}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            vertexColors
            opacity={0.5 + i * 0.1}
          />
        </points>
      ))}
    </>
  );
}

// ==================== Nebulae ====================

const NEBULA_DATA = [
  { pos: [-26, 8, -32], color: '#ff4466', size: 15, opacity: 0.07 },
  { pos: [32, -6, -38], color: '#4488ff', size: 18, opacity: 0.06 },
  { pos: [-12, 16, -42], color: '#8844ff', size: 13, opacity: 0.06 },
  { pos: [38, 10, -28], color: '#ff8844', size: 11, opacity: 0.05 },
  { pos: [-32, -10, -22], color: '#44ff88', size: 9, opacity: 0.04 },
  { pos: [16, -18, -48], color: '#ff44aa', size: 16, opacity: 0.05 },
  { pos: [-22, 6, -52], color: '#44aaff', size: 20, opacity: 0.04 },
  { pos: [6, 22, -32], color: '#aa44ff', size: 10, opacity: 0.05 },
];

export function SpaceNebulae() {
  return (
    <>
      {NEBULA_DATA.map((n, i) => (
        <mesh key={i} position={n.pos as [number, number, number]}>
          <sphereGeometry args={[n.size, 16, 16]} />
          <meshBasicMaterial
            color={n.color}
            transparent
            opacity={n.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </>
  );
}

// ==================== Milky Way ====================

export function MilkyWay() {
  const geo = useMemo(() => {
    const count = 4000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() ** 1.5 * 25;
      const spread = (Math.random() - 0.5) * 4;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = spread;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
      // Warm to cool color distribution
      const brightness = 0.3 + Math.random() * 0.7;
      const tint = Math.random();
      if (tint < 0.3) {
        col[i * 3] = brightness;
        col[i * 3 + 1] = brightness * 0.85;
        col[i * 3 + 2] = brightness * 0.7;
      } else if (tint < 0.6) {
        col[i * 3] = brightness * 0.8;
        col[i * 3 + 1] = brightness * 0.9;
        col[i * 3 + 2] = brightness;
      } else {
        col[i * 3] = brightness;
        col[i * 3 + 1] = brightness;
        col[i * 3 + 2] = brightness;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, []);

  const glowTex = useMemo(() => makeGlowTex(), []);

  return (
    <points geometry={geo}>
      <pointsMaterial
        size={0.12}
        map={glowTex}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        vertexColors
        opacity={0.65}
      />
    </points>
  );
}

// ==================== Planets ====================

type PlanetType = 'earth' | 'gas' | 'rocky' | 'ice';

interface PlanetData {
  orbitRadius: number;
  orbitSpeed: number;
  initAngle: number;
  size: number;
  type: PlanetType;
  tilt: number;
  hasRings?: boolean;
  ringColor?: string;
  hasAtmosphere?: boolean;
  atmosphereColor?: string;
}

const PLANET_DATA: PlanetData[] = [
  { orbitRadius: 6,  orbitSpeed: 0.40, initAngle: 0.0,  size: 0.30, type: 'rocky', tilt: 0.1 },
  { orbitRadius: 8,  orbitSpeed: 0.30, initAngle: 1.2,  size: 0.45, type: 'earth', tilt: 0.3, hasAtmosphere: true, atmosphereColor: '#4488ff' },
  { orbitRadius: 10, orbitSpeed: 0.22, initAngle: 2.8,  size: 0.70, type: 'gas',   tilt: 0.5, hasAtmosphere: true, atmosphereColor: '#cc9966' },
  { orbitRadius: 12, orbitSpeed: 0.17, initAngle: 4.1,  size: 0.50, type: 'ice',   tilt: 0.2, hasRings: true, ringColor: '#88ccff', hasAtmosphere: true, atmosphereColor: '#88ccff' },
  { orbitRadius: 14, orbitSpeed: 0.13, initAngle: 5.5,  size: 0.95, type: 'gas',   tilt: 0.4, hasRings: true, ringColor: '#ccaa88' },
  { orbitRadius: 16, orbitSpeed: 0.10, initAngle: 0.9,  size: 0.35, type: 'rocky', tilt: 0.15 },
  { orbitRadius: 18, orbitSpeed: 0.07, initAngle: 3.3,  size: 0.60, type: 'gas',   tilt: 0.6, hasAtmosphere: true, atmosphereColor: '#88ffaa' },
  { orbitRadius: 20, orbitSpeed: 0.04, initAngle: 2.0,  size: 0.48, type: 'ice',   tilt: 0.35, hasAtmosphere: true, atmosphereColor: '#aaddff' },
];

function OrbitingPlanet({ data }: { data: PlanetData }) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => makePlanetTex(data.type), [data.type]);
  const angle = useRef(data.initAngle);

  useFrame((_, delta) => {
    if (!groupRef) return;
    angle.current += delta * data.orbitSpeed;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle.current) * data.orbitRadius;
      groupRef.current.position.z = Math.sin(angle.current) * data.orbitRadius;
    }
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <group rotation={[data.tilt, 0, 0]}>
        <mesh ref={planetRef}>
          <sphereGeometry args={[data.size, 24, 24]} />
          <meshStandardMaterial map={tex} />
        </mesh>
        {data.hasAtmosphere && (
          <mesh>
            <sphereGeometry args={[data.size * 1.08, 24, 24]} />
            <meshBasicMaterial
              color={data.atmosphereColor}
              transparent
              opacity={0.12}
              depthWrite={false}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}
        {data.hasRings && (
          <mesh rotation={[Math.PI * 0.3, 0, 0]}>
            <ringGeometry args={[data.size * 1.4, data.size * 2.2, 48]} />
            <meshBasicMaterial
              color={data.ringColor || '#ffffff'}
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

export function Planets() {
  return (
    <>
      {PLANET_DATA.map((data, i) => (
        <OrbitingPlanet key={i} data={data} />
      ))}
    </>
  );
}

// ==================== Comets ====================

interface CometGeo {
  geometry: THREE.BufferGeometry;
  tailGeo: THREE.BufferGeometry;
}

function makeComet(): CometGeo {
  // Coma core — 200 particles
  const cp = new Float32Array(200 * 3);
  for (let i = 0; i < 200; i++) {
    const r = Math.random() ** 1.5 * 0.35;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    cp[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    cp[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    cp[i * 3 + 2] = r * Math.cos(phi);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(cp, 3));

  // Tail — 600 particles
  const tailCount = 600;
  const tp = new Float32Array(tailCount * 3);
  const to = new Float32Array(tailCount);
  for (let i = 0; i < tailCount; i++) {
    const t = Math.random() ** 0.4;
    const spread = 0.04 + t * 0.18;
    tp[i * 3] = -t * 3.0 + (Math.random() - 0.5) * spread;
    tp[i * 3 + 1] = (Math.random() - 0.5) * spread;
    tp[i * 3 + 2] = (Math.random() - 0.5) * spread;
    to[i] = 1 - t * 0.92;
  }
  const tg = new THREE.BufferGeometry();
  tg.setAttribute('position', new THREE.BufferAttribute(tp, 3));
  tg.setAttribute('opacity', new THREE.BufferAttribute(to, 1));

  return { geometry: g, tailGeo: tg };
}

export function Comets() {
  const glowTex = useMemo(() => makeGlowTex(), []);
  const comets = useMemo(() => {
    const colors = ['#88ddff', '#ff8866', '#88ffaa', '#ff88cc', '#aaccff'];
    return Array.from({ length: 8 }, () => ({
      ...makeComet(),
      speed: 0.06 + Math.random() * 0.12,
      angle: Math.random() * Math.PI * 2,
      height: (Math.random() - 0.5) * 18,
      radius: 12 + Math.random() * 18,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, []);

  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame((_, delta) => {
    for (let i = 0; i < comets.length; i++) {
      const g = refs.current[i];
      if (!g) continue;
      const c = comets[i];
      c.angle += delta * c.speed;
      g.position.x = Math.cos(c.angle) * c.radius;
      g.position.z = Math.sin(c.angle) * c.radius;
      g.position.y = c.height + Math.sin(c.angle * 0.4) * 4;
      g.lookAt(0, 0, 0);
    }
  });

  return (
    <>
      {comets.map((c, i) => (
        <group key={i} ref={(el: THREE.Group | null) => { refs.current[i] = el; }}>
          <points geometry={c.tailGeo}>
            <pointsMaterial
              size={0.08}
              map={glowTex}
              transparent
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              color={c.color}
              opacity={0.25}
              sizeAttenuation
            />
          </points>
          <points geometry={c.geometry}>
            <pointsMaterial
              size={0.12}
              map={glowTex}
              transparent
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              color={c.color}
              opacity={0.6}
              sizeAttenuation
            />
          </points>
        </group>
      ))}
    </>
  );
}

// ==================== Meteors ====================

function makeMeteor(): THREE.BufferGeometry {
  const count = 60;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = i / count;
    pos[i * 3] = -t * 1.5 + (Math.random() - 0.5) * 0.1;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return geo;
}

interface MeteorState {
  geo: THREE.BufferGeometry;
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  life: number;
}

export function Meteors() {
  const glowTex = useMemo(() => makeGlowTex(), []);
  const meteors = useMemo<MeteorState[]>(() =>
    Array.from({ length: 12 }, () => {
      const geo = makeMeteor();
      const angle = Math.random() * Math.PI * 2;
      return {
        geo,
        x: (Math.random() - 0.5) * 50, y: 15 + Math.random() * 10, z: (Math.random() - 0.5) * 50,
        vx: Math.cos(angle) * (3 + Math.random() * 5), vy: -(5 + Math.random() * 5), vz: Math.sin(angle) * (3 + Math.random() * 5),
        life: Math.random() * 100,
      };
    }), []);

  const refs = useRef<(THREE.Points | null)[]>([]);
  useFrame((_, delta) => {
    for (let i = 0; i < meteors.length; i++) {
      const m = meteors[i];
      m.life += delta;
      m.x += m.vx * delta;
      m.y += m.vy * delta;
      m.z += m.vz * delta;
      if (m.y < -8 || m.life > 6) {
        const angle = Math.random() * Math.PI * 2;
        m.x = (Math.random() - 0.5) * 50;
        m.y = 15 + Math.random() * 10;
        m.z = (Math.random() - 0.5) * 50;
        m.vx = Math.cos(angle) * (3 + Math.random() * 5);
        m.vy = -(5 + Math.random() * 5);
        m.vz = Math.sin(angle) * (3 + Math.random() * 5);
        m.life = 0;
      }
      if (refs.current[i]) refs.current[i]!.position.set(m.x, m.y, m.z);
    }
  });

  return (
    <>
      {meteors.map((m, i) => (
        <points
          key={i}
          ref={(el: THREE.Points | null) => { refs.current[i] = el; }}
          geometry={m.geo}
        >
          <pointsMaterial
            size={0.07}
            map={glowTex}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            color="#ffcc88"
            opacity={0.8}
            sizeAttenuation
          />
        </points>
      ))}
    </>
  );
}
