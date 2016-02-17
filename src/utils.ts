module CanvasDiagram {
    export class Random {
        static randomInt(min: number, max:number): number {
            return Math.floor(Math.random() * (max - min)) + min;
        }
        
        static randomString(length: number, charset: string = "qwertyuiopasdfghjklzxcvbnm789456123QWERTYUIOPASDFGHJKLZXCVBNM!@#$%^&*"): string {
            var s = "";
            for (var i = 0; i < length; i++) {
                s += charset.charAt(Random.randomInt(0, charset.length));
            }
            return s;
        }
        
        static guid() : string {
            // format: xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx
            var charset = 'A01B23C45D67E89F'
            return Random.randomString(8, charset) 
                + "-" + Random.randomString(4, charset) 
                + "-4" + Random.randomString(3, charset) 
                + "-" + Random.randomString(4, charset)
                + "-" + Random.randomString(12, charset)
        }
    }
    
    export class Logger {
        static isEnabled: boolean = true;
        static log(obj: any) {
            if (Logger.isEnabled) {
                console.log(obj);
            }
        }
    }
}