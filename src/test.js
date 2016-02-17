var canvas = document.getElementById("theCanvas");
var renCtx = new CanvasDiagram.RenderingContext(canvas);
var elem = new CanvasDiagram.ElementBase();
elem.rect.x = 600;
elem.rect.y = 600;
elem.text = elem.guid.substr(0, 4);

var elem2 = new CanvasDiagram.ElementBase();
elem2.rect.x = 200;
elem2.rect.y = 200;
elem2.text = elem2.guid.substr(0, 4);

renCtx.run();
renCtx.addElement(elem);
renCtx.addElement(elem2);
renCtx.addConnection(elem, elem2);

var elem3 = new CanvasDiagram.ElementBase();
elem3.rect.x = 100;
elem3.rect.y = 100;
elem3.text = elem3.guid.substr(0, 4);

renCtx.addElement(elem3);
renCtx.addConnection(elem, elem3);

for (var i = 0; i < 2; i++) {
    var e = new CanvasDiagram.ElementBase();
    e.text = e.guid.substr(0, 4);
    e.rect.x = 2 + 10 * i;
    e.rect.y = 2 + 10 * i;
    
    renCtx.addElement(e);
    renCtx.addConnection(elem, e);
}