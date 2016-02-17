interface MouseEvent {
    actualPoint(): CanvasDiagram.Point
}

MouseEvent.prototype.actualPoint = function() {
    var x = this.pageX - this.target.offsetLeft;
	var y = this.pageY - this.target.offsetTop;
	
    return new CanvasDiagram.Point(x, y);
};