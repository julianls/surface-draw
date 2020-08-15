import { IPoint } from './point';
export interface ISurfaceDraw {
    scale: number;
    offsetX: number;
    offsetY: number;
    mousePosition: IPoint;
    fromDeviceScale(val: number): number;
    toDeviceScale(val: number): number;
    line(x1: number, y1: number, x2: number, y2: number, strokeStyle?: string): any;
    polyline(points: IPoint[], strokeStyle?: string): any;
    polygon(points: IPoint[], strokeStyle?: string, fillStyle?: string): any;
    bezierCurve(x1: number, y1: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number, x2: number, y2: number, strokeStyle?: string): any;
    rect(x: number, y: number, w: number, h: number, strokeStyle?: string): any;
    text(text: string, x: number, y: number, font?: string, strokeStyle?: string): any;
    image(img: ImageBitmap, x: number, y: number, width: number, height: number, scale: number): any;
}
