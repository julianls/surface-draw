import { IPoint } from "./interfaces/point";
import { ILine } from "./interfaces/line";
export declare class Line implements ILine {
    first: IPoint;
    second: IPoint;
    constructor(first: IPoint, second: IPoint);
}
