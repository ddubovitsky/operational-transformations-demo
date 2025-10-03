export class Observable {
    transformers = []

    activeSubscription;


    observers = [];

    constructor(startListen) {
        this.startListen = startListen
    }

    lastValue;

    subscribe(observer, { sendLastValue } = { sendLastValue: false }) {


        this.transformers.forEach(transformer => {
            observer = transformer(observer)
        });

        this.observers.push(observer);

        if (sendLastValue && this.lastValue !== undefined) {
            observer.next(this.lastValue);
        }

        this.transformers = [];

        if (!this.activeSubscription && this.startListen) {
            this.activeSubscription = this.startListen(this)
        }

        return {
            unsubscribe: () => {
                let index = this.observers.indexOf(observer);
                this.observers.splice(index, 1);
            }
        }
    }

    pipe(...transformers) {
        this.transformers = transformers
        return this
    }

    next(data) {
        this.lastValue = data;
        this.observers.forEach((it) => it.next(data));
    }
}

export function filter(predicate) {
    return observable => {
        return {
            next: it => {
                if (predicate(it)) {
                    observable.next(it)
                }
            }
        }
    }
}

export function map(mapper) {
    return observable => {
        return {
            next: it => {
                observable.next(mapper(it))
            }
        }
    }
}
