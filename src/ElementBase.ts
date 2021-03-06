// Base element for rectangle
/// <reference path="./RenderingContext" />
/// <reference path="./utils" />
/// <reference path="./interfaces" />

module CanvasDiagram {
    
    
    export class ElementBase implements IMovable, IEventPublisher {
        
        public tag: any = null;
        public guid: string = Random.guid();
        public localId: number = LocalId.getNextId();
        
        public rect: Rect = new Rect(10, 10, 162, 62);
        public background: string = '#A1E7FF';
        public hoverBackground: string = '#00B2F0';
        public foreground: string = 'black';
        public text: string = 'this is the single one long sample text';
        public borderWidth: number = 1;
        public borderWidthSelected: number = 3;
        public renderRect: boolean = true;
        public isHover: boolean = false;  
        public isHoverConnectStart: boolean = false;
        public isHoverConnectEnd: boolean = false;
        public zIndex: number = 0;
        public hasConnectionPoints: boolean = true;
        public isConnectionInProgress: boolean = false;
        public isSelected: boolean = false;
        
        private _canvas: HTMLCanvasElement;
        private _eventSubscribers = new Array<IEventSubscirberItem>();
        private _renderingCtx: RenderingContext;
        private _movableBehaviour: MovableBehaviour;
        private _connectBehaviour: ConnectionBehaviour;
        private _connectRadius: number = 5;
        private _connectDiameter: number;
        
        constructor() {
            this._connectDiameter = this._connectRadius * 2;
        }
        
        public setCanvas (ctx: RenderingContext): void {
            this._canvas = ctx.canvas;
            this._renderingCtx = ctx;
            this._movableBehaviour = new MovableBehaviour(ctx, this);
            this._connectBehaviour = new ConnectionBehaviour(ctx, this);
        }
        
        public updateState(): void {
            this.isHover = this._renderingCtx.isHitVisible(this, 4);
            this.isHoverConnectStart = false;
            this.isHoverConnectEnd = false;
            this.updateConnectionsHover(this._renderingCtx.mousePoint);
            
            if (this.isHoverConnectEnd || this.isHoverConnectEnd) {
                this.isHover = false;
            }
        }
        
        public subscribeToEvent(eventName: string, handler: (sender: Object, data: Object) => void): string {
            var id = Random.guid();
            this._eventSubscribers.push({
                eventName: eventName,
                subscriptionId: id,
                handler: handler
            });
            return id;
        }
        
        public unsubscribe(subscriptionId: string): void {
            var found = this._eventSubscribers.filter(x => x.subscriptionId == subscriptionId);
            for (let i = found.length - 1; i >= 0; i--) {
                let index = this._eventSubscribers.indexOf(found[i]);
                this._eventSubscribers.splice(index, 1); 
            }
        }
        
        // private raiseEvent(name: string, data: Object) {
        //     var handlers = this._eventSubscribers.filter(x => x.eventName == name);
        //     handlers.forEach(handler => {
        //         if (handler.handler(this, data)) { // if handeled
        //             return;
        //         }
        //     });
        // }
        
        static defaultTextStyle: () => CanvasDiagram.TextStyle = function() {
            var style = CanvasDiagram.TextStyle.wrapStyle();
            style.fontSizePt = 10;
            style.center = true;
            //style.fontStyle = "bold";
            return style;
        }
        
        public raiseRectChanged = function(): void {
            var event = new Event('rectChange');
            dispatchEvent(event);
        }
        
        public render (renCtx: RenderingContext) {
            renCtx.ctx2d.setLineDash([]);
            if (this.renderRect) {
                renCtx.ctx2d.beginPath();
                renCtx.ctx2d.rect(this.rect.x + 0.5, this.rect.y + 0.5, this.rect.w, this.rect.h);
                if (this.isHover && !this.isConnectionHover()) renCtx.ctx2d.fillStyle = this.hoverBackground;
                else renCtx.ctx2d.fillStyle = this.background;
                renCtx.ctx2d.fill();
                if (this.isSelected) {
                    renCtx.ctx2d.lineWidth = this.borderWidthSelected;
                } else {
                    renCtx.ctx2d.lineWidth = this.borderWidth;
                }
                renCtx.ctx2d.strokeStyle = this.foreground;
                renCtx.ctx2d.stroke();
            }
            if (this.text) {
                var style = CanvasDiagram.ElementBase.defaultTextStyle();
                var renderingPoint = new CanvasDiagram.Point(this.rect.x + 5, this.rect.y + style.fontSizePt * 1.2);
                CanvasDiagram.TextRenderer.render(this.text, renCtx.ctx2d, this.rect, style);
            }
            if (this.hasConnectionPoints) {
                this.renderConnectionPoint(renCtx);
            }
        }
        
        public isConnectionHover(): boolean { return this.isHoverConnectEnd || this.isHoverConnectStart; }
                
        public isBeingMoved() { return this._movableBehaviour.isBeingMoved(); }
                        
        private renderConnectionPoint(renCtx: RenderingContext) {
            var x = this.rect.middleX();
                        
            renCtx.ctx2d.beginPath();
            if (this.isHoverConnectEnd) {
                renCtx.ctx2d.fillStyle = this.hoverBackground;
                renCtx.ctx2d.lineWidth = 2.5;
            } else {
                renCtx.ctx2d.fillStyle = this.background;
                renCtx.ctx2d.lineWidth = 1;
            }
            renCtx.ctx2d.arc(x, this.rect.bottom(), this._connectRadius, 0, 2 * Math.PI);
            renCtx.ctx2d.fill();
            renCtx.ctx2d.strokeStyle = 'black';
            renCtx.ctx2d.stroke();
            
            renCtx.ctx2d.beginPath();
            if (this.isHoverConnectStart) {
                renCtx.ctx2d.fillStyle = this.hoverBackground;
                renCtx.ctx2d.lineWidth = 2.5;
            } else {
                renCtx.ctx2d.fillStyle = this.background;
                renCtx.ctx2d.lineWidth = 1;
            }
            renCtx.ctx2d.arc(x, this.rect.y, this._connectRadius, 0, 2 * Math.PI);
            renCtx.ctx2d.fill();
            renCtx.ctx2d.stroke();
            
            this._connectBehaviour.render();
        }
        
        private updateConnectionsHover(mousePoint: Point): void {
            // TODO: cache this for non moved elements
            
            var leftX = this.rect.middleX() - this._connectRadius;
            var startRect = new Rect(leftX, this.rect.y - this._connectRadius, this._connectDiameter, this._connectDiameter);
            var endRect = new Rect(leftX, this.rect.bottom() - this._connectRadius, this._connectDiameter, this._connectDiameter);
            this.isHoverConnectStart = startRect.containsPoint(mousePoint);
            this.isHoverConnectEnd = endRect.containsPoint(mousePoint);
        }
    }
}