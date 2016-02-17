var canvas = document.getElementById("theCanvas");
var renCtx = new CanvasDiagram.RenderingContext(canvas);
var elem = new CanvasDiagram.ElementBase();
elem.text = elem.guid.substr(0, 4);

var elem2 = new CanvasDiagram.ElementBase();
elem2.rect.x = 200;
elem2.rect.y = 200;
elem2.text = elem2.guid.substr(0, 4);

renCtx.run();
renCtx.addElement(elem);
renCtx.addElement(elem2);