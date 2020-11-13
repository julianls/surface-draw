import { Component, OnInit, ViewChild, Input, Output, EventEmitter, ElementRef, AfterViewInit, OnChanges, HostListener } from '@angular/core';
import { ISurfaceDraw, IDrawable, IPoint } from 'my-libs/base-draw';
import { Point } from 'my-libs/base-geometry';
import { SurfaceData } from './surface-data';

@Component({
  selector: 'lib-surface-draw',
  template: `
  <div #divElement class="div-root">
    <canvas #myCanvas class="canvas-main">
    </canvas>
  </div>
  `,
  styles: [`
  .canvas-main {
    touch-action: none !important;
  }

  .div-root {
    position: fixed;
    width: 100%;
    height: 100%;
  }
  `]
})
export class SurfaceDrawComponent implements OnInit, OnChanges, AfterViewInit, ISurfaceDraw {
  @ViewChild('myCanvas', { static: true }) canvasRef: ElementRef;
  @ViewChild('divElement', { static: true }) divElement: any;

  @Input() drawItems: IDrawable[];
  @Input() SurfaceFill: string;
  @Input() SurfaceStroke: string;

  private offscreenCanvas: HTMLCanvasElement;

  private scaleValue = 1;
  private offsetXValue = 0;
  private offsetYValue = 0;
  private widthValue = 0;
  private heightValue = 0;
  private switchValue = false;

  @Input() drawAxises = false;

  @Output() scaleChange = new EventEmitter();
  @Output() offsetXChange = new EventEmitter();
  @Output() offsetYChange = new EventEmitter();
  @Output() widthChange = new EventEmitter();
  @Output() heightChange = new EventEmitter();

  private center: Point = new Point(0, 0);
  private pointerPosition: Point = new Point(0, 0);

  private context: CanvasRenderingContext2D;
  private canvasValid = false;
  // private lastRefreshHandle: number;
  // private cancelRefreshCounter: number = 0;

  private isPan = false;

  @Output() down: EventEmitter<SurfaceData> = new EventEmitter<SurfaceData>();
  @Output() move: EventEmitter<SurfaceData> = new EventEmitter<SurfaceData>();
  @Output() up: EventEmitter<SurfaceData> = new EventEmitter<SurfaceData>();
  @Output() wheelRotate: EventEmitter<SurfaceData> = new EventEmitter<SurfaceData>();
  // @Output() click: EventEmitter<Point> = new EventEmitter<Point>();

  private stateEvent: any = null;

  constructor() { }

  @Input()
  set scale(val) {
    if (this.scaleValue !== val) {
      this.scaleValue = val;
      this.scaleChange.emit(this.scaleValue);
    }
  }

  get scale(): number {
    return this.scaleValue;
  }

  @Input()
  set offsetX(val) {
    if (this.offsetXValue !== val) {
      this.offsetXValue = val;
      this.offsetXChange.emit(this.offsetXValue);
    }
  }

  get offsetX(): number {
    return this.offsetXValue;
  }

  @Input()
  set offsetY(val) {
    if (this.offsetXValue !== val) {
      this.offsetYValue = val;
      this.offsetYChange.emit(this.offsetYValue);
    }
  }

  get offsetY(): number {
    return this.offsetYValue;
  }

  get width(): number {
    return this.widthValue;
  }

  @Input()
  set width(val) {
    if (this.widthValue !== val) {
      this.widthValue = val;
      this.widthChange.emit(this.widthValue);
    }
  }

  get height(): number {
    return this.heightValue;
  }

  @Input()
  set height(val) {
    if (this.heightValue !== val) {
      this.heightValue = val;
      this.heightChange.emit(this.heightValue);
    }
  }

  @Input()
  set switch(val) {
    if (this.switchValue !== val) {
      this.switchValue = val;
      this.invalidateDrawing();
    }
  }

  get switch(): boolean {
    return this.switchValue;
  }

  get mousePosition(): IPoint {
    return this.pointerPosition;
  }

  ngOnInit(): void {
    this.offscreenCanvas = document.createElement('canvas');
    this.canvasValid = true;
  }

  ngAfterViewInit(): void {
    // this.context = this.canvasRef.nativeElement.getContext('2d');
    this.context = this.offscreenCanvas.getContext('2d', { alpha: false });
    window.onresize = this.resizeCanvas.bind(this);
    requestAnimationFrame(() => this.resizeCanvas(this.divElement));
  }

