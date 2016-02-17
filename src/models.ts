module CanvasDiagram {
    export class Point {
        constructor(
            public x: number = 0, 
            public y: number = 0
        ) {}
    }
    
    export class Rect {
        constructor(
            public x: number = 0, 
            public y: number = 0, 
            public w: number = 0, 
            public h: number = 0
        ) {}
        
        public right(): number { return this.x + this.w; }
        public bottom(): number { return this.y + this.h; }
        
        public containsPointCoords(x: number, y: number) : boolean {
            return this.x <= x && this.right() >= x
                && this.y <= y && this.bottom() >= y; 
        }
        
        public containsPoint(point: Point) : boolean {
            return this.containsPointCoords(point.x, point.y);
        }
    }
}