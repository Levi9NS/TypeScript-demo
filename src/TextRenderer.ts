/// <reference path="./TextStyle" />
/// <reference path="./models" />

module CanvasDiagram {
    export interface ITextLine {
        text: string,
        rect: Rect
    }
    
    export interface ITextMeasurements {
        lines: Array<ITextLine>,
        text: string,
        rect: Rect,
        lineHeight: number,
        style: TextStyle
    }
    
    export class TextRenderer {
        
        private static getMeasurements (ctx: CanvasRenderingContext2D, text: string, rect: Rect, lineHeight: number, center: boolean) : ITextMeasurements {    
            var words = text.split(' ');
            if (words.length == 0) {
                return null;
            }
            
            type IWordLength = [string, number];
            var wordLengths = new Array<IWordLength>();
            words.forEach(word => {
                var w = ctx.measureText(word + ' ').width;
                wordLengths.push([word + ' ', w]);
            }); 
            
            var lines = new Array<IWordLength>();
            var line = wordLengths[0];

            for (let i = 1; i < wordLengths.length; i++) {
                if (line[1] + wordLengths[i][1] < rect.w) {
                    line[0] += wordLengths[i][0];
                    line[1] += wordLengths[i][1];
                } else {
                    lines.push(line);
                    line = wordLengths[i];
                }
            }
            
            lines.push(line);
            
            var verticalCenter = rect.y + (rect.h / 2);
            var verticalTop = verticalCenter - ((lines.length / 2) * lineHeight) + lineHeight * 0.75; 
            
            var textMeasurements = new Array<ITextLine>();
            for (var i = 0; i < lines.length; i++) {
                var lineRect = new Rect(0, verticalTop + (lineHeight * i), lines[i][1], lineHeight);
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
        }        
        
        private static renderWithMeasurments(ctx: CanvasRenderingContext2D, measurements: ITextMeasurements) {
            measurements.lines.forEach(line => {
                ctx.fillText(line.text, line.rect.x, line.rect.y)
            });
        }
        
        static render (text: string, ctx: CanvasRenderingContext2D, rect: Rect, style?: TextStyle, measurements?: ITextMeasurements) : ITextMeasurements {
            style = style || TextStyle.defaultStyle();
            ctx.fillStyle = style.fillStyle;
            ctx.font = style.formatStyle();
            
            if (style.wrap) {
                var measurements = this.getMeasurements(ctx, text, rect, style.fontSizePt * 1.2, style.center);
                measurements.style = style;
                this.renderWithMeasurments(ctx, measurements);
                return measurements;
            } else {
                ctx.fillText(text, rect.x, rect.y);
                return null; // we didn't measure anything
            }
        }
    }
}