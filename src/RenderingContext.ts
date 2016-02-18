module CanvasDiagram {
    export class RenderingContext {
        private _elements = new Array<ElementBase>();
        private _connections = new Array<ElementsConnection>();
        private _maxZ: number = 0;

        public ctx2d : CanvasRenderingContext2D;
        public background: string = "#E6E6E6";
        public mousePoint: Point = new Point();
                  
        constructor (public canvas: HTMLCanvasElement) {
            this.ctx2d = canvas.getContext("2d");
            canvas.addEventListener('mousemove', (e: MouseEvent) => {
                // this.mousePoint.x = e.clientX;
                // this.mousePoint.y = e.clientY;
                this.mousePoint = e.actualPoint();
            });
            canvas.addEventListener('mousedown', (e: MouseEvent) => {
                var hitElements = Array<ElementBase>();
                this._elements.forEach(element => {
                    var point = e.actualPoint();
                    if (element.rect.containsPointCoords(point.x, point.y)) {
                        hitElements.push(element);
                    }
                });
                if (hitElements.length > 0) {
                    hitElements = hitElements.sort((x, y) => x.zIndex > y.zIndex ? -1 : 1);
                    this.setElementZToTop(hitElements[0]);
                }
            });
        }
        
        private setElementZToTop(element: ElementBase) {
            this._maxZ++;
            element.zIndex = this._maxZ;
            this._elements = this._elements.sort((x, y) => x.zIndex > y.zIndex ? 1 : -1);
            this._elements.forEach(e => {
                e.isHover = e == element;
            });
        }
        
        public addElement = (elem: ElementBase) : ElementBase => {
            if (!elem) throw "Element is not provided";
            
            this._maxZ++;
            elem.setCanvas(this);
            this._elements.push(elem);
            elem.zIndex = this._maxZ;
            return elem;
        }
        
        public addConnection(elementA: ElementBase, elementB: ElementBase): void {
            var connection = new ElementsConnection(elementA, elementB);
            this._connections.push(connection)
        }
        
        public run(fps: number = 24) : void {
            setInterval(() => {
                this.updateState();
                this.render();
            }, fps);
        }
        
        private updateState() {
            this._elements.forEach(e => {
                e.updateState();
            });
            var isHover = false;
            var isConnectHover = false;
            for (let i = 0; i < this._elements.length; i++) {
                if (this._elements[i].isHover) {
                    isHover = true;
                    break;
                } else if (this._elements[i].isConnectionHover()) {
                    isConnectHover = true;
                    break;
                }
            }
            if (isHover) {
                this.canvas.style.cursor = "move";
            } else if (isConnectHover) {
                this.canvas.style.cursor = "pointer"; 
            } else {
                this.canvas.style.cursor = "default";
            }
        };
        
        public render = () => {
            this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx2d.fillStyle = this.background;
            this.ctx2d.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this._elements.forEach(e => {
                e.render(this);
            });
            
            this._connections.forEach(e => {
                e.render(this);
            });
        };
        
        public isHitVisible(element: ElementBase, extendByPixels: number = 0): boolean {
            var rect = element.rect.extendUniform(extendByPixels); 
            if (!rect.containsPoint(this.mousePoint)) {
                return false;
            }
            
            var elementsWithHit = this._elements.filter(x => x.rect.extendUniform(extendByPixels).containsPoint(this.mousePoint));
            if (elementsWithHit.length == 1) { 
                return true;
            }
            
            elementsWithHit = elementsWithHit.sort(x => x.zIndex);
            return element.zIndex >= elementsWithHit[0].zIndex;
        }
    }
}