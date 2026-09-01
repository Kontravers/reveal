import { hexToRgb } from "@/lib/utils";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shader";
import {
  DEFAULT_DITHER_OPTIONS,
  type DitherRevealOptions,
} from "./types";

function compile(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? "unknown";
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return shader;
}

function modeIndex(mode: DitherRevealOptions["mode"]): number {
  if (mode === "color") return 1;
  if (mode === "dither-color") return 2;
  return 0;
}

export class DitherRevealRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private texture: WebGLTexture;
  private vao: WebGLVertexArrayObject;
  private uniforms: Record<string, WebGLUniformLocation | null>;
  private raf = 0;
  private running = false;
  private cursor = { x: 0, y: 0 };
  private target = { x: 0, y: 0 };
  private hasPointer = false;
  private options: DitherRevealOptions = { ...DEFAULT_DITHER_OPTIONS };
  private dpr = 1;
  private startTime = performance.now();

  constructor(
    private canvas: HTMLCanvasElement,
    private video: HTMLVideoElement,
  ) {
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) throw new Error("WebGL2 is not available");
    this.gl = gl;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!program) throw new Error("Could not create program");
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.bindAttribLocation(program, 0, "aPosition");
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program) ?? "unknown";
      throw new Error(`Program link failed: ${log}`);
    }
    this.program = program;

    const buffer = gl.createBuffer();
    const vao = gl.createVertexArray();
    if (!buffer || !vao) throw new Error("Could not create geometry");
    this.vao = vao;
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    if (!texture) throw new Error("Could not create texture");
    this.texture = texture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    this.uniforms = {
      uVideo: gl.getUniformLocation(program, "uVideo"),
      uResolution: gl.getUniformLocation(program, "uResolution"),
      uVideoSize: gl.getUniformLocation(program, "uVideoSize"),
      uCursor: gl.getUniformLocation(program, "uCursor"),
      uRadius: gl.getUniformLocation(program, "uRadius"),
      uSoftness: gl.getUniformLocation(program, "uSoftness"),
      uPixelSize: gl.getUniformLocation(program, "uPixelSize"),
      uMatrix: gl.getUniformLocation(program, "uMatrix"),
      uMode: gl.getUniformLocation(program, "uMode"),
      uInk: gl.getUniformLocation(program, "uInk"),
      uPaper: gl.getUniformLocation(program, "uPaper"),
      uBrightness: gl.getUniformLocation(program, "uBrightness"),
      uContrast: gl.getUniformLocation(program, "uContrast"),
      uShadows: gl.getUniformLocation(program, "uShadows"),
      uMids: gl.getUniformLocation(program, "uMids"),
      uHighlights: gl.getUniformLocation(program, "uHighlights"),
      uHasVideo: gl.getUniformLocation(program, "uHasVideo"),
      uTime: gl.getUniformLocation(program, "uTime"),
    };
  }

  setOptions(partial: Partial<DitherRevealOptions>) {
    this.options = { ...this.options, ...partial };
  }

  setPointer(cssX: number, cssY: number) {
    this.target.x = cssX * this.dpr;
    this.target.y = cssY * this.dpr;
    if (!this.hasPointer) {
      this.cursor.x = this.target.x;
      this.cursor.y = this.target.y;
      this.hasPointer = true;
    }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr = dpr;
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    if (!this.hasPointer) {
      this.cursor.x = w * 0.62;
      this.cursor.y = h * 0.42;
      this.target.x = this.cursor.x;
      this.target.y = this.cursor.y;
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.resize();
    const tick = () => {
      if (!this.running) return;
      this.draw();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  destroy() {
    this.stop();
    const gl = this.gl;
    gl.deleteTexture(this.texture);
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.program);
  }

  private draw() {
    const gl = this.gl;
    this.resize();

    const follow = Math.min(Math.max(this.options.follow, 0.02), 1);
    this.cursor.x += (this.target.x - this.cursor.x) * follow;
    this.cursor.y += (this.target.y - this.cursor.y) * follow;

    const ready =
      this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      this.video.videoWidth > 0;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    if (ready) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        this.video,
      );
    }

    const ink = hexToRgb(this.options.ink);
    const paper = hexToRgb(this.options.paper);
    const dpr = this.dpr;

    gl.uniform1i(this.uniforms.uVideo, 0);
    gl.uniform2f(
      this.uniforms.uResolution,
      this.canvas.width,
      this.canvas.height,
    );
    gl.uniform2f(
      this.uniforms.uVideoSize,
      ready ? this.video.videoWidth : 1,
      ready ? this.video.videoHeight : 1,
    );
    gl.uniform2f(this.uniforms.uCursor, this.cursor.x, this.cursor.y);
    gl.uniform1f(this.uniforms.uRadius, this.options.radius * dpr);
    gl.uniform1f(this.uniforms.uSoftness, this.options.softness * dpr);
    gl.uniform1f(this.uniforms.uPixelSize, this.options.pixelSize * dpr);
    gl.uniform1i(this.uniforms.uMatrix, this.options.matrix);
    gl.uniform1i(this.uniforms.uMode, modeIndex(this.options.mode));
    gl.uniform3f(this.uniforms.uInk, ink[0], ink[1], ink[2]);
    gl.uniform3f(this.uniforms.uPaper, paper[0], paper[1], paper[2]);
    gl.uniform1f(this.uniforms.uBrightness, this.options.brightness);
    gl.uniform1f(this.uniforms.uContrast, this.options.contrast);
    gl.uniform1f(this.uniforms.uShadows, this.options.shadows);
    gl.uniform1f(this.uniforms.uMids, this.options.mids);
    gl.uniform1f(this.uniforms.uHighlights, this.options.highlights);
    gl.uniform1f(this.uniforms.uHasVideo, ready ? 1 : 0);
    gl.uniform1f(
      this.uniforms.uTime,
      (performance.now() - this.startTime) / 1000,
    );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
