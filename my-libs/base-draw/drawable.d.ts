import { ISurfaceDraw } from './surfacedraw';
export interface IDrawable {
    getLayer(): number;
    draw(surface: ISurfaceDraw): any;
}
