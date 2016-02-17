module CanvasDiagram {
    export class MovableBehaviour {
        private mousePoint: Point = new Point();
        private isMouseDown: boolean = false;
        
        constructor(private ctx: RenderingContext, private elem: ElementBase) {
            ctx.canvas.addEventListener('mousedown', (e) => {
                // if (elem.rect.containsPointCoords(e.clientX, e.clientY)) {
                //     this.isMouseDown = true;
                //     this.mousePoint.x = e.clientX;
                //     this.mousePoint.y = e.clientY;
                // }
                if (ctx.isHitVisible(elem)) {
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
                    elem.rect.x += offsetX;
                    elem.rect.y += offsetY;
                    this.mousePoint.x = point.x;
                    this.mousePoint.y = point.y;
                }
            });
        }
    }
}