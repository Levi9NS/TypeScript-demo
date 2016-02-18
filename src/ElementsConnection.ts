/// <reference path="./RenderingContext" />

module CanvasDiagram {
    export class ElementsConnection {
        public connectionId: number;
        
        constructor(
          public endElement: ElementBase,
          public startElement: ElementBase   
        )
        { 
            this.connectionId = endElement.localId * 10000 + startElement.localId;
        }
        
        public render(renCtx: RenderingContext) {
            var end = new Point(this.endElement.rect.middleX(), this.endElement.rect.bottom());
            var start = new Point (this.startElement.rect.middleX(), this.startElement.rect.y);
            // var halfX = (end.x + start.x) / 2;
            var halfY = (end.y + start.y) / 2;
            
            renCtx.ctx2d.beginPath();
            renCtx.ctx2d.setLineDash([]);
            renCtx.ctx2d.moveTo(end.x, end.y);
            renCtx.ctx2d.lineTo(end.x, halfY);
            renCtx.ctx2d.lineTo(start.x, halfY);
            renCtx.ctx2d.lineTo(start.x, start.y);
            renCtx.ctx2d.stroke();
        }
    }
}