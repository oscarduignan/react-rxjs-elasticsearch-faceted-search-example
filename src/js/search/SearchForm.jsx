import Rx from 'rx-dom';
import React from 'react/addons';
import { query } from './observables';
import { SubscribesToObservablesMixin } from '../utils';

export var SearchForm = React.createClass({
    mixins: [
        React.addons.LinkedStateMixin,
        SubscribesToObservablesMixin
    ],

    subscribe() {
        return [
            Rx.DOM.
                keyup(React.findDOMNode(this)).
                pluck('target', 'value').
                distinctUntilChanged().
                subscribe(query)
        ];
    },

    render() {
        return (
            <input type="text" valueLink={this.linkState('query')} />
        );
    }
});
