module CanvasDiagram {
    export class MovableBehaviour {
        private mousePoint: Point = new Point();
        private isMouseDown: boolean = false;
        
        constructor(private ctx: RenderingContext, private elem: ElementBase) {
            ctx.canvas.addEventListener('mousedown', (e) => {
                if (ctx.isHitVisible(elem, 0) && !elem.isConnectionHover()) {
                    this.isMouseDown = true;
                    this.mousePoint = e.actualPoint();
                }
            });
            ctx.canvas.addEventListener('mouseup', (e) => {
                this.isMouseDown = false;
            });
            ctx.canvas.addEventListener('mousemove', (e) => {
                if (this.isMouseDown) {
                    var point = e.actualPoint();
                    var offsetX = point.x - this.mousePoint.x;
                    var offsetY = point.y - this.mousePoint.y;
                    ctx.getSelectedElements().forEach(e => {
                       e.rect.x += offsetX;
                       e.rect.y += offsetY; 
                    });
                    this.mousePoint.x = point.x;
                    this.mousePoint.y = point.y;
                }
            });
        }
        
        public isBeingMoved() { return this.isMouseDown; }
    }        
}