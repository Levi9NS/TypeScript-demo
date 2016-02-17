/// <reference path="./RenderingContext" />

module CanvasDiagram {
    export class ElementsConnection {
        constructor(
          public elementA: ElementBase,
          public elementB: ElementBase   
        )
        { }
        
        public render(renCtx: RenderingContext) {
            
        }
    }
}