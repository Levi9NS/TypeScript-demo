module CanvasDiagram {
    export class RenderingContext {
        private _elements = new Array<ElementBase>();
        private _connections = new Array<ElementsConnection>();
        private _maxZ: number = 0;
        private _selectBehaviour: SelectBehaviour;

        public ctx2d : CanvasRenderingContext2D;
        public background: string = "#E6E6E6";
        public mousePoint: Point = new Point();
        // this two are used to determine if connection can be made to another element
        public connectionStartLocalId: number = 0;
        public connectionEndLocalId: number = 0;
                  
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
                    this.addElementToSelection(hitElements[0], !e.shiftKey);
                } else {
                    this.addElementToSelection(null, true); // clear selection
                }
            });
            
            this._selectBehaviour = new SelectBehaviour(this);
        }
        
        public addElementToSelection(elem: ElementBase, removeOtherSelections: boolean) {
            if (removeOtherSelections) {
                this._elements.forEach(x => x.isSelected = false);
            }
            if (elem) {
                elem.isSelected = true;
            }
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
        
        public addConnection(endElement: ElementBase, startElement: ElementBase): void {
            var connection = new ElementsConnection(endElement, startElement);
            if (this._connections.filter(x => x.connectionId == connection.connectionId).length == 0) {
                this._connections.push(connection);
            }
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
                if (this._elements[i].isConnectionHover() || this._elements[i].isConnectionInProgress) {
                    isConnectHover = true;
                    break;
                } else if (this._elements[i].isHover) {
                    isHover = true;
                    break;
                }
            }
            if (isConnectHover) {
                this.canvas.style.cursor = "pointer";
            } else if (isHover) {
                this.canvas.style.cursor = "move"; 
            } else {
                this.canvas.style.cursor = "default";
            }
        };
        
        public render() {
            this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx2d.fillStyle = this.background;
            this.ctx2d.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this._elements.forEach(e => {
                e.render(this);
            });
            
            this._connections.forEach(e => {
                e.render(this);
            });
            
            this._selectBehaviour.render();
        };
        
        public isAnyElementBeingMoved() {
            return this._elements.filter(x => x.isBeingMoved()).length > 0;
        }
        
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
        
        public getSelectedElements(): Array<ElementBase> {
            return this._elements.filter(x => x.isSelected);
        }
        
        public findFreeSpace(): Point {
            var testRect = new Rect(10, 10, 200, 100);
            
            for (let x = 10; x < this.canvas.width - 200; x += 10) {
                for (let y = 10; y < this.canvas.height - 100; y += 10) {
                    testRect.x = x;
                    testRect.y = y;
                    if ((this._elements.filter(r => r.rect.extendUniform(10).isIntersecting(testRect))).length == 0) {
                        return new Point(x, y);
                    }
                }
            }
            testRect.w = 20;
            testRect.h = 20;
            for (let x = 10; x < this.canvas.width; x += 2) {
                for (let y = 10; y < this.canvas.height; y += 2) {
                    testRect.x = x;
                    testRect.y = y;
                    if ((this._elements.filter(r => r.rect.isIntersecting(testRect))).length == 0) {
                        return new Point(x, y);
                    }
                }
            }
            
            return new Point(15, 15);
        }
        
        public getHitElementConnectionPoint(targetIsStart?: boolean): ElementBase {
            var element = this._elements.filter(x => this.isHitVisible(x, 4));
            if (element.length > 0) {
                if (targetIsStart && element[0].isHoverConnectStart) {
                    return element[0];
                } 
                if (!targetIsStart && element[0].isHoverConnectEnd) {
                    return element[0];
                }
            }
            return null;
        }
        
        public getHitElement(): ElementBase {
            var element = this._elements.filter(x => this.isHitVisible(x, 4));
            if (element.length > 0) return element[0];
        }
        
        public getAllElements() {
            return this._elements.filter(x => true);
        }
    }
}