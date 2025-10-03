let activeHandler = null

export const viewMap = new WeakMap()

export function proxyViewBound(object) {
    const proxy = new Proxy(object, {
        set(target, key, newValue) {
            if(target[key] === newValue){
                return true;
            }
            target[key] = newValue
            const handlers = viewMap.get(target)?.get(key)
            if (handlers) {
                Array.from(handlers.entries()).forEach(([htmlElement, handler]) => {
                    if (htmlElement.isConnected) {
                        handler()
                    } else {
                        handlers.delete(htmlElement)
                    }
                })
            }
            return true
        }
    })

    proxy["getValue"] = (key, view) => {
        if (activeHandler) {
            const propertyToViewHandlersMap = viewMap.get(object) || new Map()
            const viewHandlersMap = propertyToViewHandlersMap.get(key) || new Map()
            viewHandlersMap.set(view, activeHandler)
            propertyToViewHandlersMap.set(key, viewHandlersMap)
            viewMap.set(object, propertyToViewHandlersMap)
        }
        return object[key]
    }

    return proxy
}

export function viewReaction(fn) {
    let prevHandler = activeHandler
    activeHandler = fn
    fn()
    activeHandler = prevHandler
}
