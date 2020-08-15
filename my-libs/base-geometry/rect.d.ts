import { Point } from "./point";
export declare class Rect {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x: number, y: number, width: number, height: number);
    get left(): number;
    get right(): number;
    get top(): number;
    get bottom(): number;
    get center(): Point;
    union(pt: Point): void;
    containsPos(x: number, y: number): boolean;
    containsPoint(value: Point): boolean;
    containsRect(value: Rect): boolean;
    intersects(value: Rect): boolean;
    hasCommonParts(value: Rect): boolean;
}
