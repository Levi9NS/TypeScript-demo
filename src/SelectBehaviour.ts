module CanvasDiagram {
    export class SelectBehaviour {
        private _isMouseDown: boolean = false;
        private _mousePoint: Point;
        
        constructor(
            private ctx: RenderingContext
        ) { 
            this.addEventListeners();
        }
        
        private getSelectionRect(): Rect {
            var secondPoint = this.ctx.mousePoint;
                var firstPoint = this._mousePoint;
                
                var x: number = secondPoint.x < firstPoint.x ? secondPoint.x : firstPoint.x;
                var y: number = secondPoint.y < firstPoint.y ? secondPoint.y : firstPoint.y;
                var w = Math.abs(secondPoint.x - firstPoint.x);
                var h = Math.abs(secondPoint.y - firstPoint.y);
                return new Rect(x, y, w ,h);
        }
        
        private addEventListeners() {
            this.ctx.canvas.addEventListener('mousedown', (e) => {
                if (!this.ctx.getHitElementConnectionPoint()) {
                    this._isMouseDown = true;
                    this._mousePoint = new Point(this.ctx.mousePoint.x, this.ctx.mousePoint.y);
                }
            });
            
            this.ctx.canvas.addEventListener('mouseup', (e) => {
                var rect = this.getSelectionRect();
                this._isMouseDown = false;
                
                var elements = this.ctx.getAllElements().filter(element => rect.contains(element.rect));
                this.ctx.addElementToSelection(null, true);
                elements.forEach(e => this.ctx.addElementToSelection(e, false));                
            });
        }
        
        public render(): void {
            if (this._isMouseDown && !this.ctx.isAnyElementBeingMoved()) {
                var rect = this.getSelectionRect();
                // console.log(rect.x + " " + rect.y + " " + rect.w + " " + rect.h);
                this.ctx.ctx2d.beginPath();
                this.ctx.ctx2d.fillStyle = "rgba(209, 255, 194, 0.5)"
                this.ctx.ctx2d.fillRect(rect.x, rect.y, rect.w, rect.h);
                this.ctx.ctx2d.fill();
                this.ctx.ctx2d.strokeStyle = "black";
                this.ctx.ctx2d.lineWidth = 1;
                this.ctx.ctx2d.setLineDash([2]);
                this.ctx.ctx2d.stroke();
            }
        }
    }
}