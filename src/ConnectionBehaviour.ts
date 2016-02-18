module CanvasDiagram {
    export class ConnectionBehaviour {
        private _isMouseDown: boolean = false;
        private _startPoint: Point;
        private _isStartOnStartPoint: boolean;

        public connectionInProgressOnStart: boolean = false;
        public connectionInProgressOnEnd: boolean = true;

        constructor(
            private ctx: RenderingContext,
            private elem: ElementBase
        ) {
            this.addEventListeners();
        }

        private addEventListeners() {
            this.ctx.canvas.addEventListener('mousedown', (e: MouseEvent) => {
                if (this.elem.isConnectionHover()) {
                    this._isMouseDown = true;
                    this.elem.isConnectionInProgress = true;
                    this._startPoint = new Point(e.actualPoint().x, e.actualPoint().y);
                    this._isStartOnStartPoint = this.elem.isHoverConnectStart;
                }
            });

            this.ctx.canvas.addEventListener('mouseup', (e: MouseEvent) => {
                if (this._isMouseDown) {
                    this._isMouseDown = false;
                    this.elem.isConnectionInProgress = false;
                    var target = this.ctx.getTargetElementUnderMousePoint(!this._isStartOnStartPoint);
                    if (target) {
                        var endElement = this.elem;
                        var startElement = target;
                        if (this._isStartOnStartPoint) {
                            var endElement = target;
                            var startElement = this.elem;
                        }
                        this.ctx.addConnection(endElement, startElement);
                    }
                }
            });

            // this.ctx.canvas.addEventListener('mousemove', (e: MouseEvent) => {
            //     
            // });
        }

        public render(): void {
            if (this._isMouseDown) {
                this.ctx.ctx2d.beginPath();
                this.ctx.ctx2d.moveTo(this._startPoint.x, this._startPoint.y);
                this.ctx.ctx2d.fillStyle = 'black';
                this.ctx.ctx2d.setLineDash([5, 5]);
                this.ctx.ctx2d.lineWidth = 2.5;
                this.ctx.ctx2d.lineTo(this.ctx.mousePoint.x, this.ctx.mousePoint.y);
                this.ctx.ctx2d.stroke();
            }
        }
    }
}