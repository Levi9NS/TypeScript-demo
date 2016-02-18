module CanvasDiagram {
    export class ConnectionBehaviour {
        private _isMouseDown: boolean = false;
        
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
                    console.log('connect start');
                }
            });
            
            this.ctx.canvas.addEventListener('mouseup', (e: MouseEvent) => {
                if (this._isMouseDown) {
                    this._isMouseDown = false;
                    this.elem.isConnectionInProgress = false;
                    console.log('connect stop');
                }
            });
            
            this.ctx.canvas.addEventListener('mousemove', (e: MouseEvent) => {
                if (this._isMouseDown) {
                    console.log('connect move');
                }
            });
        }
    }
}