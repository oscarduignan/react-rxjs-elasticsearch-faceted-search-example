export var SubscribesToObservablesMixin = {
    getInitialState() {
        return {};
    },
    componentDidMount() {
        this.observables = this.subscribe();
    },
    componentWillUnmount() {
        this.observables.map(observable => observable.dispose());
    },
};