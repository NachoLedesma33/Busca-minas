import { useRef, useEffect } from 'react'
import * as THREE from 'three'

const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch {
    return false
  }
}

const QUALITY_SETTINGS = {
  low: { pixelRatio: 0.5, precision: 'mediump', octaves: 3 },
  medium: { pixelRatio: 0.75, precision: 'mediump', octaves: 4 },
  high: { pixelRatio: 1.5, precision: 'highp', octaves: 5 },
  ultra: { pixelRatio: 2, precision: 'highp', octaves: 6 },
}

function getQuality() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isLowEnd = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
  if (isLowEnd || isMobile) return 'low'
  return 'high'
}

const DARK_COLORS = {
  aurora: ['#0a1628', '#1a3a52', '#2d5f7e', '#45a29e', '#66fcf1'],
  cosmic: ['#0d0221', '#240046', '#3c096c', '#5a189a', '#9d4edd'],
  neon: ['#000000', '#ff006e', '#fb5607', '#ffbe0b', '#8338ec'],
}

const LIGHT_COLORS = {
  aurora: ['#d4ecf8', '#7cc4e8', '#4da6d4', '#3aa8a0', '#66fcf1'],
  cosmic: ['#e6d4ff', '#b88aff', '#8c5aff', '#6b3cff', '#9d4edd'],
  neon: ['#ffffff', '#ff6bb5', '#fb8807', '#ffd600', '#8338ec'],
}

export default function CosmicBackground({ variant = 'aurora', lightMode = false, intensity = 1.0, speed = 0.6 }) {
  const containerRef = useRef(null)
  const rafRef = useRef(null)
  const rendererRef = useRef(null)
  const materialRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5))
  const targetMouseRef = useRef(new THREE.Vector2(0.5, 0.5))
  const timeRef = useRef(0)

  useEffect(() => {
    if (!containerRef.current || !checkWebGLSupport()) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight
    const quality = getQuality()
    const settings = QUALITY_SETTINGS[quality]
    const effectiveQuality = quality

    const scene = new THREE.Scene()
    sceneRef.current = scene
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    cameraRef.current = camera

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: effectiveQuality === 'ultra',
        alpha: true,
        powerPreference: effectiveQuality === 'low' ? 'low-power' : 'high-performance',
        precision: settings.precision,
        stencil: false,
        depth: false,
      })
    } catch {
      return
    }

    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.pixelRatio))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      precision ${settings.precision} float;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform vec3 uColors[5];
      uniform float uIntensity;
      uniform float uSpeed;
      uniform float uGlowIntensity;
      uniform bool uInteractive;
      varying vec2 vUv;

      const float PI = 3.14159265359;
      const float TAU = 6.28318530718;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for(int i = 0; i < ${settings.octaves}; i++) {
          value += amplitude * snoise(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      vec2 domainWarp(vec2 p, float time) {
        float warp1 = fbm(p + time * 0.1);
        float warp2 = fbm(p + vec2(warp1 * 4.0) + time * 0.15);
        return p + vec2(warp1, warp2) * 0.3;
      }

      vec3 palette(float t) {
        vec3 a = uColors[0];
        vec3 b = uColors[1];
        vec3 c = uColors[2];
        vec3 d = uColors[3];
        vec3 e = uColors[4];
        float step1 = smoothstep(0.0, 0.25, t);
        float step2 = smoothstep(0.25, 0.5, t);
        float step3 = smoothstep(0.5, 0.75, t);
        float step4 = smoothstep(0.75, 1.0, t);
        vec3 color = mix(a, b, step1);
        color = mix(color, c, step2);
        color = mix(color, d, step3);
        color = mix(color, e, step4);
        return color;
      }

      void main() {
        vec2 uv = vUv;
        vec2 p = (uv - 0.5) * 2.0;
        p.x *= uResolution.x / uResolution.y;
        vec2 mouseInfluence = vec2(0.0);
        if(uInteractive) {
          vec2 mousePos = (uMouse - 0.5) * 2.0;
          mousePos.x *= uResolution.x / uResolution.y;
          float mouseDist = length(p - mousePos);
          mouseInfluence = (mousePos - p) * (0.3 / (mouseDist + 0.5));
        }
        vec2 warpedP = domainWarp(p + mouseInfluence, uTime * uSpeed);
        float pattern = 0.0;
        float amplitude = 1.0;
        for(int i = 0; i < 4; i++) {
          float freq = pow(2.0, float(i));
          float timeOffset = uTime * uSpeed * (0.3 + float(i) * 0.1);
          vec2 offset = vec2(cos(timeOffset + float(i)), sin(timeOffset * 1.3 + float(i))) * 0.5;
          float wave = fbm((warpedP + offset) * freq * 3.5);
          pattern += wave * amplitude;
          amplitude *= 0.6;
        }
        pattern = pattern * 0.5 + 0.5;
        float radialGrad = 1.0 - length(p) * 0.4;
        pattern *= radialGrad;
        vec3 color = palette(pattern);

        float glow = pow(pattern, 2.0) * uGlowIntensity;
        color += glow * 0.5;

        color *= uIntensity;
        float grain = fract(sin(dot(uv * uTime, vec2(12.9898, 78.233))) * 43758.5453);
        color -= grain * 0.03;
        gl_FragColor = vec4(color, 1.0);
      }
    `

    const parseColor = (hex) => {
      const c = new THREE.Color(hex)
      return new THREE.Vector3(c.r, c.g, c.b)
    }

    const colors = (lightMode ? LIGHT_COLORS : DARK_COLORS)[variant].map(parseColor)

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uMouse: { value: mouseRef.current },
        uColors: { value: colors },
        uIntensity: { value: intensity },
        uSpeed: { value: speed * 0.15 },
        uGlowIntensity: { value: lightMode ? 0.6 : 1.8 },
        uInteractive: { value: true },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    })
    materialRef.current = material

    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect()
      targetMouseRef.current.set(
        (event.clientX - rect.left) / rect.width,
        1.0 - (event.clientY - rect.top) / rect.height,
      )
    }

    container.addEventListener('mousemove', handleMouseMove, { passive: true })

    const animate = () => {
      if (!materialRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return
      timeRef.current += 0.016
      materialRef.current.uniforms.uTime.value = timeRef.current
      mouseRef.current.lerp(targetMouseRef.current, 0.1)
      rendererRef.current.render(sceneRef.current, cameraRef.current)
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    let resizeTimeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        if (!rendererRef.current || !materialRef.current || !containerRef.current) return
        const w = containerRef.current.clientWidth
        const h = containerRef.current.clientHeight
        rendererRef.current.setSize(w, h)
        materialRef.current.uniforms.uResolution.value.set(w, h)
      }, 150)
    }

    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('mousemove', handleMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (rendererRef.current) {
        rendererRef.current.dispose()
        rendererRef.current.forceContextLoss()
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement)
        }
      }
      if (materialRef.current) materialRef.current.dispose()
      geometry.dispose()
    }
  }, [variant, intensity, speed])

  useEffect(() => {
    if (!materialRef.current) return
    const parseColor = (hex) => {
      const c = new THREE.Color(hex)
      return new THREE.Vector3(c.r, c.g, c.b)
    }
    const colors = (lightMode ? LIGHT_COLORS : DARK_COLORS)[variant].map(parseColor)
    materialRef.current.uniforms.uColors.value = colors
    materialRef.current.uniforms.uGlowIntensity.value = lightMode ? 0.6 : 1.8
  }, [lightMode, variant])

  if (!checkWebGLSupport()) {
    return null
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
