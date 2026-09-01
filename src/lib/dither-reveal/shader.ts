export const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uVideo;
uniform vec2 uResolution;
uniform vec2 uVideoSize;
uniform vec2 uCursor;
uniform float uRadius;
uniform float uSoftness;
uniform float uPixelSize;
uniform int uMatrix;
uniform int uMode;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform float uBrightness;
uniform float uContrast;
uniform float uShadows;
uniform float uMids;
uniform float uHighlights;
uniform float uHasVideo;
uniform float uTime;

out vec4 fragColor;

float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

float bayer2(vec2 a) {
  a = floor(a);
  return fract(dot(a, vec2(0.5, a.y * 0.75)));
}

float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

float bayer8(vec2 a) {
  return bayer4(0.5 * a) * 0.25 + bayer2(a);
}

float bayerThreshold(vec2 cell) {
  if (uMatrix <= 4) {
    return (bayer4(cell) * 16.0 + 0.5) / 16.0;
  }
  return (bayer8(cell) * 64.0 + 0.5) / 64.0;
}

vec2 coverUV(vec2 uv) {
  vec2 canvas = uResolution;
  vec2 media = max(uVideoSize, vec2(1.0));
  float scale = max(canvas.x / media.x, canvas.y / media.y);
  vec2 scaled = media * scale;
  vec2 offset = (canvas - scaled) * 0.5;
  return (uv * canvas - offset) / scaled;
}

vec3 fallbackFilm(vec2 uv) {
  float w = 0.5 + 0.5 * sin(uv.x * 6.2 + uTime * 0.35) * sin(uv.y * 4.4 - uTime * 0.22);
  float n = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
  return mix(vec3(0.06, 0.07, 0.08), vec3(0.78, 0.76, 0.7), clamp(w + n * 0.06, 0.0, 1.0));
}

vec3 grade(vec3 c) {
  c += uBrightness;
  c = (c - 0.5) * uContrast + 0.5;
  float y = clamp(luma(c), 0.0, 1.0);
  float sh = 1.0 - smoothstep(0.0, 0.45, y);
  float hi = smoothstep(0.55, 1.0, y);
  float mid = clamp(1.0 - sh - hi, 0.0, 1.0);
  c += uShadows * sh;
  c += uMids * mid;
  c += uHighlights * hi;
  return clamp(c, 0.0, 1.0);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  float pixel = max(uPixelSize, 1.0);
  vec2 sampleFrag = uMode == 1
    ? frag
    : floor(frag / pixel) * pixel + pixel * 0.5;
  vec2 sampleUv = sampleFrag / uResolution;

  vec3 source = fallbackFilm(sampleUv);
  if (uHasVideo > 0.5) {
    vec2 mediaUv = coverUV(sampleUv);
    if (mediaUv.x >= 0.0 && mediaUv.x <= 1.0 && mediaUv.y >= 0.0 && mediaUv.y <= 1.0) {
      source = texture(uVideo, mediaUv).rgb;
    }
  }

  vec3 graded = grade(source);
  vec3 look;

  if (uMode == 1) {
    look = graded;
  } else {
    vec2 cell = floor(frag / pixel);
    float threshold = bayerThreshold(cell);
    float y = luma(graded);
    if (uMode == 2) {
      look = mix(uPaper, graded, step(threshold, y));
    } else {
      look = mix(uInk, uPaper, step(threshold, y));
    }
  }

  float dist = length(frag - uCursor);
  float inner = max(uRadius - uSoftness, 0.0);
  float mask = 1.0 - smoothstep(inner, uRadius, dist);

  fragColor = vec4(look * mask, mask);
}
`;
