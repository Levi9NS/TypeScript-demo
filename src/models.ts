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
        public middleX(): number { return this.x + (this.w / 2); }
        public middleY(): number { return this.y + (this.h / 2); }
        
        public containsPointCoords(x: number, y: number) : boolean {
            return this.x <= x && this.right() >= x
                && this.y <= y && this.bottom() >= y; 
        }
        
        public containsPoint(point: Point) : boolean {
            return this.containsPointCoords(point.x, point.y);
        }
        
        public extendUniform(byPx: number): Rect {
            if (byPx == 0) return this;
            
            return new Rect(this.x - byPx, this.y - byPx, this.w + 2*byPx, this.h + 2*byPx);
        }
        
        public isIntersecting(other: Rect): boolean {
            return !(this.x > other.right() || this.right() < other.x || this.y > other.bottom() || this.bottom() < other.y);
        }
        
        public contains(other: Rect): boolean {
            return (this.x <= other.x && this.right() >= other.right() && this.y <= other.y && this.bottom() >= other.bottom() );
        }
    }
}