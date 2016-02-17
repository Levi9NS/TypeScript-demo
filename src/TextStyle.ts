module CanvasDiagram {
    export class TextStyle {
        public fontFamily: string;
        public fontSizePt: number = 12;
        public fontStyle: string = "normal";
        public fillStyle: string = "black";
        public wrap: boolean = false;
        public center: boolean = false;
                
        public formatStyle() : string {
            var fontFamily = this.fontFamily;
            var fontSize = this.fontSizePt;
            var fontStyle = this.fontStyle;
            
            if (!fontFamily) fontFamily = "Calibri";
            if (!fontSize) fontSize = 12;
            if (!fontStyle) fontStyle = "normal";
            return fontStyle + " " + fontSize + "pt " + fontFamily;
        };
        
        // public isEqualTo(other: TextStyle): boolean {
        //     return
        //         this.formatStyle() == other.formatStyle()
        //         && this.fillStyle == other.fillStyle
        //         && this.wrap == other.wrap
        //         && this.center == other.center;
        // }
        
        static defaultStyle() : TextStyle {
            return new TextStyle();
        }
        
        static wrapStyle() : TextStyle {
            var style = new TextStyle();
            style.wrap = true;
            return style;
        }
    }
}