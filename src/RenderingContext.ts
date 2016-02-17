module CanvasDiagram {
    export class RenderingContext {
        private _elements = new Array<ElementBase>();
        private _maxZ: number = 0;

        public ctx2d : CanvasRenderingContext2D;
        public background: string = "#E6E6E6";
        public mousePoint: Point = new Point();
                  
        constructor (public canvas: HTMLCanvasElement) {
            this.ctx2d = canvas.getContext("2d");
            canvas.addEventListener('mousemove', (e: MouseEvent) => {
                this.mousePoint.x = e.clientX;
                this.mousePoint.y = e.clientY;
            });
            canvas.addEventListener('mousedown', (e: MouseEvent) => {
                var hitElements = Array<ElementBase>();
                this._elements.forEach(element => {
                    if (element.rect.containsPointCoords(e.clientX, e.clientY)) {
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
            elem.setCanvas(this);
            this._elements.push(elem);
            return elem;
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
            for (let i = 0; i < this._elements.length; i++) {
                if (this._elements[i].isHover) {
                    isHover = true;
                    break;
                }
            }
            if (isHover) {
                this.canvas.style.cursor = "move";
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
        };
        
        public isHitVisible(element: ElementBase): boolean {
            if (!element.rect.containsPoint(this.mousePoint)) {
                return false;
            }
            
            var elementsWithHit = this._elements.filter(x => x.rect.containsPoint(this.mousePoint));
            if (elementsWithHit.length == 1) { 
                return true;
            }
            
            elementsWithHit = elementsWithHit.sort(x => x.zIndex);
            return element.zIndex >= elementsWithHit[0].zIndex;
        }
    }
}