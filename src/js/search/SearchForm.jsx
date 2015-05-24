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
            // if i want to be able to clear the query by clearing
            // the state of the behavioursubject then need to setState
            // when it changes here, but for now I don't need that
        ];
    },

    render() {
        return (
            <input type="text" valueLink={this.linkState('query')} />
        );
    }
});
