import { Injectable } from '@angular/core';

const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI * 0.5;

const VIEW_WIDTH = 512;
const VIEW_HEIGHT = 350;
const TIME_STEP = 1 / 60;

@Injectable({
  providedIn: 'root'
})
export class DrawingService {
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private loader!: Loader;
  private exploader!: Exploader;
  private phase: number = 0;

  constructor() {}

  initCanvas(canvas: HTMLCanvasElement): void {
    canvas.width = VIEW_WIDTH;
    canvas.height = VIEW_HEIGHT;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    this.createLoader();
    this.createExploader();
    this.createParticles();
    this.loop();
  }

  private createLoader(): void {
    this.loader = new Loader(VIEW_WIDTH * 0.5, VIEW_HEIGHT * 0.5);
  }

  private createExploader(): void {
    this.exploader = new Exploader(VIEW_WIDTH * 0.5, VIEW_HEIGHT * 0.5);
  }

  private createParticles(): void {
    this.particles = [];
    for (let i = 0; i < 128; i++) {
      const p0 = new Point(VIEW_WIDTH * 0.5, VIEW_HEIGHT * 0.5);
      const p1 = new Point(Math.random() * VIEW_WIDTH, Math.random() * VIEW_HEIGHT);
      const p2 = new Point(Math.random() * VIEW_WIDTH, Math.random() * VIEW_HEIGHT);
      const p3 = new Point(Math.random() * VIEW_WIDTH, VIEW_HEIGHT + 64);

      this.particles.push(new Particle(p0, p1, p2, p3));
    }
  }

  private update(): void {
    switch (this.phase) {
      case 0:
        this.loader.progress += 1 / 45;
        break;
      case 1:
        this.exploader.update();
        break;
      case 2:
        this.particles.forEach((p) => p.update());
        break;
    }
  }

  private draw(): void {
    this.ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    switch (this.phase) {
      case 0:
        this.loader.draw(this.ctx);
        break;
      case 1:
        this.exploader.draw(this.ctx);
        break;
      case 2:
        this.particles.forEach((p) => p.draw(this.ctx));
        break;
    }
  }

  private loop(): void {
    this.update();
    this.draw();

    if (this.phase === 0 && this.loader.complete) {
      this.phase = 1;
    } else if (this.phase === 1 && this.exploader.complete) {
      this.phase = 2;
    } else if (this.phase === 2 && this.checkParticlesComplete()) {
      this.phase = 0;
      this.loader.reset();
      this.exploader.reset();
      this.createParticles();
    }

    requestAnimationFrame(() => this.loop());
  }

  private checkParticlesComplete(): boolean {
    return this.particles.every((p) => p.complete);
  }
}

// ✅ Helper Classes
class Point {
  constructor(public x: number = 0, public y: number = 0) {}
}

class Particle {
  public time: number = 0;
  public duration: number = 2 + Math.random() * 2;
  public color: string = '#' + Math.floor(Math.random() * 0xffffff).toString(16);
  public w: number = 8;
  public h: number = 6;
  public complete: boolean = false;
  public x: number = 0;
  public y: number = 0;
  public r: number = 0;
  public sy: number = 1;

  constructor(private p0: Point, private p1: Point, private p2: Point, private p3: Point) {}

  update(): void {
    this.time = Math.min(this.duration, this.time + TIME_STEP);
    const f = Ease.outCubic(this.time, 0, 1, this.duration);
    const p = cubeBezier(this.p0, this.p1, this.p2, this.p3, f);

    const dx = p.x - this.x;
    const dy = p.y - this.y;
    this.r = Math.atan2(dy, dx) + HALF_PI;
    this.sy = Math.sin(Math.PI * f * 10);
    this.x = p.x;
    this.y = p.y;

    this.complete = this.time === this.duration;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.r);
    ctx.scale(1, this.sy);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.w * 0.5, -this.h * 0.5, this.w, this.h);
    ctx.restore();
  }
}

class Loader {
  private _progress: number = 0;
  public complete: boolean = false;

  constructor(public x: number, public y: number, public r: number = 24) {}

  reset(): void {
    this._progress = 0;
    this.complete = false;
  }

  set progress(p: number) {
    this._progress = Math.max(0, Math.min(1, p));
    this.complete = this._progress === 1;
  }

  get progress(): number {
    return this._progress;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, -HALF_PI, TWO_PI * this._progress - HALF_PI);
    ctx.lineTo(this.x, this.y);
    ctx.closePath();
    ctx.fill();
  }
}

class Exploader {
  public time: number = 0;
  public duration: number = 0.1;
  public progress: number = 0;
  public complete: boolean = false;

  constructor(public x: number, public y: number, public startRadius: number = 24) {}

  reset(): void {
    this.time = 0;
    this.progress = 0;
    this.complete = false;
  }

  update(): void {
    this.time = Math.min(this.duration, this.time + TIME_STEP);
    this.progress = Ease.inBack(this.time, 0, 1, this.duration);
    this.complete = this.time === this.duration;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.startRadius * (1 - this.progress), 0, TWO_PI);
    ctx.fill();
  }
}

// ✅ Math Helpers
const Ease = {
  outCubic: (t: number, b: number, c: number, d: number): number => {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
  },
  inBack: (t: number, b: number, c: number, d: number, s: number = 1.70158): number => {
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
  }
};

function cubeBezier(p0: Point, c0: Point, c1: Point, p1: Point, t: number): Point {
  const nt = 1 - t;
  return new Point(
    nt ** 3 * p0.x + 3 * nt ** 2 * t * c0.x + 3 * nt * t ** 2 * c1.x + t ** 3 * p1.x,
    nt ** 3 * p0.y + 3 * nt ** 2 * t * c0.y + 3 * nt * t ** 2 * c1.y + t ** 3 * p1.y
  );
}
