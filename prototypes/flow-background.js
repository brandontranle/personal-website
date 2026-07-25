// Flowing liquid background — Three.js full-screen plane.
// Multiple "concepts" share the same uniforms & canvas; switching concepts
// swaps the material with a new fragment shader.
// Exposes window.FlowBG = { init, setConcept, setPalette, setSpeed, setGrain, PALETTES, CONCEPTS }
(function () {
  const VERTEX = /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  // Shared GLSL helpers prepended to each concept's fragment body
  const COMMON = /* glsl */`
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2  uResolution;
    uniform vec2  uMouse;
    uniform float uSpeed;
    uniform float uGrain;
    uniform vec3  uColA;
    uniform vec3  uColB;
    uniform vec3  uColC;
    uniform vec3  uColD;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 6; i++) {
        v += a * noise(p);
        p *= 2.02;
        a *= 0.5;
      }
      return v;
    }
    float fbm4(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p *= 2.02;
        a *= 0.5;
      }
      return v;
    }

    vec3 vignetteAndGrain(vec3 col, vec2 uv) {
      vec2 cv = uv - 0.5;
      float vign = smoothstep(0.95, 0.25, length(cv));
      col *= mix(0.55, 1.0, vign);
      float g = (hash(uv * uResolution + uTime) - 0.5) * uGrain;
      col += g;
      col = pow(max(col, 0.0), vec3(0.92));
      return col;
    }
  `;

  // --- Concept 1: MARBLE (domain-warped FBM, the original) ----------------
  const FRAG_MARBLE = COMMON + /* glsl */`
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 p = vec2(uv.x * aspect, uv.y);

      float t = uTime * 0.04 * uSpeed;

      vec2 m = vec2(uMouse.x * aspect, uMouse.y);
      vec2 toM = (m - p);
      float md = length(toM);
      vec2 mouseWarp = toM * exp(-md * 2.2) * 0.18;

      vec2 q = vec2(
        fbm(p + vec2(0.0, t)),
        fbm(p + vec2(5.2, 1.3) - t * 0.8)
      );
      vec2 r = vec2(
        fbm(p + 3.5 * q + vec2(1.7, 9.2) + t * 1.1),
        fbm(p + 3.5 * q + vec2(8.3, 2.8) + t * 0.7)
      );

      vec2 warped = p + 3.5 * r + mouseWarp;
      float f = fbm(warped);

      vec3 col = mix(uColA, uColB, smoothstep(0.15, 0.75, f));
      col = mix(col, uColC, smoothstep(0.55, 1.0, length(r) * 0.65));
      col = mix(col, uColD, smoothstep(0.65, 1.0, dot(q, q) * 1.1));

      float crest = smoothstep(0.70, 1.05, f + 0.25 * length(r));
      col += crest * 0.18 * uColC;

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept 2: AURORA (vertical light curtains) ------------------------
  const FRAG_AURORA = COMMON + /* glsl */`
    void main() {
      vec2 uv = vUv;
      float t = uTime * 0.05 * uSpeed;

      // mouse parallax: subtle horizontal shift
      float mx = (uMouse.x - 0.5) * 0.15;

      // Stretched y, animated x — produces tall vertical wisps
      vec2 p = vec2(uv.x * 2.4 + mx, uv.y * 0.7);
      float n1 = fbm(p + vec2(0.0, -t * 1.8));
      float n2 = fbm(p * 1.8 + vec2(3.3, -t * 2.4));
      float n3 = fbm(p * 3.1 + vec2(7.7, -t * 3.2));

      // curtains: brighter at top, fading down with vertical bias
      float topBias = pow(1.0 - uv.y, 1.6);
      float curtain1 = pow(smoothstep(0.30, 0.95, n1), 2.2) * topBias;
      float curtain2 = pow(smoothstep(0.40, 0.95, n2), 2.8) * topBias;
      float curtain3 = pow(smoothstep(0.55, 1.00, n3), 4.0);

      // base: deep gradient floor to mid sky
      float sky = smoothstep(0.0, 1.0, uv.y);
      vec3 base = mix(uColB * 0.35, uColA, 1.0 - sky);

      vec3 col = base;
      col += uColC * curtain1 * 0.95;
      col += uColD * curtain2 * 0.85;
      col += mix(uColC, uColD, 0.5) * curtain3 * 1.20;

      // tiny stars
      float star = step(0.997, hash(floor(uv * uResolution * 0.5)));
      col += vec3(star) * 0.6 * (0.5 + 0.5 * sin(uTime * 3.0 + hash(uv) * 30.0));

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept 3: CAUSTICS (refractive water-surface flows) ---------------
  const FRAG_CAUSTICS = COMMON + /* glsl */`
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 p = vec2(uv.x * aspect, uv.y) * 4.0;

      float t = uTime * 0.4 * uSpeed;
      vec2 mouseShift = (uMouse - 0.5) * 1.2;
      p += mouseShift;

      // Iterative sin/cos perturbation — classic caustic look
      vec2 q = p;
      for (int i = 0; i < 5; i++) {
        float fi = float(i) + 1.0;
        q.x += sin(q.y * 1.3 + t * 0.8 + fi * 1.7) * 0.55;
        q.y += cos(q.x * 1.2 - t * 0.7 + fi * 2.1) * 0.55;
      }

      float c = abs(sin(q.x * 0.9) * cos(q.y * 0.9));
      float bright = pow(1.0 - c, 5.0); // thin bright veins

      vec3 col = mix(uColA, uColB, 0.45);
      col = mix(col, uColC, bright * 1.2);
      col += uColD * pow(bright, 2.0) * 0.7;
      col += uColC * pow(bright, 4.0) * 1.4;

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept 4: MESH (slow drifting gradient blobs) ---------------------
  const FRAG_MESH = COMMON + /* glsl */`
    vec3 blob(vec2 p, vec2 c, float r, vec3 col) {
      float d = length(p - c);
      float w = exp(-d * d / (r * r));
      return col * w;
    }
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 p = vec2(uv.x * aspect, uv.y);
      float t = uTime * 0.06 * uSpeed;

      // mouse subtly tugs the first blob
      vec2 mShift = (uMouse - 0.5) * 0.10;

      vec2 c1 = vec2(0.35 * aspect + 0.20 * sin(t * 1.1),       0.30 + 0.25 * cos(t * 0.9)) + mShift;
      vec2 c2 = vec2(0.75 * aspect + 0.18 * cos(t * 0.8 + 1.7), 0.70 + 0.22 * sin(t * 1.3 + 0.5));
      vec2 c3 = vec2(0.50 * aspect + 0.30 * sin(t * 0.7 + 3.2), 0.50 + 0.30 * cos(t * 0.6 + 2.4));
      vec2 c4 = vec2(0.20 * aspect + 0.15 * cos(t * 1.4 + 0.9), 0.85 + 0.10 * sin(t * 1.0 + 4.1));
      vec2 c5 = vec2(0.90 * aspect + 0.12 * sin(t * 0.9 + 2.6), 0.20 + 0.18 * cos(t * 1.2 + 1.3));

      vec3 col = uColA;
      col += blob(p, c1, 0.55 * aspect, uColB * 1.10);
      col += blob(p, c2, 0.48 * aspect, uColC * 0.95);
      col += blob(p, c3, 0.42 * aspect, uColD * 0.95);
      col += blob(p, c4, 0.35 * aspect, mix(uColB, uColC, 0.5) * 0.85);
      col += blob(p, c5, 0.30 * aspect, mix(uColC, uColD, 0.5) * 0.85);

      // soft FBM overlay to break up the smoothness
      float n = fbm4(p * 1.5 + t * 0.5);
      col *= 0.82 + 0.36 * n;

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept 6: PIXEL (chunky bayer-dithered flow grid) -----------------
  const FRAG_PIXEL = COMMON + /* glsl */`
    // 8x8 bayer matrix → smooth ordered dither between quantized levels
    float bayer(vec2 p) {
      vec2 ip = floor(mod(p, 8.0));
      float i = ip.y * 8.0 + ip.x;
      float v = 0.0;
      // hand-rolled bayer 8x8 via bit-twiddling-ish math (just a lookup-y formula)
      // Approximation: hash-based ordered dither close to Bayer
      v = fract(sin(i * 12.9898) * 43758.5453);
      return v;
    }
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);

      // chunky pixel cells — bigger at smaller speeds for retro feel
      vec2 cells = vec2(140.0, 80.0);
      vec2 pix = floor(uv * cells) / cells;
      vec2 pixCenter = (floor(uv * cells) + 0.5);
      vec2 p = vec2(pix.x * aspect, pix.y);
      float t = uTime * 0.06 * uSpeed;

      vec2 mShift = (uMouse - 0.5) * 0.3;
      // domain-warped fbm at the cell center
      vec2 q = vec2(fbm(p * 2.0 + vec2(0.0, t)), fbm(p * 2.0 + vec2(5.2, -t)));
      float f = fbm(p * 2.0 + 2.0 * q + mShift);

      // ordered dither + quantize to 6 levels
      float d = bayer(pixCenter) - 0.5;
      float steps = floor(clamp(f + d * 0.16, 0.0, 1.0) * 6.0) / 6.0;

      vec3 col = mix(uColA, uColB, smoothstep(0.0, 0.55, steps));
      col = mix(col, uColC, smoothstep(0.5, 0.85, steps));
      col = mix(col, uColD, smoothstep(0.8, 1.0, steps));

      // scanline-ish dim between cells (very subtle)
      vec2 inCell = fract(uv * cells);
      float edge = smoothstep(0.0, 0.06, min(inCell.x, inCell.y)) *
                   smoothstep(0.0, 0.06, min(1.0 - inCell.x, 1.0 - inCell.y));
      col *= mix(0.85, 1.0, edge);

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept 7: HALFTONE (dot-grid sized by flow) -----------------------
  const FRAG_HALFTONE = COMMON + /* glsl */`
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      float t = uTime * 0.08 * uSpeed;

      vec2 cells = vec2(110.0 * aspect / 1.6, 110.0);
      vec2 cellId = floor(uv * cells);
      vec2 inCell = fract(uv * cells) - 0.5;
      vec2 cellCenter = (cellId + 0.5) / cells;

      // flow value at the cell
      vec2 mShift = (uMouse - 0.5) * 0.3;
      vec2 cp = vec2(cellCenter.x * aspect, cellCenter.y);
      vec2 q = vec2(fbm(cp * 1.8 + vec2(0.0, t)),
                    fbm(cp * 1.8 + vec2(3.2, -t * 0.9)));
      float f = fbm(cp * 1.8 + 2.4 * q + mShift);

      // dot radius based on f
      float radius = mix(0.04, 0.55, smoothstep(0.1, 0.9, f));
      float dist = length(inCell);
      float dot = smoothstep(radius, radius - 0.03, dist);

      // background gradient between A and B
      vec3 bg = mix(uColA, uColB * 0.5, smoothstep(0.0, 1.0, uv.y));
      // dot color shifts with flow intensity
      vec3 dotCol = mix(uColC, uColD, smoothstep(0.5, 0.95, f));

      vec3 col = mix(bg, dotCol, dot);

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept 11: INK (sumi-e ink-in-water blooms on warm paper) ---------
  const FRAG_INK = COMMON + /* glsl */`
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 p = vec2(uv.x * aspect, uv.y) * 1.6;
      float t = uTime * 0.05 * uSpeed;

      // mouse drops an ink seed
      vec2 mShift = (uMouse - 0.5) * vec2(aspect, 1.0);

      // domain-warped FBM, two octaves of warp for organic ink bloom
      vec2 q1 = vec2(fbm(p + vec2(0.0, t)),     fbm(p + vec2(4.7, -t * 0.8)));
      vec2 q2 = vec2(fbm(p + 2.0 * q1 + vec2(1.3, t * 1.1)),
                     fbm(p + 2.0 * q1 + vec2(6.4, -t * 0.6)));
      float n = fbm(p + 3.2 * q2 + mShift * 0.5);

      // sharp ink threshold; feather edges via fwidth for crisp wet-edge feel
      float ink = smoothstep(0.45, 0.78, n);
      float wetEdge = smoothstep(0.42, 0.45, n) - smoothstep(0.78, 0.82, n);

      // paper base (warm cream) → ink (dark)
      vec3 paper = uColA;
      vec3 inkCol = uColB;
      vec3 col = mix(paper, inkCol, ink);

      // wet-edge ring darker still
      col = mix(col, uColD * 0.6 + inkCol * 0.4, wetEdge * 0.55);

      // accent: a tiny touch of color where ink is thickest
      col = mix(col, uColC * 0.85 + inkCol * 0.15,
                smoothstep(0.85, 0.98, n) * 0.35);

      // paper grain (warmer)
      float pg = hash(uv * uResolution * 0.5) - 0.5;
      col += pg * 0.02;

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept 12: PLASMA (classic flowing neon plasma) -------------------
  const FRAG_PLASMA = COMMON + /* glsl */`
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * 5.0;
      float t = uTime * 0.45 * uSpeed;

      p -= (uMouse - 0.5) * 1.6;

      // classic plasma: sum of sin waves + radial pulse
      float v = 0.0;
      v += sin(p.x * 1.3 + t);
      v += sin(p.y * 1.7 - t * 1.1);
      v += sin((p.x + p.y) * 0.9 + t * 0.7);
      v += sin(length(p) * 1.8 - t * 1.4);
      v += sin(length(p + vec2(sin(t*0.6)*2.0, cos(t*0.5)*2.0)) * 1.2 - t);
      v *= 0.2;

      // map plasma value (-1..1) into hue position
      float h = v * 0.5 + 0.5;

      // smooth gradient across all 4 palette colors
      vec3 col = mix(uColA, uColB, smoothstep(0.0, 0.4, h));
      col = mix(col, uColC, smoothstep(0.35, 0.75, h));
      col = mix(col, uColD, smoothstep(0.7, 1.0, h));

      // hot crests glow brightly (additive)
      float crest = pow(smoothstep(0.78, 1.0, h), 2.0);
      col += uColC * crest * 0.7;
      col += uColD * crest * crest * 0.6;

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept 13: STRATA (geological banded layers, warped) --------------
  const FRAG_STRATA = COMMON + /* glsl */`
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 p = vec2(uv.x * aspect, uv.y);
      float t = uTime * 0.03 * uSpeed;

      // gently bend the y-axis with horizontal fbm — wavy sedimentary bands
      vec2 mShift = (uMouse - 0.5) * 0.25;
      float warp = fbm(p * vec2(1.2, 2.4) + vec2(t, 0.0)) * 0.55
                 + fbm(p * vec2(0.5, 5.0) - vec2(0.0, t * 1.4)) * 0.30;
      float y = p.y * 1.8 + warp + mShift.y;

      // banded fbm pattern: high-freq y noise, slow x drift
      float bands = fbm(vec2(p.x * 0.7 + t * 0.4, y * 6.0));
      // hard quantize to give layered look, with thin lines between
      float layers = floor(bands * 7.0) / 7.0;
      float line = abs(fract(bands * 7.0) - 0.5);
      float seam = smoothstep(0.04, 0.0, line);

      // tint each layer differently
      vec3 col = mix(uColA, uColB, smoothstep(0.0, 0.5, layers));
      col = mix(col, uColD * 0.85, smoothstep(0.45, 0.85, layers));
      col = mix(col, uColC, smoothstep(0.82, 1.0, layers));

      // seams: thin darker fissures
      col *= mix(1.0, 0.55, seam);

      // subtle vertical light streak (overall illumination)
      col *= mix(0.78, 1.08, smoothstep(0.0, 1.0, 1.0 - uv.y));

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept 15: LINEWORK (flowing crosshatched ink lines) --------------
  const FRAG_LINEWORK = COMMON + /* glsl */`
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 p = vec2(uv.x * aspect, uv.y);
      float t = uTime * 0.04 * uSpeed;

      vec2 mShift = (uMouse - 0.5) * 0.3;
      // a slowly-varying flow value drives the line angle
      vec2 q = vec2(fbm(p * 1.4 + vec2(0.0, t)), fbm(p * 1.4 + vec2(4.7, -t)));
      float n = fbm(p * 1.4 + 1.8 * q + mShift);

      // a flow angle from the gradient of n (approx via offset sampling)
      float e = 0.012;
      float nx = fbm((p + vec2(e, 0.0)) * 1.4 + 1.8 * q) - n;
      float ny = fbm((p + vec2(0.0, e)) * 1.4 + 1.8 * q) - n;
      float ang = atan(ny, nx);

      // rotate space by the flow angle, sample tight stripes — they curve with flow
      float ca = cos(ang), sa = sin(ang);
      vec2 rp = vec2(ca * p.x + sa * p.y, -sa * p.x + ca * p.y);
      float density = 60.0;
      float stripe = abs(fract(rp.y * density + t * 1.2) - 0.5) * 2.0;

      // also crosshatch in the shadows
      vec2 rp2 = vec2(ca * p.x - sa * p.y, sa * p.x + ca * p.y);
      float stripe2 = abs(fract(rp2.y * density * 0.9 - t * 0.8) - 0.5) * 2.0;

      // line presence depends on tonal value n
      float tone = smoothstep(0.25, 0.85, n);
      float line1 = smoothstep(0.6 - tone * 0.4, 0.8 - tone * 0.4, 1.0 - stripe);
      float line2 = smoothstep(0.78 - tone * 0.5, 0.95 - tone * 0.5, 1.0 - stripe2);
      float lines = max(line1, line2 * smoothstep(0.5, 1.0, tone));

      // paper → ink with a faint mid-tone wash
      vec3 paper = uColA;
      vec3 wash  = mix(paper, uColB, 0.35);
      vec3 ink   = uColB;
      vec3 col = mix(paper, wash, smoothstep(0.1, 0.6, tone));
      col = mix(col, ink, lines);

      // a hint of accent color in the deepest shadows
      col = mix(col, mix(ink, uColD, 0.55),
                lines * smoothstep(0.75, 1.0, tone) * 0.5);

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept 16: PETALS (radial flower-bloom with kaleidoscopic petals) -
  const FRAG_PETALS = COMMON + /* glsl */`
    #define PI 3.14159265
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 cv = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
      cv -= (uMouse - 0.5) * 0.18;

      float r = length(cv);
      float a = atan(cv.y, cv.x);
      float t = uTime * 0.06 * uSpeed;

      // multi-layered petals: 5, 8, 13 (fibonacci-ish), each turning
      float layer1 = 0.5 + 0.5 * cos(a *  5.0 + t * 1.2 + sin(r * 4.0 - t) * 0.7);
      float layer2 = 0.5 + 0.5 * cos(a *  8.0 - t * 0.9 + sin(r * 5.0 + t * 1.1) * 0.6);
      float layer3 = 0.5 + 0.5 * cos(a * 13.0 + t * 0.5 + sin(r * 7.0 - t * 0.7) * 0.4);

      // radial falloff for each layer at different radii
      float rad1 = smoothstep(0.55, 0.10, r);
      float rad2 = smoothstep(0.65, 0.25, r);
      float rad3 = smoothstep(0.75, 0.35, r);
      float p1 = pow(layer1, 1.6) * rad1;
      float p2 = pow(layer2, 2.0) * rad2;
      float p3 = pow(layer3, 2.6) * rad3;

      // base radial gradient (deep → glow)
      vec3 base = mix(uColA, mix(uColA, uColB, 0.55), smoothstep(0.8, 0.0, r));

      vec3 col = base;
      col += uColB * p3 * 0.55;
      col += uColC * p2 * 0.85;
      col += uColD * p1 * 1.10;

      // bright pollen-like core
      float core = smoothstep(0.12, 0.0, r);
      col += (uColD * 0.4 + uColC * 0.6) * core * 1.0;

      // soft fbm overlay to break perfection
      float n = fbm(vec2(a * 1.5, r * 4.0) + t);
      col *= 0.86 + 0.28 * n;

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept 10: TOPO (contour-line topographic map) --------------------
  const FRAG_TOPO = COMMON + /* glsl */`
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 p = vec2(uv.x * aspect, uv.y);
      float t = uTime * 0.04 * uSpeed;

      vec2 mShift = (uMouse - 0.5) * 0.4;
      // big rolling terrain via FBM
      vec2 q = vec2(fbm(p * 1.2 + vec2(0.0, t)), fbm(p * 1.2 + vec2(4.2, -t * 0.6)));
      float h = fbm(p * 1.2 + 1.8 * q + mShift);  // height field 0..1

      // base elevation tinting
      vec3 col = mix(uColA, uColB, smoothstep(0.15, 0.6, h));
      col = mix(col, uColD * 0.55, smoothstep(0.7, 1.0, h));

      // contour lines via fwidth-aware quantization
      float lines = 14.0;
      float band = fract(h * lines);
      float d = abs(band - 0.5);
      float w = fwidth(h * lines);
      float thin = smoothstep(0.5, 0.5 - w * 1.4, d);
      // major contour every 5
      float majorBand = fract(h * (lines / 5.0));
      float dM = abs(majorBand - 0.5);
      float wM = fwidth(h * (lines / 5.0));
      float thick = smoothstep(0.5, 0.5 - wM * 1.8, dM);

      col += uColC * thin * 0.55;
      col += uColC * thick * 0.85;

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept 18: ASCII (flow field rendered as ASCII glyphs) ------------
  const FRAG_ASCII = COMMON + /* glsl */`
    // 1 only if t ≈ target (within ±0.5)
    float pick(float t, float target) {
      return step(target - 0.5, t) * step(t, target + 0.5);
    }
    // glyph mask in cell-local coords inCell ∈ [-0.5, 0.5], for tier 0..7
    float glyph(vec2 inCell, float tier) {
      float r = length(inCell);
      float ax = abs(inCell.x);
      float ay = abs(inCell.y);
      // 1: dot
      float gDot = smoothstep(0.10, 0.05, r);
      // 2: colon (two stacked dots)
      float gColon = max(smoothstep(0.09, 0.04, length(inCell - vec2(0.0, 0.16))),
                         smoothstep(0.09, 0.04, length(inCell + vec2(0.0, 0.16))));
      // 3: plus
      float gPlus = step(min(ax, ay), 0.05) * step(max(ax, ay), 0.30);
      // 4: asterisk (plus + diagonals)
      float gStar = max(gPlus,
                        step(abs(ax - ay), 0.06) * step(r, 0.30));
      // 5: hash (two horizontals + two verticals)
      float gHash = step(min(abs(ax - 0.13), abs(ay - 0.13)), 0.04)
                  * step(max(ax, ay), 0.32);
      // 6: diamond ring
      float dia = ax + ay;
      float gDia = step(dia, 0.32) * (1.0 - step(dia, 0.22));
      // 7: filled block
      float gFill = step(max(ax, ay), 0.36);

      return clamp(
          gDot   * pick(tier, 1.0)
        + gColon * pick(tier, 2.0)
        + gPlus  * pick(tier, 3.0)
        + gStar  * pick(tier, 4.0)
        + gHash  * pick(tier, 5.0)
        + gDia   * pick(tier, 6.0)
        + gFill  * pick(tier, 7.0),
        0.0, 1.0);
    }
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      float t = uTime * 0.06 * uSpeed;

      vec2 cells = vec2(130.0, 60.0);
      vec2 cellId = floor(uv * cells);
      vec2 inCell = fract(uv * cells) - 0.5;
      vec2 cp = (cellId + 0.5) / cells;

      vec2 mShift = (uMouse - 0.5) * 0.4;
      vec2 p = vec2(cp.x * aspect, cp.y) * 2.2;
      vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, -t)));
      float n = fbm(p + 2.0 * q + mShift);

      // 8 density tiers (0=blank .. 7=full)
      float tier = floor(clamp(n * 8.0, 0.0, 7.99));
      float m = glyph(inCell, tier);

      // background: very dark with a soft gradient
      vec3 bg = mix(uColA * 0.6, uColA, smoothstep(0.0, 1.0, uv.y));
      vec3 glyphCol = mix(uColB, uColC, smoothstep(2.0, 6.0, tier));
      glyphCol = mix(glyphCol, uColD, smoothstep(5.0, 7.5, tier));

      vec3 col = mix(bg, glyphCol, m);

      // occasional "cursor" highlight: a random column briefly brightens
      float cursorPick = step(0.992, hash(vec2(cellId.x, floor(t * 6.0))));
      col += vec3(0.10) * cursorPick * step(0.5, m);

      // a couple very faint horizontal "scanline" bars sweeping
      float scan = smoothstep(0.005, 0.0, abs(fract(uv.y - t * 0.08) - 0.5) - 0.49);
      col += uColC * scan * 0.05;

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept 22: GLITCH (CRT/datamosh with chromatic aberration) --------
  const FRAG_GLITCH = COMMON + /* glsl */`
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      float t = uTime * 0.35 * uSpeed;

      // datamosh horizontal band shifts
      float bandID  = floor(uv.y * 32.0);
      float bandRng = hash(vec2(bandID * 1.3, floor(t * 1.5)));
      float bandShift = (hash(vec2(bandID, floor(t * 3.0))) - 0.5) * 0.14;
      bandShift *= step(0.86, bandRng);

      vec2 uvs = uv;
      uvs.x += bandShift;
      uvs.x += (uMouse.x - 0.5) * 0.04;

      // 3 channels sampled at slightly different x → chromatic aberration
      float ca = 0.006 + 0.012 * abs(uv.y - 0.5);
      vec2 q = vec2(uvs.x * aspect, uvs.y) * 2.2;
      float r = fbm(q + vec2( ca, t));
      float g = fbm(q + vec2(0.0, t));
      float b = fbm(q + vec2(-ca, t));

      vec3 rCol = mix(uColA, uColC, r);
      vec3 gCol = mix(uColA, uColB, g);
      vec3 bCol = mix(uColA, uColD, b);
      vec3 col = vec3(rCol.r, gCol.g, bCol.b);

      // scanlines
      float scan = 0.82 + 0.18 * sin(uv.y * uResolution.y * 3.14159);
      col *= scan;

      // periodic flicker
      float flicker = step(0.95, hash(vec2(floor(t * 9.0), 0.0)));
      col *= 1.0 + flicker * 0.18 * sin(uv.y * 60.0);

      // occasional vertical tear bar
      float tearGate = step(0.985, hash(vec2(floor(t * 2.0), 13.7)));
      float tearCol = step(0.5, hash(vec2(floor(uv.x * 40.0), floor(t * 2.0))));
      col.r += tearGate * tearCol * 0.3;

      // soft CRT curvature darkening
      vec2 cv = uv - 0.5;
      col *= 1.0 - dot(cv, cv) * 0.45;

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept: CITY GRID (1-bit halftone pixel cells, dense → sparse) -----
  const FRAG_CITY_GRID = COMMON + /* glsl */`
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      float t = uTime * 0.06 * uSpeed;

      // tight uniform pixel cells
      vec2 cells = vec2(90.0 * aspect / 1.6, 90.0);
      vec2 cellId = floor(uv * cells);
      vec2 inCell = fract(uv * cells) - 0.5;
      vec2 cp = (cellId + 0.5) / cells;

      // slowly flowing density field
      vec2 mShift = (uMouse - 0.5) * 0.4;
      vec2 p = vec2(cp.x * aspect, cp.y) * 1.3;
      vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(4.7, -t)));
      float n = fbm(p + 1.6 * q + mShift);

      // density biased right (0 on left, ~1 on far right)
      float xBias = smoothstep(0.05, 1.05, cp.x);
      float yBias = smoothstep(-0.2, 1.0, cp.y) * 0.35;
      float density = clamp(xBias + yBias * 0.4 + (n - 0.5) * 0.55, 0.0, 1.0);

      // 1-bit dither: each cell is ON if its hash falls under the density
      float cellH = hash(cellId * 1.13 + 7.7);
      float lit   = step(cellH, density);

      // small uniform square inside each cell (gap between cells)
      float sqHalf = 0.34;
      float square = step(max(abs(inCell.x), abs(inCell.y)), sqHalf);

      // per-cell brightness variation — sparse cells punch brighter
      float bH      = hash(cellId * 2.31 + 3.1);
      float bright  = mix(0.65, 1.25, bH);
      float sparkle = step(0.92, bH);
      bright += sparkle * 0.6;

      // very subtle breathing per cell
      float breathe = 0.92 + 0.08 * sin(t * 1.8 + cellH * 30.0);

      vec3 bg = uColA * 0.08;
      vec3 neon = mix(uColB, uColD, 0.55);
      neon = mix(neon, uColC, sparkle * 0.45);
      neon *= bright * breathe;

      vec3 col = bg;
      col = mix(col, neon, lit * square);

      // dim glow leaking from lit cells
      float glow = lit * smoothstep(0.5, 0.0, length(inCell)) * 0.15;
      col += neon * glow;

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept: HALO (crimson blobs + lit ring, halftone overlay) ---------
  const FRAG_HALO = COMMON + /* glsl */`
    // smooth minimum (rounded blend between two SDFs)
    float smin(float a, float b, float k) {
      float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
      return mix(b, a, h) - k * h * (1.0 - h);
    }
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 p = vec2(uv.x * aspect, uv.y);
      float t = uTime * 0.05 * uSpeed;
      vec2 mShift = (uMouse - 0.5) * 0.12;

      // Two large blobs merging into one cloud, upper area
      vec2 b1 = vec2(0.22 * aspect, 0.78) + vec2(sin(t * 0.6) * 0.025, cos(t * 0.5) * 0.020) + mShift;
      vec2 b2 = vec2(0.52 * aspect, 0.88) + vec2(cos(t * 0.4) * 0.030, sin(t * 0.7) * 0.022) + mShift * 0.7;
      float d1 = length(p - b1) - 0.30;
      float d2 = length(p - b2) - 0.22;
      float blobSDF = smin(d1, d2, 0.20);

      // Big ring on the right
      vec2 ringC = vec2(0.80 * aspect + sin(t * 0.3) * 0.01,
                        0.42          + cos(t * 0.35) * 0.01) + mShift * 0.5;
      float ringR = 0.30;
      float ringD = length(p - ringC) - ringR;

      // Small interior blob in the lower portion of the ring's interior
      vec2 sb = vec2(0.85 * aspect, 0.30) + vec2(sin(t * 0.8) * 0.012, cos(t * 0.6) * 0.010) + mShift * 0.4;
      float sbD = length(p - sb) - 0.11;

      // --- intensities (sharp, well-contained) ---
      float blobIn   = smoothstep(0.02, -0.06, blobSDF);                  // solid interior
      float blobHalo = smoothstep(0.10, -0.02, blobSDF) * (1.0 - blobIn); // tight outer halo

      // Ring as a sharp thin band, only contributes near the boundary
      float ringBand = 1.0 - smoothstep(0.000, 0.013, abs(ringD));
      // Outer-only soft halo (just outside the ring)
      float ringOuterHalo = (1.0 - smoothstep(0.005, 0.045, ringD)) * step(0.0, ringD);
      // Inner-only soft darkening (just inside)
      float ringInner = smoothstep(0.0, -0.05, ringD);
      // Inner deep zone (well inside the ring)
      float ringDeepIn = smoothstep(-0.02, -0.10, ringD);

      // Small inner blob — only when actually inside the ring
      float sbIn = smoothstep(0.04, -0.04, sbD) * ringDeepIn;

      // Warm gold tip on the upper-left of the blob cloud
      float blobEdge = (1.0 - smoothstep(0.0, 0.012, abs(blobSDF))) * step(0.0, blobSDF);
      vec2 g = normalize(p - mix(b1, b2, 0.3) + 1e-5);
      float upperLeft = smoothstep(-0.4, -0.95, g.x - g.y);

      // --- colors (hard-coded for this design) ---
      vec3 navy    = vec3(0.030, 0.040, 0.090);
      vec3 deep    = vec3(0.018, 0.022, 0.055);
      vec3 pink    = vec3(0.82, 0.22, 0.38);
      vec3 hotPink = vec3(0.98, 0.32, 0.50);
      vec3 gold    = vec3(1.00, 0.78, 0.32);

      // Underlying smooth color
      vec3 col = navy;

      // Slight inner darkening behind the ring (lensing) BEFORE adding blobs
      col = mix(col, deep, ringDeepIn * 0.55);

      // Blobs (solid fill + outer halo)
      col = mix(col, pink, blobIn);
      col += hotPink * pow(blobIn, 1.4) * 0.30;
      col = mix(col, pink * 0.7, blobHalo * 0.45);

      // Tiny warm tip on the blob's upper-left edge
      col = mix(col, gold, blobEdge * upperLeft * 0.85);

      // Small pink blob inside the ring
      col = mix(col, pink, sbIn * 0.78);
      col += hotPink * pow(sbIn, 2.0) * 0.25;

      // Ring edge — sharp thin band, asymmetric brightness (top brighter)
      vec2 ringDir = normalize(p - ringC + 1e-5);
      float ringLit = 0.5 + 0.5 * dot(ringDir, normalize(vec2(0.45, 0.85)));
      col = mix(col, hotPink, ringBand * (0.40 + 0.55 * ringLit));
      col += vec3(1.0, 0.65, 0.78) * pow(ringBand, 2.0) * ringLit * 0.60;
      // a tiny gold flick on the very top arc
      col += gold * pow(ringBand, 3.0) * smoothstep(0.65, 1.0, ringLit) * 0.50;
      // Outer ring halo (soft pink bloom just outside the band)
      col += pink * ringOuterHalo * (0.20 + 0.50 * ringLit) * 0.45;

      // --- halftone screen overlay ---
      // The pattern is uniform across the frame; dot size scales with local color
      vec2 cells = vec2(240.0 * aspect / 1.6, 240.0);
      vec2 cellId = floor(uv * cells);
      vec2 inCell = fract(uv * cells) - 0.5;

      float lum = dot(col, vec3(0.299, 0.587, 0.114));
      float dotR = mix(0.05, 0.46, smoothstep(0.020, 0.50, lum));
      float dot = smoothstep(dotR, dotR - 0.05, length(inCell));

      // Composite: dark navy gap, dot tiles take the local color slightly lifted
      vec3 gap = deep * 0.85 + vec3(0.005);
      vec3 dotCol = col * 1.18;
      vec3 outCol = mix(gap, dotCol, dot);

      // Subtle film grain
      outCol += (hash(uv * uResolution + t * 30.0) - 0.5) * 0.022;

      // Soft outer vignette
      vec2 cv = uv - 0.5;
      outCol *= mix(0.78, 1.0, smoothstep(1.05, 0.0, length(cv) * 1.25));

      gl_FragColor = vec4(outCol, 1.0);
    }
  `;

  // --- Concept: CONCENTRIC (wide warm arcs from off-screen) ---------------
  const FRAG_CONCENTRIC = COMMON + /* glsl */`
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 p = vec2(uv.x * aspect, uv.y);
      float t = uTime * 0.05 * uSpeed;

      // Center off-screen bottom-right
      vec2 center = vec2(1.20 * aspect + sin(t * 0.3) * 0.05,
                         -0.10         + cos(t * 0.4) * 0.04);
      center += (uMouse - 0.5) * 0.20;

      vec2 d = p - center;
      float r = length(d);
      float a = atan(d.y, d.x);

      // ~3-4 wide bands across the screen
      float phase = r * 3.2 - t * 0.30;

      // Cool base — hard-coded for the iconic look (palette only nudges it)
      vec3 deep = mix(vec3(0.05, 0.06, 0.18), uColA * 0.6, 0.35);
      vec3 mid  = mix(vec3(0.18, 0.24, 0.55), uColB,        0.30);

      // Warm peach / gold crests — also hard-coded for guaranteed contrast
      vec3 warm = vec3(1.00, 0.62, 0.36);   // peach
      vec3 hot  = vec3(1.00, 0.82, 0.55);   // gold

      // Wide envelopes
      float cool   = 0.5 + 0.5 * sin(phase - 1.8);     // base body fill
      float warmE  = 0.5 + 0.5 * sin(phase + 0.0);     // crest mid
      float warmS  = 0.5 + 0.5 * sin(phase + 0.15);    // sharp crest

      // The crest itself: broad warm bloom plus a narrow hot streak
      float bloom = pow(warmE, 2.6);                    // wide warm band
      float crest = pow(warmS, 8.0);                    // narrow hot line
      float edge  = pow(warmS, 22.0);                   // razor-thin highlight

      // Subtle directional lift: bands' upper-left edge is brighter.
      // a is in roughly [PI/2, PI] for visible region. We bias the warm
      // intensity by how "up" the point is along the arc.
      float lift = clamp((a - 1.40) / 1.20, 0.0, 1.0);    // 0 → 1 across upper arc
      lift = 0.55 + 0.45 * lift;                          // never zero, never overpower

      // Compose
      vec3 col = mix(deep, mid, cool);
      col = mix(col, warm, bloom * 0.85 * lift);
      col += hot * crest * 1.0 * lift;
      col += vec3(1.0) * edge * 0.45 * lift;             // tiny white spec

      // Distance falloff (slight)
      col *= mix(0.78, 1.05, smoothstep(2.6, 0.3, r));

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept: DEEP SIGNAL (oscilloscope traces over a deep gradient) ----
  const FRAG_DEEP_SIGNAL = COMMON + /* glsl */`
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
      float t = uTime * 0.40 * uSpeed;

      // Mouse modulates trace amplitude
      float mAmp = 1.0 + (uMouse.y - 0.5) * 0.6;

      // Three layered traces — multi-frequency sums for organic motion
      float w1 = (sin(p.x * 5.0 + t)        * 0.16
               +  sin(p.x * 11.0 + t * 1.6) * 0.06
               +  sin(p.x * 23.0 - t * 0.7) * 0.022) * mAmp;
      float w2 = (sin(p.x * 7.0 - t * 0.8)  * 0.13
               +  sin(p.x * 17.0 - t * 1.2) * 0.045
               +  sin(p.x * 31.0 + t * 0.5) * 0.018) * mAmp;
      float w3 = (sin(p.x * 3.0 + t * 0.6 + sin(p.x * 9.0 + t) * 0.7) * 0.20
               +  sin(p.x * 13.0 - t * 0.9) * 0.03) * mAmp;

      // Distance from each trace
      float d1 = abs(p.y - w1);
      float d2 = abs(p.y - w2 - 0.10);
      float d3 = abs(p.y - w3 + 0.10);

      float tr1 = exp(-d1 * 80.0);
      float tr2 = exp(-d2 * 110.0);
      float tr3 = exp(-d3 * 60.0);

      // Subtle oscilloscope grid
      vec2 g = uv * vec2(40.0 * aspect / 1.6, 24.0);
      vec2 gF = abs(fract(g) - 0.5);
      float majorX = step(abs(uv.x - 0.5), 0.003);
      float majorY = step(abs(uv.y - 0.5), 0.003);
      float gridLine = (step(0.485, 1.0 - gF.x) + step(0.485, 1.0 - gF.y)) * 0.06
                     + (majorX + majorY) * 0.18;

      // Deep gradient background
      vec3 bg = mix(uColA * 0.65, uColA, smoothstep(0.0, 1.0, uv.y));
      bg += uColB * 0.18 * smoothstep(0.5, 0.0, abs(p.y));

      vec3 col = bg;
      col += uColB * gridLine * 0.55;
      col += uColC * tr1 * 1.6;
      col += uColD * tr2 * 1.2;
      col += mix(uColC, uColD, 0.5) * tr3 * 1.3;

      // bright peak-of-wave dots
      float peak = pow(0.5 + 0.5 * sin(p.x * 5.0 + t), 12.0);
      col += uColC * peak * tr1 * 2.6;

      // soft afterglow along trace 1
      col += uColC * smoothstep(0.04, 0.0, d1) * 0.20;

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept: FLOATING GLASS (large diagonal sheets with sharp fold lights) -
  const FRAG_FLOATING_GLASS = COMMON + /* glsl */`
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
      float t = uTime * 0.04 * uSpeed;
      p += (uMouse - 0.5) * 0.15;

      // Three large diagonal sheet edges, each a wavy half-plane.
      float angA = -0.70 + sin(t * 0.4) * 0.05;
      vec2  nA = vec2(cos(angA), sin(angA));
      float sA = dot(p, nA) - 0.06
               + 0.10 * sin(p.x * 1.7 + t)
               + 0.04 * sin(p.y * 2.4 - t * 1.2);

      float angB = -1.05 + cos(t * 0.5) * 0.04;
      vec2  nB = vec2(cos(angB), sin(angB));
      float sB = dot(p, nB) + 0.18
               + 0.09 * sin(p.x * 1.4 - t * 0.9)
               + 0.04 * cos(p.y * 2.0 + t);

      float angC = -0.30 + sin(t * 0.3 + 1.7) * 0.05;
      vec2  nC = vec2(cos(angC), sin(angC));
      float sC = dot(p, nC) - 0.32
               + 0.06 * sin(p.x * 1.9 + t * 0.6);

      // Sharp bright fold lines along each sheet's zero-crossing
      float foldA = exp(-abs(sA) * 32.0);
      float foldB = exp(-abs(sB) * 26.0);
      float foldC = exp(-abs(sC) * 32.0);

      // Lighting: brighter above each fold, darker below
      float litA = smoothstep(-0.45, 0.20, sA);
      float litB = smoothstep(-0.55, 0.25, sB);
      float litC = smoothstep(-0.50, 0.30, sC);
      float shade = 0.30 + 0.32 * litA + 0.26 * litB + 0.22 * litC;

      // Hard-coded color palette tuned for this design — let palette still
      // tint things subtly via uColA / uColD.
      vec3 deep   = mix(vec3(0.04, 0.03, 0.10), uColA * 0.45, 0.30);
      vec3 body   = mix(vec3(0.18, 0.10, 0.30), uColA * 0.85, 0.20);
      vec3 violet = mix(vec3(0.55, 0.18, 0.78), uColD,        0.25);
      vec3 crease = vec3(0.95, 0.75, 1.00);    // bright lavender highlight
      vec3 spark  = vec3(1.00, 0.95, 1.00);    // near-white pop

      vec3 col = mix(deep, body, shade);

      // Wide accent: bright purple region behind one of the sheets
      col = mix(col, violet,
                smoothstep(-0.15, 0.45, sB) *
                smoothstep( 0.45,-0.15, sA) * 0.75);

      // Bright crease highlights
      col += crease * pow(foldA, 1.4) * 1.30;
      col += crease * pow(foldB, 1.4) * 1.05;
      col += crease * pow(foldC, 1.6) * 0.60;

      // White-hot specular spark on the sharpest part of each fold
      col += spark * pow(foldA, 6.0) * 0.55;
      col += spark * pow(foldB, 6.0) * 0.35;

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept: METALLIC RINGS (deep dark beveled rings with film grain) ---
  const FRAG_METALLIC_RINGS = COMMON + /* glsl */`
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 p = vec2(uv.x * aspect, uv.y);
      float t = uTime * 0.03 * uSpeed;

      // Off-screen center toward the top-right
      vec2 center = vec2(0.98 * aspect + sin(t * 0.25) * 0.04,
                         0.85          + cos(t * 0.35) * 0.03);
      center += (uMouse - 0.5) * 0.10;

      vec2 d = p - center;
      float r = length(d);

      // ~5 visible bands; slow inward drift
      float bandPhase = r * 6.0 + t * 0.25;
      float bandPos   = fract(bandPhase);   // 0..1 within a band

      // Bevel: light edge on inner side (low bandPos), shadow on outer
      float lightEdge = smoothstep(0.00, 0.18, bandPos)
                      * smoothstep(0.55, 0.18, bandPos);
      float darkEdge  = smoothstep(0.60, 0.95, bandPos);
      // very thin specular at the peak of the bevel
      float specEdge  = pow(smoothstep(0.06, 0.18, bandPos) *
                            smoothstep(0.30, 0.18, bandPos), 2.5);

      // Near-black base with palette tint
      vec3 base = uColA * 0.18 + vec3(0.004);

      vec3 col = base;
      col += mix(uColB, uColC, 0.4) * lightEdge * 0.085;
      col -= base * darkEdge * 0.55;
      col += mix(uColC, vec3(1.0), 0.3) * specEdge * 0.18;

      // Heavy film grain
      float g  = (hash(uv * uResolution + t * 60.0) - 0.5) * 0.075;
      float g2 = (hash(floor(uv * uResolution * 0.5) + t * 5.0) - 0.5) * 0.025;
      col += g + g2;

      // Deep vignette
      vec2 cv = uv - 0.5;
      col *= mix(0.40, 1.0, smoothstep(1.05, 0.05, length(cv) * 1.3));

      col = max(col, vec3(0.0));
      col = pow(col, vec3(0.95));
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept: VORONOI (animated cellular tessellation) ------------------
  const FRAG_VORONOI = COMMON + /* glsl */`
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 p = vec2(uv.x * aspect, uv.y) * 5.5;
      float t = uTime * 0.18 * uSpeed;
      p += (uMouse - 0.5) * 1.2;

      vec2 ip = floor(p);
      vec2 fp = fract(p);

      float d1 = 8.0;
      float d2 = 8.0;
      vec2 closest = vec2(0.0);
      for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
          vec2 cell = vec2(float(i), float(j));
          vec2 seed = ip + cell;
          vec2 jitter = vec2(hash(seed), hash(seed + 5.7));
          vec2 point = cell + 0.5 + 0.42 * vec2(sin(t + jitter.x * 6.28),
                                                cos(t * 1.1 + jitter.y * 6.28));
          float d = length(point - fp);
          if (d < d1) { d2 = d1; d1 = d; closest = seed; }
          else if (d < d2) { d2 = d; }
        }
      }

      // edge-of-cell value (large where the two closest sites are equidistant)
      float edge = d2 - d1;
      float ridge = smoothstep(0.0, 0.06, edge);

      // per-cell color hash → palette interpolation
      float ch = hash(closest);
      float ch2 = hash(closest + 1.7);
      vec3 cellCol = mix(uColA, uColB, smoothstep(0.0, 0.5, ch));
      cellCol = mix(cellCol, uColC, smoothstep(0.45, 0.85, ch));
      cellCol = mix(cellCol, uColD, smoothstep(0.82, 1.0, ch));

      // gentle radial darken to cell center
      float centerFalloff = 1.0 - smoothstep(0.1, 0.55, d1);
      cellCol *= 0.78 + 0.30 * centerFalloff;
      // little hot center
      cellCol += uColC * smoothstep(0.06, 0.0, d1) * 0.35 * step(0.55, ch2);

      vec3 col = cellCol;
      // dark edges between cells
      col *= 0.30 + 0.70 * ridge;
      // bright thin edge highlight
      col += uColC * pow(1.0 - ridge, 8.0) * 0.30;

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Concept: NEBULA (cosmic gas clouds with twinkling stars) -----------
  const FRAG_NEBULA = COMMON + /* glsl */`
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 p = vec2(uv.x * aspect, uv.y) * 1.9;
      float t = uTime * 0.04 * uSpeed;
      p += (uMouse - 0.5) * 0.3;

      // Double domain-warped FBM — billowing gas clouds
      vec2 q = vec2(fbm(p + vec2(0.0, t)),
                    fbm(p + vec2(5.2, -t * 0.8)));
      vec2 r = vec2(fbm(p + 2.6 * q + vec2(1.7, t * 1.1)),
                    fbm(p + 2.6 * q + vec2(8.3, t * 0.6)));
      float n = fbm(p + 3.2 * r);

      // Deep space base
      vec3 col = uColA * 0.55;

      // Layered gas
      col = mix(col, uColB,         smoothstep(0.20, 0.70, n));
      col = mix(col, uColC,         smoothstep(0.55, 0.90, n) * 0.85);
      col += uColD * pow(smoothstep(0.50, 1.0, n), 3.0) * 0.95;
      col += uColC * pow(smoothstep(0.70, 1.0, n), 5.0) * 1.10;

      // A few bright clumps where the warp magnitude is high
      float clump = exp(-length(r - 0.5) * 4.0);
      col += mix(uColC, uColD, 0.4) * clump * pow(n, 2.0) * 1.4;

      // Star field — three tiers
      vec2 sg = floor(uv * uResolution / 4.0);
      float sn = hash(sg);
      float twinkle = 0.5 + 0.5 * sin(t * 6.0 + sn * 30.0);
      float star  = step(0.992, sn);
      float bright = step(0.9985, sn);
      float huge   = step(0.9998, sn);
      col += vec3(star)  * twinkle * 0.55;
      col += vec3(bright) * twinkle * 1.20;
      col += vec3(huge) * 1.6;
      // simple cross flare on huge stars
      vec2 cg = (uv - (sg + 0.5) * 4.0 / uResolution);
      float flare = step(0.9998, sn)
                  * (smoothstep(0.05, 0.0, abs(cg.x)) + smoothstep(0.05, 0.0, abs(cg.y)));
      col += vec3(flare) * 0.6;

      col = vignetteAndGrain(col, uv);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const CONCEPTS = {
    marble:    FRAG_MARBLE,
    aurora:    FRAG_AURORA,
    caustics:  FRAG_CAUSTICS,
    mesh:      FRAG_MESH,
    pixel:     FRAG_PIXEL,
    halftone:  FRAG_HALFTONE,
    topo:      FRAG_TOPO,
    ink:       FRAG_INK,
    plasma:    FRAG_PLASMA,
    strata:    FRAG_STRATA,
    linework:  FRAG_LINEWORK,
    petals:    FRAG_PETALS,
    ascii:     FRAG_ASCII,
    glitch:    FRAG_GLITCH,
    citygrid:  FRAG_CITY_GRID,
    concentric:FRAG_CONCENTRIC,
    deepsignal:FRAG_DEEP_SIGNAL,
    glass:     FRAG_FLOATING_GLASS,
    halo:      FRAG_HALO,
    rings:     FRAG_METALLIC_RINGS,
    voronoi:   FRAG_VORONOI,
    nebula:    FRAG_NEBULA,
  };

  // Palettes (oklch converted to linear-ish sRGB triplets, eyeballed)
  const PALETTES = {
    indigo: {
      a: [0.04, 0.05, 0.13],   // deep indigo/black
      b: [0.18, 0.20, 0.45],   // periwinkle
      c: [0.45, 0.85, 0.92],   // cyan/teal crest
      d: [0.62, 0.55, 0.95],   // lavender
    },
    sunset: {
      a: [0.07, 0.04, 0.10],
      b: [0.45, 0.16, 0.30],
      c: [1.00, 0.55, 0.35],
      d: [0.95, 0.30, 0.55],
    },
    forest: {
      a: [0.03, 0.07, 0.06],
      b: [0.10, 0.30, 0.28],
      c: [0.55, 0.95, 0.70],
      d: [0.85, 0.95, 0.55],
    },
    mono: {
      a: [0.03, 0.03, 0.04],
      b: [0.20, 0.22, 0.28],
      c: [0.85, 0.88, 0.95],
      d: [0.55, 0.60, 0.72],
    },
    sakura: {
      a: [0.82, 0.82, 0.84],   // soft warm gray sky
      b: [0.22, 0.14, 0.12],   // dark trunk brown
      c: [0.96, 0.74, 0.84],   // soft pink blossom
      d: [0.86, 0.40, 0.58],   // deep rose outline / dark cluster
    },
    damascus: {
      a: [0.05, 0.06, 0.09],   // deep steel
      b: [0.20, 0.22, 0.28],   // mid steel
      c: [0.82, 0.86, 0.92],   // bright silver
      d: [0.62, 0.50, 0.32],   // warm gold/copper edge
    },
  };

  let renderer, scene, camera, mesh, uniforms, raf;
  let currentConcept = 'marble';
  let targetMouse = { x: 0.5, y: 0.5 };
  let mouse = { x: 0.5, y: 0.5 };

  function init(canvas) {
    if (!window.THREE) {
      console.error('THREE not loaded');
      return;
    }
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true });
    window._dbg_renderer = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    scene = new THREE.Scene();
    camera = new THREE.Camera();

    uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uSpeed: { value: 1.0 },
      uGrain: { value: 0.05 },
      uColA: { value: new THREE.Vector3(...PALETTES.indigo.a) },
      uColB: { value: new THREE.Vector3(...PALETTES.indigo.b) },
      uColC: { value: new THREE.Vector3(...PALETTES.indigo.c) },
      uColD: { value: new THREE.Vector3(...PALETTES.indigo.d) },
    };

    const geo = new THREE.PlaneGeometry(2, 2);
    currentConcept = 'marble';
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: CONCEPTS[currentConcept],
      uniforms,
      extensions: { derivatives: true },
    });
    mesh = new THREE.Mesh(geo, mat);
    window._dbg_mesh = mesh;
    window._dbg_scene = scene;
    scene.add(mesh);

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const start = performance.now();
    function tick() {
      const t = (performance.now() - start) / 1000;
      // ease mouse toward target
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;
      uniforms.uTime.value = t;
      uniforms.uMouse.value.set(mouse.x, mouse.y);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }
    tick();
  }

  function resize() {
    if (!renderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.uResolution.value.set(w, h);
  }

  function onPointerMove(e) {
    targetMouse.x = e.clientX / window.innerWidth;
    targetMouse.y = 1.0 - e.clientY / window.innerHeight;
  }

  function setPalette(name) {
    const p = PALETTES[name];
    if (!p || !uniforms) return;
    uniforms.uColA.value.set(...p.a);
    uniforms.uColB.value.set(...p.b);
    uniforms.uColC.value.set(...p.c);
    uniforms.uColD.value.set(...p.d);
  }
  function setSpeed(v) { if (uniforms) uniforms.uSpeed.value = v; }
  function setGrain(v) { if (uniforms) uniforms.uGrain.value = v; }
  function setConcept(name) {
    if (!CONCEPTS[name] || !mesh) return;
    if (currentConcept === name) return;
    currentConcept = name;
    const oldMat = mesh.material;
    // Build the new material BEFORE swapping
    const newMat = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: CONCEPTS[name],
      uniforms,
      extensions: { derivatives: true },
    });
    // Three.js caches programs by material; replace explicitly + dispose old
    mesh.material = newMat;
    if (oldMat && oldMat.dispose) oldMat.dispose();
    // Force three.js to recognize the change
    mesh.material.needsUpdate = true;
    // Also nudge the mesh so any internal caches refresh
    mesh.geometry.attributes.position && (mesh.geometry.attributes.position.needsUpdate = false);
  }

  window.FlowBG = { init, setConcept, setPalette, setSpeed, setGrain, PALETTES, CONCEPTS };
})();
