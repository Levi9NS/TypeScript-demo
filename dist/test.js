( function() {
    var canvas = document.getElementById("theCanvas");
    var renCtx = new CanvasDiagram.RenderingContext(canvas);

    renCtx.run();

    var btn = document.getElementById('addButton');
    btn.addEventListener('click', function() {
       var point = renCtx.findFreeSpace();
       var elem = new CanvasDiagram.ElementBase();
       elem.rect.x = point.x;
       elem.rect.y = point.y;
       elem.text = elem.guid.substr(0, 4);
       renCtx.addElement(elem);
    });
})();