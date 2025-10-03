import { map, Observable } from '../../reactivity/observable.js';

export function listenRouteChange() {
    return new Observable(observer => {
        observer.next(window.location.hash.slice(1))
        const listener = () => {
            observer.next(window.location.hash.slice(1))
        }

        window.addEventListener("hashchange", listener)
        return () => window.removeEventListener("hashchange", listener)
    })
}

export class RouterService {
    selectedComponentTag$ = listenRouteChange().pipe(
        map(hash => {
            return this.routesConfig[hash] || this.defaultTag;
        })
    )

    onInitialized = new Observable()

    init(routesConfig, defaultTag) {
        this.routesConfig = routesConfig
        this.defaultTag = defaultTag
        this.onInitialized.next()
    }

    navigateTo(route) {
        window.location.hash = route
    }
}

export const ROUTER_SERVICE = new RouterService()
