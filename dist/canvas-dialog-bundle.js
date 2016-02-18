var CanvasDiagram;
(function (CanvasDiagram) {
    var ConnectionBehaviour = (function () {
        function ConnectionBehaviour(ctx, elem) {
            this.ctx = ctx;
            this.elem = elem;
            this._isMouseDown = false;
            this.connectionInProgressOnStart = false;
            this.connectionInProgressOnEnd = true;
            this.addEventListeners();
        }
        ConnectionBehaviour.prototype.addEventListeners = function () {
            var _this = this;
            this.ctx.canvas.addEventListener('mousedown', function (e) {
                if (_this.elem.isConnectionHover()) {
                    _this._isMouseDown = true;
                    _this.elem.isConnectionInProgress = true;
                    _this._startPoint = new CanvasDiagram.Point(e.actualPoint().x, e.actualPoint().y);
                    _this._isStartOnStartPoint = _this.elem.isHoverConnectStart;
                }
            });
            this.ctx.canvas.addEventListener('mouseup', function (e) {
                if (_this._isMouseDown) {
                    _this._isMouseDown = false;
                    _this.elem.isConnectionInProgress = false;
                    var target = _this.ctx.getHitElementConnectionPoint(!_this._isStartOnStartPoint);
                    if (target) {
                        var endElement = _this.elem;
                        var startElement = target;
                        if (_this._isStartOnStartPoint) {
                            var endElement = target;
                            var startElement = _this.elem;
                        }
                        _this.ctx.addConnection(endElement, startElement);
                    }
                }
            });
        };
        ConnectionBehaviour.prototype.render = function () {
            if (this._isMouseDown) {
                this.ctx.ctx2d.beginPath();
                this.ctx.ctx2d.moveTo(this._startPoint.x, this._startPoint.y);
                this.ctx.ctx2d.fillStyle = 'black';
                this.ctx.ctx2d.setLineDash([5, 5]);
                this.ctx.ctx2d.lineWidth = 2.5;
                this.ctx.ctx2d.lineTo(this.ctx.mousePoint.x, this.ctx.mousePoint.y);
                this.ctx.ctx2d.stroke();
            }
        };
        return ConnectionBehaviour;
    }());
    CanvasDiagram.ConnectionBehaviour = ConnectionBehaviour;
})(CanvasDiagram || (CanvasDiagram = {}));
var CanvasDiagram;
(function (CanvasDiagram) {
    var RenderingContext = (function () {
        function RenderingContext(canvas) {
            var _this = this;
            this.canvas = canvas;
            this._elements = new Array();
            this._connections = new Array();
            this._maxZ = 0;
            this.background = "#E6E6E6";
            this.mousePoint = new CanvasDiagram.Point();
            this.connectionStartLocalId = 0;
            this.connectionEndLocalId = 0;
            this.addElement = function (elem) {
                if (!elem)
                    throw "Element is not provided";
                _this._maxZ++;
                elem.setCanvas(_this);
                _this._elements.push(elem);
                elem.zIndex = _this._maxZ;
                return elem;
            };
            this.ctx2d = canvas.getContext("2d");
            canvas.addEventListener('mousemove', function (e) {
                _this.mousePoint = e.actualPoint();
            });
            canvas.addEventListener('mousedown', function (e) {
                var hitElements = Array();
                _this._elements.forEach(function (element) {
                    var point = e.actualPoint();
                    if (element.rect.containsPointCoords(point.x, point.y)) {
                        hitElements.push(element);
                    }
                });
                if (hitElements.length > 0) {
                    hitElements = hitElements.sort(function (x, y) { return x.zIndex > y.zIndex ? -1 : 1; });
                    _this.setElementZToTop(hitElements[0]);
                    _this.addElementToSelection(hitElements[0], !e.shiftKey);
                }
                else {
                    _this.addElementToSelection(null, true);
                }
            });
            this._selectBehaviour = new CanvasDiagram.SelectBehaviour(this);
        }
        RenderingContext.prototype.addElementToSelection = function (elem, removeOtherSelections) {
            if (removeOtherSelections) {
                this._elements.forEach(function (x) { return x.isSelected = false; });
            }
            if (elem) {
                elem.isSelected = true;
            }
        };
        RenderingContext.prototype.setElementZToTop = function (element) {
            this._maxZ++;
            element.zIndex = this._maxZ;
            this._elements = this._elements.sort(function (x, y) { return x.zIndex > y.zIndex ? 1 : -1; });
            this._elements.forEach(function (e) {
                e.isHover = e == element;
            });
        };
        RenderingContext.prototype.addConnection = function (endElement, startElement) {
            var connection = new CanvasDiagram.ElementsConnection(endElement, startElement);
            if (this._connections.filter(function (x) { return x.connectionId == connection.connectionId; }).length == 0) {
                this._connections.push(connection);
            }
        };
        RenderingContext.prototype.run = function (fps) {
            var _this = this;
            if (fps === void 0) { fps = 24; }
            setInterval(function () {
                _this.updateState();
                _this.render();
            }, fps);
        };
        RenderingContext.prototype.updateState = function () {
            this._elements.forEach(function (e) {
                e.updateState();
            });
            var isHover = false;
            var isConnectHover = false;
            for (var i = 0; i < this._elements.length; i++) {
                if (this._elements[i].isConnectionHover() || this._elements[i].isConnectionInProgress) {
                    isConnectHover = true;
                    break;
                }
                else if (this._elements[i].isHover) {
                    isHover = true;
                    break;
                }
            }
            if (isConnectHover) {
                this.canvas.style.cursor = "pointer";
            }
            else if (isHover) {
                this.canvas.style.cursor = "move";
            }
            else {
                this.canvas.style.cursor = "default";
            }
        };
        ;
        RenderingContext.prototype.render = function () {
            var _this = this;
            this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx2d.fillStyle = this.background;
            this.ctx2d.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this._elements.forEach(function (e) {
                e.render(_this);
            });
            this._connections.forEach(function (e) {
                e.render(_this);
            });
            this._selectBehaviour.render();
        };
        ;
        RenderingContext.prototype.isAnyElementBeingMoved = function () {
            return this._elements.filter(function (x) { return x.isBeingMoved(); }).length > 0;
        };
        RenderingContext.prototype.isHitVisible = function (element, extendByPixels) {
            var _this = this;
            if (extendByPixels === void 0) { extendByPixels = 0; }
            var rect = element.rect.extendUniform(extendByPixels);
            if (!rect.containsPoint(this.mousePoint)) {
                return false;
            }
            var elementsWithHit = this._elements.filter(function (x) { return x.rect.extendUniform(extendByPixels).containsPoint(_this.mousePoint); });
            if (elementsWithHit.length == 1) {
                return true;
            }
            elementsWithHit = elementsWithHit.sort(function (x) { return x.zIndex; });
            return element.zIndex >= elementsWithHit[0].zIndex;
        };
        RenderingContext.prototype.getSelectedElements = function () {
            return this._elements.filter(function (x) { return x.isSelected; });
        };
        RenderingContext.prototype.findFreeSpace = function () {
            var testRect = new CanvasDiagram.Rect(10, 10, 200, 100);
            for (var x = 10; x < this.canvas.width - 200; x += 10) {
                for (var y = 10; y < this.canvas.height - 100; y += 10) {
                    testRect.x = x;
                    testRect.y = y;
                    if ((this._elements.filter(function (r) { return r.rect.extendUniform(10).isIntersecting(testRect); })).length == 0) {
                        return new CanvasDiagram.Point(x, y);
                    }
                }
            }
            testRect.w = 20;
            testRect.h = 20;
            for (var x = 10; x < this.canvas.width; x += 2) {
                for (var y = 10; y < this.canvas.height; y += 2) {
                    testRect.x = x;
                    testRect.y = y;
                    if ((this._elements.filter(function (r) { return r.rect.isIntersecting(testRect); })).length == 0) {
                        return new CanvasDiagram.Point(x, y);
                    }
                }
            }
            return new CanvasDiagram.Point(15, 15);
        };
        RenderingContext.prototype.getHitElementConnectionPoint = function (targetIsStart) {
            var _this = this;
            var element = this._elements.filter(function (x) { return _this.isHitVisible(x, 4); });
            if (element.length > 0) {
                if (targetIsStart && element[0].isHoverConnectStart) {
                    return element[0];
                }
                if (!targetIsStart && element[0].isHoverConnectEnd) {
                    return element[0];
                }
            }
            return null;
        };
        RenderingContext.prototype.getHitElement = function () {
            var _this = this;
            var element = this._elements.filter(function (x) { return _this.isHitVisible(x, 4); });
            if (element.length > 0)
                return element[0];
        };
        RenderingContext.prototype.getAllElements = function () {
            return this._elements.filter(function (x) { return true; });
        };
        return RenderingContext;
    }());
    CanvasDiagram.RenderingContext = RenderingContext;
})(CanvasDiagram || (CanvasDiagram = {}));
var CanvasDiagram;
(function (CanvasDiagram) {
    var Random = (function () {
        function Random() {
        }
        Random.randomInt = function (min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        };
        Random.randomString = function (length, charset) {
            if (charset === void 0) { charset = "qwertyuiopasdfghjklzxcvbnm789456123QWERTYUIOPASDFGHJKLZXCVBNM!@#$%^&*"; }
            var s = "";
            for (var i = 0; i < length; i++) {
                s += charset.charAt(Random.randomInt(0, charset.length));
            }
            return s;
        };
        Random.guid = function () {
            var charset = 'A01B23C45D67E89F';
            return Random.randomString(8, charset)
                + "-" + Random.randomString(4, charset)
                + "-4" + Random.randomString(3, charset)
                + "-" + Random.randomString(4, charset)
                + "-" + Random.randomString(12, charset);
        };
        return Random;
    }());
    CanvasDiagram.Random = Random;
    var LocalId = (function () {
        function LocalId() {
        }
        LocalId.getNextId = function () {
            return (++LocalId.nextId);
        };
        LocalId.nextId = 0;
        return LocalId;
    }());
    CanvasDiagram.LocalId = LocalId;
    var Logger = (function () {
        function Logger() {
        }
        Logger.log = function (obj) {
            if (Logger.isEnabled) {
                console.log(obj);
            }
        };
        Logger.isEnabled = true;
        return Logger;
    }());
    CanvasDiagram.Logger = Logger;
})(CanvasDiagram || (CanvasDiagram = {}));
var CanvasDiagram;
(function (CanvasDiagram) {
    var ElementBase = (function () {
        function ElementBase() {
            this.tag = null;
            this.guid = CanvasDiagram.Random.guid();
            this.localId = CanvasDiagram.LocalId.getNextId();
            this.rect = new CanvasDiagram.Rect(10, 10, 162, 62);
            this.background = '#A1E7FF';
            this.hoverBackground = '#00B2F0';
            this.foreground = 'black';
            this.text = 'this is the single one long sample text';
            this.borderWidth = 1;
            this.borderWidthSelected = 3;
            this.renderRect = true;
            this.isHover = false;
            this.isHoverConnectStart = false;
            this.isHoverConnectEnd = false;
            this.zIndex = 0;
            this.hasConnectionPoints = true;
            this.isConnectionInProgress = false;
            this.isSelected = false;
            this._eventSubscribers = new Array();
            this._connectRadius = 5;
            this.raiseRectChanged = function () {
                var event = new Event('rectChange');
                dispatchEvent(event);
            };
            this._connectDiameter = this._connectRadius * 2;
        }
        ElementBase.prototype.setCanvas = function (ctx) {
            this._canvas = ctx.canvas;
            this._renderingCtx = ctx;
            this._movableBehaviour = new CanvasDiagram.MovableBehaviour(ctx, this);
            this._connectBehaviour = new CanvasDiagram.ConnectionBehaviour(ctx, this);
        };
        ElementBase.prototype.updateState = function () {
            this.isHover = this._renderingCtx.isHitVisible(this, 4);
            this.isHoverConnectStart = false;
            this.isHoverConnectEnd = false;
            this.updateConnectionsHover(this._renderingCtx.mousePoint);
            if (this.isHoverConnectEnd || this.isHoverConnectEnd) {
                this.isHover = false;
            }
        };
        ElementBase.prototype.subscribeToEvent = function (eventName, handler) {
            var id = CanvasDiagram.Random.guid();
            this._eventSubscribers.push({
                eventName: eventName,
                subscriptionId: id,
                handler: handler
            });
            return id;
        };
        ElementBase.prototype.unsubscribe = function (subscriptionId) {
            var found = this._eventSubscribers.filter(function (x) { return x.subscriptionId == subscriptionId; });
            for (var i = found.length - 1; i >= 0; i--) {
                var index = this._eventSubscribers.indexOf(found[i]);
                this._eventSubscribers.splice(index, 1);
            }
        };
        ElementBase.prototype.render = function (renCtx) {
            renCtx.ctx2d.setLineDash([]);
            if (this.renderRect) {
                renCtx.ctx2d.beginPath();
                renCtx.ctx2d.rect(this.rect.x + 0.5, this.rect.y + 0.5, this.rect.w, this.rect.h);
                if (this.isHover && !this.isConnectionHover())
                    renCtx.ctx2d.fillStyle = this.hoverBackground;
                else
                    renCtx.ctx2d.fillStyle = this.background;
                renCtx.ctx2d.fill();
                if (this.isSelected) {
                    renCtx.ctx2d.lineWidth = this.borderWidthSelected;
                }
                else {
                    renCtx.ctx2d.lineWidth = this.borderWidth;
                }
                renCtx.ctx2d.strokeStyle = this.foreground;
                renCtx.ctx2d.stroke();
            }
            if (this.text) {
                var style = CanvasDiagram.ElementBase.defaultTextStyle();
                var renderingPoint = new CanvasDiagram.Point(this.rect.x + 5, this.rect.y + style.fontSizePt * 1.2);
                CanvasDiagram.TextRenderer.render(this.text, renCtx.ctx2d, this.rect, style);
            }
            if (this.hasConnectionPoints) {
                this.renderConnectionPoint(renCtx);
            }
        };
        ElementBase.prototype.isConnectionHover = function () { return this.isHoverConnectEnd || this.isHoverConnectStart; };
        ElementBase.prototype.isBeingMoved = function () { return this._movableBehaviour.isBeingMoved(); };
        ElementBase.prototype.renderConnectionPoint = function (renCtx) {
            var x = this.rect.middleX();
            renCtx.ctx2d.beginPath();
            if (this.isHoverConnectEnd) {
                renCtx.ctx2d.fillStyle = this.hoverBackground;
                renCtx.ctx2d.lineWidth = 2.5;
            }
            else {
                renCtx.ctx2d.fillStyle = this.background;
                renCtx.ctx2d.lineWidth = 1;
            }
            renCtx.ctx2d.arc(x, this.rect.bottom(), this._connectRadius, 0, 2 * Math.PI);
            renCtx.ctx2d.fill();
            renCtx.ctx2d.strokeStyle = 'black';
            renCtx.ctx2d.stroke();
            renCtx.ctx2d.beginPath();
            if (this.isHoverConnectStart) {
                renCtx.ctx2d.fillStyle = this.hoverBackground;
                renCtx.ctx2d.lineWidth = 2.5;
            }
            else {
                renCtx.ctx2d.fillStyle = this.background;
                renCtx.ctx2d.lineWidth = 1;
            }
            renCtx.ctx2d.arc(x, this.rect.y, this._connectRadius, 0, 2 * Math.PI);
            renCtx.ctx2d.fill();
            renCtx.ctx2d.stroke();
            this._connectBehaviour.render();
        };
        ElementBase.prototype.updateConnectionsHover = function (mousePoint) {
            var leftX = this.rect.middleX() - this._connectRadius;
            var startRect = new CanvasDiagram.Rect(leftX, this.rect.y - this._connectRadius, this._connectDiameter, this._connectDiameter);
            var endRect = new CanvasDiagram.Rect(leftX, this.rect.bottom() - this._connectRadius, this._connectDiameter, this._connectDiameter);
            this.isHoverConnectStart = startRect.containsPoint(mousePoint);
            this.isHoverConnectEnd = endRect.containsPoint(mousePoint);
        };
        ElementBase.defaultTextStyle = function () {
            var style = CanvasDiagram.TextStyle.wrapStyle();
            style.fontSizePt = 10;
            style.center = true;
            return style;
        };
        return ElementBase;
    }());
    CanvasDiagram.ElementBase = ElementBase;
})(CanvasDiagram || (CanvasDiagram = {}));
var CanvasDiagram;
(function (CanvasDiagram) {
    var ElementsConnection = (function () {
        function ElementsConnection(endElement, startElement) {
            this.endElement = endElement;
            this.startElement = startElement;
            this.connectionId = endElement.localId * 10000 + startElement.localId;
        }
        ElementsConnection.prototype.render = function (renCtx) {
            var end = new CanvasDiagram.Point(this.endElement.rect.middleX(), this.endElement.rect.bottom());
            var start = new CanvasDiagram.Point(this.startElement.rect.middleX(), this.startElement.rect.y);
            var halfY = (end.y + start.y) / 2;
            renCtx.ctx2d.lineWidth = 1;
            renCtx.ctx2d.beginPath();
            renCtx.ctx2d.setLineDash([]);
            renCtx.ctx2d.moveTo(end.x, end.y);
            renCtx.ctx2d.lineTo(end.x, halfY);
            renCtx.ctx2d.lineTo(start.x, halfY);
            renCtx.ctx2d.lineTo(start.x, start.y);
            renCtx.ctx2d.stroke();
        };
        return ElementsConnection;
    }());
    CanvasDiagram.ElementsConnection = ElementsConnection;
})(CanvasDiagram || (CanvasDiagram = {}));
var CanvasDiagram;
(function (CanvasDiagram) {
    var MovableBehaviour = (function () {
        function MovableBehaviour(ctx, elem) {
            var _this = this;
            this.ctx = ctx;
            this.elem = elem;
            this.mousePoint = new CanvasDiagram.Point();
            this.isMouseDown = false;
            ctx.canvas.addEventListener('mousedown', function (e) {
                if (ctx.isHitVisible(elem, 0) && !elem.isConnectionHover()) {
                    _this.isMouseDown = true;
                    _this.mousePoint = e.actualPoint();
                }
            });
            ctx.canvas.addEventListener('mouseup', function (e) {
                _this.isMouseDown = false;
            });
            ctx.canvas.addEventListener('mousemove', function (e) {
                if (_this.isMouseDown) {
                    var point = e.actualPoint();
                    var offsetX = point.x - _this.mousePoint.x;
                    var offsetY = point.y - _this.mousePoint.y;
                    ctx.getSelectedElements().forEach(function (e) {
                        e.rect.x += offsetX;
                        e.rect.y += offsetY;
                    });
                    _this.mousePoint.x = point.x;
                    _this.mousePoint.y = point.y;
                }
            });
        }
        MovableBehaviour.prototype.isBeingMoved = function () { return this.isMouseDown; };
        return MovableBehaviour;
    }());
    CanvasDiagram.MovableBehaviour = MovableBehaviour;
})(CanvasDiagram || (CanvasDiagram = {}));
var CanvasDiagram;
(function (CanvasDiagram) {
    var SelectBehaviour = (function () {
        function SelectBehaviour(ctx) {
            this.ctx = ctx;
            this._isMouseDown = false;
            this.addEventListeners();
        }
        SelectBehaviour.prototype.getSelectionRect = function () {
            var secondPoint = this.ctx.mousePoint;
            var firstPoint = this._mousePoint;
            var x = secondPoint.x < firstPoint.x ? secondPoint.x : firstPoint.x;
            var y = secondPoint.y < firstPoint.y ? secondPoint.y : firstPoint.y;
            var w = Math.abs(secondPoint.x - firstPoint.x);
            var h = Math.abs(secondPoint.y - firstPoint.y);
            return new CanvasDiagram.Rect(x, y, w, h);
        };
        SelectBehaviour.prototype.addEventListeners = function () {
            var _this = this;
            this.ctx.canvas.addEventListener('mousedown', function (e) {
                if (!_this.ctx.getHitElementConnectionPoint()) {
                    _this._isMouseDown = true;
                    _this._mousePoint = new CanvasDiagram.Point(_this.ctx.mousePoint.x, _this.ctx.mousePoint.y);
                }
            });
            this.ctx.canvas.addEventListener('mouseup', function (e) {
                var rect = _this.getSelectionRect();
                _this._isMouseDown = false;
                var elements = _this.ctx.getAllElements().filter(function (element) { return rect.contains(element.rect); });
                _this.ctx.addElementToSelection(null, true);
                elements.forEach(function (e) { return _this.ctx.addElementToSelection(e, false); });
            });
        };
        SelectBehaviour.prototype.render = function () {
            if (this._isMouseDown && !this.ctx.isAnyElementBeingMoved()) {
                var rect = this.getSelectionRect();
                this.ctx.ctx2d.beginPath();
                this.ctx.ctx2d.fillStyle = "rgba(209, 255, 194, 0.5)";
                this.ctx.ctx2d.fillRect(rect.x, rect.y, rect.w, rect.h);
                this.ctx.ctx2d.fill();
                this.ctx.ctx2d.strokeStyle = "black";
                this.ctx.ctx2d.lineWidth = 1;
                this.ctx.ctx2d.setLineDash([2]);
                this.ctx.ctx2d.stroke();
            }
        };
        return SelectBehaviour;
    }());
    CanvasDiagram.SelectBehaviour = SelectBehaviour;
})(CanvasDiagram || (CanvasDiagram = {}));
var CanvasDiagram;
(function (CanvasDiagram) {
    var TextStyle = (function () {
        function TextStyle() {
            this.fontSizePt = 12;
            this.fontStyle = "normal";
            this.fillStyle = "black";
            this.wrap = false;
            this.center = false;
        }
        TextStyle.prototype.formatStyle = function () {
            var fontFamily = this.fontFamily;
            var fontSize = this.fontSizePt;
            var fontStyle = this.fontStyle;
            if (!fontFamily)
                fontFamily = "Calibri";
            if (!fontSize)
                fontSize = 12;
            if (!fontStyle)
                fontStyle = "normal";
            return fontStyle + " " + fontSize + "pt " + fontFamily;
        };
        ;
        TextStyle.defaultStyle = function () {
            return new TextStyle();
        };
        TextStyle.wrapStyle = function () {
            var style = new TextStyle();
            style.wrap = true;
            return style;
        };
        return TextStyle;
    }());
    CanvasDiagram.TextStyle = TextStyle;
})(CanvasDiagram || (CanvasDiagram = {}));
var CanvasDiagram;
(function (CanvasDiagram) {
    var Point = (function () {
        function Point(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        return Point;
    }());
    CanvasDiagram.Point = Point;
    var Rect = (function () {
        function Rect(x, y, w, h) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (w === void 0) { w = 0; }
            if (h === void 0) { h = 0; }
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
        }
        Rect.prototype.right = function () { return this.x + this.w; };
        Rect.prototype.bottom = function () { return this.y + this.h; };
        Rect.prototype.middleX = function () { return this.x + (this.w / 2); };
        Rect.prototype.middleY = function () { return this.y + (this.h / 2); };
        Rect.prototype.containsPointCoords = function (x, y) {
            return this.x <= x && this.right() >= x
                && this.y <= y && this.bottom() >= y;
        };
        Rect.prototype.containsPoint = function (point) {
            return this.containsPointCoords(point.x, point.y);
        };
        Rect.prototype.extendUniform = function (byPx) {
            if (byPx == 0)
                return this;
            return new Rect(this.x - byPx, this.y - byPx, this.w + 2 * byPx, this.h + 2 * byPx);
        };
        Rect.prototype.isIntersecting = function (other) {
            return !(this.x > other.right() || this.right() < other.x || this.y > other.bottom() || this.bottom() < other.y);
        };
        Rect.prototype.contains = function (other) {
            return (this.x <= other.x && this.right() >= other.right() && this.y <= other.y && this.bottom() >= other.bottom());
        };
        return Rect;
    }());
    CanvasDiagram.Rect = Rect;
})(CanvasDiagram || (CanvasDiagram = {}));
var CanvasDiagram;
(function (CanvasDiagram) {
    var TextRenderer = (function () {
        function TextRenderer() {
        }
        TextRenderer.getMeasurements = function (ctx, text, rect, lineHeight, center) {
            var words = text.split(' ');
            if (words.length == 0) {
                return null;
            }
            var wordLengths = new Array();
            words.forEach(function (word) {
                var w = ctx.measureText(word + ' ').width;
                wordLengths.push([word + ' ', w]);
            });
            var lines = new Array();
            var line = wordLengths[0];
            for (var i_1 = 1; i_1 < wordLengths.length; i_1++) {
                if (line[1] + wordLengths[i_1][1] < rect.w) {
                    line[0] += wordLengths[i_1][0];
                    line[1] += wordLengths[i_1][1];
                }
                else {
                    lines.push(line);
                    line = wordLengths[i_1];
                }
            }
            lines.push(line);
            var verticalCenter = rect.y + (rect.h / 2);
            var verticalTop = verticalCenter - ((lines.length / 2) * lineHeight) + lineHeight * 0.75;
            var textMeasurements = new Array();
            for (var i = 0; i < lines.length; i++) {
                var lineRect = new CanvasDiagram.Rect(0, verticalTop + (lineHeight * i), lines[i][1], lineHeight);
                lineRect.x = rect.x;
                if (center) {
                    lineRect.x += ((rect.w - lines[i][1]) / 2);
                }
                textMeasurements.push({
                    text: lines[i][0],
                    rect: lineRect
                });
            }
            return {
                lines: textMeasurements,
                text: text,
                rect: rect,
                lineHeight: lineHeight,
                style: null
            };
        };
        TextRenderer.renderWithMeasurments = function (ctx, measurements) {
            measurements.lines.forEach(function (line) {
                ctx.fillText(line.text, line.rect.x, line.rect.y);
            });
        };
        TextRenderer.render = function (text, ctx, rect, style, measurements) {
            style = style || CanvasDiagram.TextStyle.defaultStyle();
            ctx.fillStyle = style.fillStyle;
            ctx.font = style.formatStyle();
            if (style.wrap) {
                var measurements = this.getMeasurements(ctx, text, rect, style.fontSizePt * 1.2, style.center);
                measurements.style = style;
                this.renderWithMeasurments(ctx, measurements);
                return measurements;
            }
            else {
                ctx.fillText(text, rect.x, rect.y);
                return null;
            }
        };
        return TextRenderer;
    }());
    CanvasDiagram.TextRenderer = TextRenderer;
})(CanvasDiagram || (CanvasDiagram = {}));
MouseEvent.prototype.actualPoint = function () {
    var x = this.pageX - this.target.offsetLeft;
    var y = this.pageY - this.target.offsetTop;
    return new CanvasDiagram.Point(x, y);
};
//# sourceMappingURL=canvas-dialog-bundle.js.map