  private resizeCanvas(_: UIEvent): void {
    const el: HTMLDivElement = this.divElement.nativeElement;
    this.width = el.clientWidth;
    this.height = el.clientHeight;
    this.offscreenCanvas.width = this.width;
    this.offscreenCanvas.height = this.height;
    this.canvasRef.nativeElement.width = el.clientWidth;
    this.canvasRef.nativeElement.height = el.clientHeight;
    this.invalidateDrawing();
  }


  ngOnChanges(): void {
    // this.context = this.canvasRef.nativeElement.getContext('2d');
    if (this.offscreenCanvas) {
      this.context = this.offscreenCanvas.getContext('2d', { alpha: false });
      this.invalidateDrawing();
    }
  }

  invalidateDrawing(): void {
    if (this.canvasValid) {
      this.canvasValid = false;
      // this.cancelRefreshCounter++;
      // if (this.cancelRefreshCounter < 10)
      //  cancelAnimationFrame(this.lastRefreshHandle);
      // else
      //  this.cancelRefreshCounter = 0;
      // this.lastRefreshHandle = requestAnimationFrame(() => this.drawOffscreen());
      requestAnimationFrame(() => this.drawOffscreen());
    }
  }

  line(x1: number, y1: number, x2: number, y2: number, strokeStyle: string = '#F3E5F5'): void {
    this.context.strokeStyle = strokeStyle;
    this.context.beginPath();
    this.context.moveTo(this.toDeviceX(x1), this.toDeviceY(y1));
    this.context.lineTo(this.toDeviceX(x2), this.toDeviceY(y2));
    this.context.stroke();
  }

