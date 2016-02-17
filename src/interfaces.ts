module CanvasDiagram {
    export interface IMovable {
        rect: Rect,
        raiseRectChanged: () => void,
        guid: string
    }
    
    export interface IEventPublisher {
        subscribeToEvent: (eventName: string, handler: (sender: Object, eventData: Object) => void) => string,
        unsubscribe: (subscriptionId: string) => void
    }
        
    export interface IEventSubscirberItem {
        eventName: string,
        handler: (sender: Object, eventData: Object) => void,
        subscriptionId: string 
    }
}