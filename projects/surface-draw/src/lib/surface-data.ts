import { Point } from 'my-libs/base-geometry';
import { ISurfaceDraw } from 'my-libs/base-draw';

export class SurfaceData {
  constructor(public screenPoint: Point, public modelPoint: Point,
              public surface: ISurfaceDraw,
              public event: any, public stateEvent: any) {
  }
}
