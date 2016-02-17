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
                    this.mousePoint.x = e.clientX;
                    this.mousePoint.y = e.clientY;
                }
            });
            ctx.canvas.addEventListener('mouseup', (e) => {
                this.isMouseDown = false;
            });
            ctx.canvas.addEventListener('mousemove', (e) => {
                if (this.isMouseDown) {
                    var offsetX = e.clientX - this.mousePoint.x;
                    var offsetY = e.clientY - this.mousePoint.y;
                    elem.rect.x += offsetX;
                    elem.rect.y += offsetY;
                    this.mousePoint.x = e.clientX;
                    this.mousePoint.y = e.clientY;
                }
            });
        }
    }
}