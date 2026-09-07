interface Point {
  x: number;
  y: number;
}

class Oscillator {
  phase: number;
  offset: number;
  frequency: number;
  amplitude: number;
  private current = 0;

  constructor(options: { phase?: number; offset?: number; frequency?: number; amplitude?: number } = {}) {
    this.phase = options.phase ?? 0;
    this.offset = options.offset ?? 0;
    this.frequency = options.frequency ?? 0.001;
    this.amplitude = options.amplitude ?? 1;
  }

  update() {
    this.phase += this.frequency;
    this.current = this.offset + Math.sin(this.phase) * this.amplitude;
    return this.current;
  }
}

class TrailNode {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
}

class TrailLine {
  spring: number;
  friction: number;
  nodes: TrailNode[] = [];

  constructor(spring: number, friction: number, size: number, pos: Point) {
    this.spring = spring + 0.1 * Math.random() - 0.05;
    this.friction = friction + 0.01 * Math.random() - 0.005;
    for (let i = 0; i < size; i++) {
      const node = new TrailNode();
      node.x = pos.x;
      node.y = pos.y;
      this.nodes.push(node);
    }
  }

  update(pos: Point, dampening: number, tension: number) {
    let spring = this.spring;
    let node = this.nodes[0];
    node.vx += (pos.x - node.x) * spring;
    node.vy += (pos.y - node.y) * spring;

    for (let i = 0; i < this.nodes.length; i++) {
      node = this.nodes[i];
      if (i > 0) {
        const prev = this.nodes[i - 1];
        node.vx += (prev.x - node.x) * spring;
        node.vy += (prev.y - node.y) * spring;
        node.vx += prev.vx * dampening;
        node.vy += prev.vy * dampening;
      }
      node.vx *= this.friction;
      node.vy *= this.friction;
      node.x += node.vx;
      node.y += node.vy;
      spring *= tension;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    let x = this.nodes[0].x;
    let y = this.nodes[0].y;
    ctx.beginPath();
    ctx.moveTo(x, y);

    let i = 1;
    const len = this.nodes.length - 2;
    for (; i < len; i++) {
      const cur = this.nodes[i];
      const next = this.nodes[i + 1];
      x = 0.5 * (cur.x + next.x);
      y = 0.5 * (cur.y + next.y);
      ctx.quadraticCurveTo(cur.x, cur.y, x, y);
    }
    const cur = this.nodes[i];
    const next = this.nodes[i + 1];
    ctx.quadraticCurveTo(cur.x, cur.y, next.x, next.y);
    ctx.stroke();
    ctx.closePath();
  }
}

export interface LineTrailOptions {
  /** Number of overlapping trail lines. */
  trails?: number;
  /** Nodes per line — higher is smoother but costlier. */
  size?: number;
  dampening?: number;
  tension?: number;
  friction?: number;
  /** Hue range the trail cycles through, in degrees (0-360). */
  hueMin?: number;
  hueMax?: number;
  saturation?: number;
  lightness?: number;
  lineWidth?: number;
  alpha?: number;
}

/**
 * Mounts a pointer-following spring-physics line trail onto `canvas`,
 * sized to its parent element. Returns a cleanup function that stops the
 * animation loop and removes all listeners.
 */
export function renderLineTrail(canvas: HTMLCanvasElement, options: LineTrailOptions = {}) {
  const ctx2d = canvas.getContext("2d");
  if (!ctx2d) return () => {};
  const ctx: CanvasRenderingContext2D = ctx2d;

  const config = {
    trails: options.trails ?? 22,
    size: options.size ?? 32,
    dampening: options.dampening ?? 0.025,
    tension: options.tension ?? 0.99,
    friction: options.friction ?? 0.5,
    hueMin: options.hueMin ?? 14,
    hueMax: options.hueMax ?? 24,
    saturation: options.saturation ?? 58,
    lightness: options.lightness ?? 40,
    lineWidth: options.lineWidth ?? 5,
    alpha: options.alpha ?? 0.05,
  };

  const pos: Point = { x: 0, y: 0 };
  let lines: TrailLine[] = [];
  let running = true;
  let frameId = 0;
  let active = false;
  let idleTimeout: ReturnType<typeof setTimeout> | null = null;

  const hue = new Oscillator({
    phase: Math.random() * Math.PI * 2,
    amplitude: (config.hueMax - config.hueMin) / 2,
    frequency: 0.0012,
    offset: config.hueMin + (config.hueMax - config.hueMin) / 2,
  });

  function initLines() {
    lines = [];
    for (let i = 0; i < config.trails; i++) {
      lines.push(new TrailLine(0.4 + (i / config.trails) * 0.025, config.friction, config.size, pos));
    }
  }

  function resize() {
    const parent = canvas.parentElement;
    const width = parent?.clientWidth ?? canvas.clientWidth;
    const height = parent?.clientHeight ?? canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function setPos(x: number, y: number) {
    const rect = canvas.getBoundingClientRect();
    pos.x = x - rect.left;
    pos.y = y - rect.top;
    if (!active) {
      active = true;
      initLines();
    }
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
      active = false;
    }, 3000);
  }

  function onPointerMove(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (inside) setPos(e.clientX, e.clientY);
  }

  function frame() {
    if (!running) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, width, height);

    if (active) {
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `hsla(${Math.round(hue.update())}, ${config.saturation}%, ${config.lightness}%, ${config.alpha})`;
      ctx.lineWidth = config.lineWidth;
      for (const line of lines) {
        line.update(pos, config.dampening, config.tension);
        line.draw(ctx);
      }
    }

    frameId = window.requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  // The canvas is pointer-events-none (so it never blocks clicks on the
  // content above it), which also means it never receives pointer events
  // itself — listen on window and hit-test against its rect instead.
  window.addEventListener("pointermove", onPointerMove);
  frameId = window.requestAnimationFrame(frame);

  return function cleanup() {
    running = false;
    if (idleTimeout) clearTimeout(idleTimeout);
    window.cancelAnimationFrame(frameId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
  };
}