  polyline(points: IPoint[], strokeStyle: string = '#F3E5F5'): void {
    this.context.strokeStyle = strokeStyle;
    this.context.beginPath();
    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        this.context.moveTo(this.toDeviceX(points[i].x), this.toDeviceY(points[i].y));
      }
      else {
        this.context.lineTo(this.toDeviceX(points[i].x), this.toDeviceY(points[i].y));
      }
    }
    this.context.stroke();
  }

  polygon(points: IPoint[], strokeStyle: string = '#F3E5F5', fillStyle?: string): void {
    this.context.strokeStyle = strokeStyle;
    this.context.beginPath();
    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        this.context.moveTo(this.toDeviceX(points[i].x), this.toDeviceY(points[i].y));
      }
      else {
        this.context.lineTo(this.toDeviceX(points[i].x), this.toDeviceY(points[i].y));
      }
    }
    this.context.closePath();

    if (fillStyle) {
      const oldFill = this.context.fillStyle;
      this.context.fillStyle = fillStyle;
      this.context.fill();
      this.context.fillStyle = oldFill;
    }

    this.context.stroke();
  }

  bezierCurve(x1: number, y1: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number, x2: number, y2: number, strokeStyle: string = '#F3E5F5'): void {
    this.context.strokeStyle = strokeStyle;
    this.context.beginPath();
    this.context.moveTo(this.toDeviceX(x1), this.toDeviceY(y1));
    this.context.bezierCurveTo(this.toDeviceX(cp1x), this.toDeviceY(cp1y),
      this.toDeviceX(cp2x), this.toDeviceY(cp2y), this.toDeviceX(x2), this.toDeviceY(y2));
    this.context.stroke();
  }

  rect(x1: number, y1: number, w: number, h: number, strokeStyle: string = '#F3E5F5'): void {
    this.context.strokeStyle = strokeStyle;
    const width = this.toDeviceScale(w);
    const height = this.toDeviceScale(h);
    this.context.strokeRect(this.toDeviceX(x1), this.toDeviceY(y1) - height, width, height);
  }

  text(text: string, x: number, y: number, font: string = null, strokeStyle: string = '#F3E5F5'): void {
    x = this.toDeviceX(x);
    y = this.toDeviceY(y);
    /// color for background
    this.context.fillStyle = this.getFill(); // '#303030';
    /// get width of text
    const oldFont = this.context.font;
    if (font) {
      this.context.font = font;
    }
    const width = this.context.measureText(text).width;
    /// draw background rect assuming height of font
    this.context.fillRect(x - width / 2.0, y - 6, width, 12);

    this.context.fillStyle = strokeStyle;
    this.context.textBaseline = 'middle';
    this.context.textAlign = 'center';
    this.context.fillText(text, x, y, width);
    if (font) {
      this.context.font = oldFont;
    }
  }

  image(img: ImageBitmap, x: number, y: number, width: number, height: number, scale: number): void {
    x = this.toDeviceX(x);
    y = this.toDeviceY(y);
    width = this.toDeviceScale(width * scale);
    height = this.toDeviceScale(height * scale);

    this.context.drawImage(img, 0, 0, img.width, img.height, x, y - height, width, height);
  }

  fromDeviceScale(val: number): number {
    return val / this.scale;
  }

  toDeviceScale(val: number): number {
    return val * this.scale;
  }

  toDeviceX(val: number): number {
    return this.center.x +
      this.toDeviceScale(this.offsetX) +
      this.toDeviceScale(val);
  }

  toDeviceY(val: number): number {
    return this.center.y -
      this.toDeviceScale(this.offsetY) -
      this.toDeviceScale(val);
  }

  getCenter(): Point {
    const el: HTMLDivElement = this.divElement.nativeElement;
    const centerX = el.clientWidth / 2.0 - el.offsetLeft / 2.0;
    const centerY = el.clientHeight / 2.0 - el.offsetTop / 2.0;
    return new Point(centerX, centerY);
  }

  drawData(): void {
    if (this.offscreenCanvas.width > 0 && this.offscreenCanvas.height > 0) {
      const ctx = this.canvasRef.nativeElement.getContext('2d', { alpha: false });
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.drawImage(this.offscreenCanvas, 0, 0);
    }
  }

  getFill(): string {
    return this.SurfaceFill; // this.divElement.nativeElement.style.background;
  }

  getGridStroke(): string {
    return  this.SurfaceStroke; // this.divElement.nativeElement.style.color;
  }

  drawOffscreen(): void {
    if (!this.canvasValid) {
      this.canvasValid = true;
      this.center = this.getCenter();

      this.context.lineWidth = 1;
      this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
      this.context.fillStyle = this.getFill(); // '#303030';
      this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);


      if (this.drawItems != null) {
        this.context.save();
        for (const entry of this.drawItems) {
          if (entry.getLayer() < 0) {
            entry.draw(this);
          }
        }
        this.context.restore();
      }

      this.drawGrid();

      if (this.drawItems != null) {
        this.context.save();
        for (const entry of this.drawItems) {
          if (entry.getLayer() >= 0) {
            entry.draw(this);
          }
        }
        this.context.restore();
      }

      this.drawVerticalRuler();
      this.drawHorizontalRuler();

      requestAnimationFrame(() => this.drawData());
    }
  }

  toLogical(point: Point): Point {
    const result = new Point(point.x, point.y);

    result.x = this.fromDeviceScale(point.x) -
      this.offsetX -
      this.fromDeviceScale(this.center.x);

    result.y = -(this.fromDeviceScale(point.y - this.center.y) + this.offsetY);

    return result;
  }

  drawHorizontalRuler(): void {
    const center = new Point(this.center.x, this.center.y);
    center.x += this.toDeviceScale(this.offsetX);
    center.y -= this.toDeviceScale(this.offsetY);
    let step = this.toDeviceScale(10);

    while (step < 5) {
      step /= 0.40;
    }

    while (step > 15) {
      step *= 0.40;
    }

    this.context.save();
    this.context.lineWidth = 0.25;
    this.context.strokeStyle = this.getGridStroke(); // '#FFFFFF';
    this.context.beginPath();

    let len = 10;
    let cnt = 0;

    for (let x = center.x; x >= 0; x -= step) {
      this.context.moveTo(x, 10);
      this.context.lineTo(x, len + 10);

      cnt++;
      if (len === 10) {
        this.drawRulerText(x, 5, true);
        cnt = 0;
        len = 5;
      } else if (cnt >= 4) {
        len = 10;
      }
    }

    len = 5;
    cnt = 0;

    for (let x = center.x + step; x <= this.context.canvas.width; x += step) {
      this.context.moveTo(x, 10);
      this.context.lineTo(x, len + 10);

      cnt++;
      if (len === 10) {
        this.drawRulerText(x, 5, true);
        cnt = 0;
        len = 5;
      } else if (cnt >= 4) {
        len = 10;
      }
    }

    this.context.closePath();
    this.context.stroke();
    this.context.restore();
  }

  drawVerticalRuler(): void {
    const center = new Point(this.center.x, this.center.y);
    center.x += this.toDeviceScale(this.offsetX);
    center.y -= this.toDeviceScale(this.offsetY);
    let step = this.toDeviceScale(10);

    while (step < 5) {
      step /= 0.40;
    }

    while (step > 15) {
      step *= 0.40;
    }

    this.context.save();
    this.context.lineWidth = 0.25;
    this.context.strokeStyle = this.getGridStroke(); // '#FFFFFF';

    this.context.beginPath();

    let len = 10;
    let cnt = 0;

    for (let y = center.y; y >= 0; y -= step) {
      this.context.moveTo(0, y);
      this.context.lineTo(len, y);

      cnt++;
      if (len === 10) {
        this.drawRulerText(12, y, false);
        cnt = 0;
        len = 5;
      } else if (cnt >= 4) {
        len = 10;
      }
    }

    len = 5;
    cnt = 0;

    for (let y = center.y + step; y <= this.context.canvas.height; y += step) {
      this.context.moveTo(0, y);
      this.context.lineTo(len, y);

      cnt++;
      if (len === 10) {
        this.drawRulerText(12, y, false);
        cnt = 0;
        len = 5;
      } else if (cnt >= 4) {
        len = 10;
      }
    }

    this.context.closePath();
    this.context.stroke();
    this.context.restore();
  }

  drawRulerText(x: number, y: number, horizontal: boolean): void {
    const logicalPt = this.toLogical(new Point(x, y));
    const text = horizontal ? Math.round(logicalPt.x).toString() : Math.round(logicalPt.y).toString();

    ///// color for background
    // this.context.fillStyle = '#303030';
    ///// get width of text
    const width = this.context.measureText(text).width;
    ///// draw background rect assuming height of font
    // this.context.fillRect(x - width / 2.0, y - 6, width, 12);

    this.context.fillStyle = this.getGridStroke(); // '#FFFFFF4A';
    if (horizontal) {
      this.context.textBaseline = 'top';
    }
    else {
      this.context.textBaseline = 'middle';
    }

    if (horizontal) {
      this.context.textAlign = 'center';
    }
    else {
      this.context.textAlign = 'start';
    }

    this.context.fillText(text, x, y, width);
  }

  drawGrid(): void {
    const center = new Point(this.center.x, this.center.y);
    center.x += this.toDeviceScale(this.offsetX);
    center.y -= this.toDeviceScale(this.offsetY);
    let step = this.toDeviceScale(10);

    while (step < 5) {
      step /= 0.40;
    }

    while (step > 15) {
      step *= 0.40;
    }

    this.context.save();
    this.context.globalAlpha = 0.4;
    this.context.lineWidth = 0.25;
    this.context.strokeStyle = this.getGridStroke(); // '#3C3C3C';
    // this.context.strokeStyle = "#FFFFFF";
    this.context.setLineDash([4, 2]);
    this.context.beginPath();

    for (let x = center.x; x >= 0; x -= step) {
      this.context.moveTo(x, 0);
      this.context.lineTo(x, this.context.canvas.height);
    }

    for (let x = center.x + step; x <= this.context.canvas.width; x += step) {
      this.context.moveTo(x, 0);
      this.context.lineTo(x, this.context.canvas.height);
    }

    for (let y = center.y; y >= 0; y -= step) {
      this.context.moveTo(0, y);
      this.context.lineTo(this.context.canvas.width, y);
    }

    for (let y = center.y + step; y <= this.context.canvas.height; y += step) {
      this.context.moveTo(0, y);
      this.context.lineTo(this.context.canvas.width, y);
    }

    this.context.closePath();
    this.context.stroke();

    step = step * 5;
    this.context.lineWidth = 0.5;
    this.context.strokeStyle = this.getGridStroke(); // '#3C3C3C';
    this.context.beginPath();

    const hw = 0.5;
    const w = 1;

    for (let x = center.x; x >= 0; x -= step) {
      for (let y = center.y; y >= 0; y -= step) {
        this.context.strokeRect(x - hw, y - hw, w, w);
      }

      for (let y = center.y + step; y <= this.context.canvas.height; y += step) {
        this.context.strokeRect(x - hw, y - hw, w, w);
      }
    }

    for (let x = center.x + step; x <= this.context.canvas.width; x += step) {
      for (let y = center.y; y >= 0; y -= step) {
        this.context.strokeRect(x - hw, y - hw, w, w);
      }

      for (let y = center.y + step; y <= this.context.canvas.height; y += step) {
        this.context.strokeRect(x - hw, y - hw, w, w);
      }
    }

    this.context.closePath();
    this.context.stroke();
    this.context.setLineDash([]);
    this.context.globalAlpha = 1;

    // this.context.strokeStyle = "#000000";
    // this.context.lineWidth = 1;
    // this.context.beginPath();

    // this.context.strokeRect(center.x - 2, center.y - 2, 4, 4);
    // this.context.stroke();

    if (this.drawAxises) {
      this.drawCoordinateSystem();
    }
    this.context.restore();
  }

  private drawCoordinateSystem(): void {
    const calcHeight = this.height - this.divElement.nativeElement.offsetTop;

    this.context.lineWidth = 1;
    this.context.strokeStyle = '#00BFA5';
    this.context.beginPath();
    this.context.moveTo(40, calcHeight - 40);
    this.context.lineTo(40, calcHeight - 140);
    this.context.lineTo(45, calcHeight - 135);
    this.context.lineTo(35, calcHeight - 135);
    this.context.lineTo(40, calcHeight - 140);
    this.context.stroke();

    this.context.lineWidth = 1;
    this.context.strokeStyle = '#0091EA';
    this.context.beginPath();
    this.context.moveTo(40, calcHeight - 40);
    this.context.lineTo(140, calcHeight - 40);
    this.context.lineTo(135, calcHeight - 35);
    this.context.lineTo(135, calcHeight - 45);
    this.context.lineTo(140, calcHeight - 40);
    this.context.stroke();
  }

  @HostListener('mousedown', ['$event'])
  onMousedown(event): void {
    if (this.isPan) {
      return;
    }
    const pt = new Point(event.clientX, event.clientY - this.divElement.nativeElement.offsetTop);
    this.stateEvent = event;
    const sd = new SurfaceData(pt, this.toLogical(pt), this, event, this.stateEvent);
    this.down.emit(sd);
  }

  @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent): void {
    if (this.isPan) {
      return;
    }
    const pt = new Point(event.clientX, event.clientY - this.divElement.nativeElement.offsetTop);
    const sd = new SurfaceData(pt, this.toLogical(pt), this, event, this.stateEvent);
    this.pointerPosition = sd.modelPoint;
    this.move.emit(sd);
  }

  @HostListener('mouseup', ['$event'])
  onMouseup(event: MouseEvent): void {
    if (this.isPan) {
      return;
    }
    const pt = new Point(event.clientX, event.clientY - this.divElement.nativeElement.offsetTop);
    const sd = new SurfaceData(pt, this.toLogical(pt), this, event, this.stateEvent);
    this.up.emit(sd);
    this.stateEvent = event;
  }

  @HostListener('touchstart', ['$event'])
  protected onPanStart(event): void {
    if (event.touches && event.touches.length > 0) {
      this.isPan = true;
      this.stateEvent = event;
      event.preventDefault();
      const touch = event.touches[0];
      const pt = new Point(touch.clientX, touch.clientY - this.divElement.nativeElement.offsetTop);
      const sd = new SurfaceData(pt, this.toLogical(pt), this, event, this.stateEvent);
      this.down.emit(sd);
    }
  }

  @HostListener('touchmove', ['$event'])
  protected onPanMove(event): void {
    if (event.touches && event.touches.length > 0) {
      event.preventDefault();
      const touch = event.touches[0];
      const pt = new Point(touch.clientX, touch.clientY - this.divElement.nativeElement.offsetTop);
      const sd = new SurfaceData(pt, this.toLogical(pt), this, event, this.stateEvent);
      this.move.emit(sd);
    }
  }

  @HostListener('touchend', ['$event'])
  protected onPanEnd(event): void {
    if (event.changedTouches && event.changedTouches.length > 0) {
      this.isPan = false;
      event.preventDefault();
      const touch = event.changedTouches[0];
      const pt = new Point(touch.clientX, touch.clientY - this.divElement.nativeElement.offsetTop);
      const sd = new SurfaceData(pt, this.toLogical(pt), this, event, this.stateEvent);
      this.up.emit(sd);
      this.stateEvent = event;
    }
  }

  @HostListener('mousewheel', ['$event'])
  onMousewheel(event): void {
    const pt = new Point(event.clientX, event.clientY - this.divElement.nativeElement.offsetTop);
    const sd = new SurfaceData(pt, this.toLogical(pt), this, event, this.stateEvent);
    this.wheelRotate.emit(sd);
  }
}
