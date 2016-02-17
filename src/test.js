var canvas = document.getElementById("theCanvas");
var renCtx = new CanvasDiagram.RenderingContext(canvas);
var elem = new CanvasDiagram.ElementBase();

var elem2 = new CanvasDiagram.ElementBase();
elem2.rect.x = 200;
elem2.rect.y = 200;
elem2.text = 'text';

renCtx.run();
renCtx.addElement(elem);
renCtx.addElement(elem2);