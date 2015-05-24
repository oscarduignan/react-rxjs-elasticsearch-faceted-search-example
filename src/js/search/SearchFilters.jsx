import Rx from 'rx-dom';
import React from 'react/addons';
import update from 'react/lib/update';
import { selectedTags, possibleTags, selectedTypes, possibleTypes } from './observables';
import { SubscribesToObservablesMixin } from '../utils';

export var SearchFilters = React.createClass({
    mixins: [
        React.addons.LinkedStateMixin
    ],

    getInitialState() {
        return {
            selectedTags: ['a'],
            possibleTags: ['a', 'b', 'c']
        };
    },

    /*
    subscribe() {
        return [
            Rx.Observable.
                combineLatest(
                    possibleTags,
                    possibleTypes,
                    (possibleTags, possibleTypes) => {
                        return {
                            possibleTags: possibleTags,
                            possibleTypes: possibleTypes,
                        }
                    }
                ).
                subscribe(state => this.setState(state))
        ];
    },
    */

    toggle(array) {
        var arrayRef = this.state[array];

        return (item, checked) => {
            // rather use a set here
            this.setState({
                [array]: checked
                    ? arrayRef.indexOf(item) === -1
                        ? arrayRef.concat(item)
                        : arrayRef
                    : arrayRef.indexOf(item) > -1
                        ? update(arrayRef, {$splice: [[arrayRef.indexOf(item), 1]]})
                        : arrayRef
            });
        };
    },

    render() {
        console.log(this.state);

        var { selectedTags, possibleTags, selectedTypes, possibleTypes } = this.state;

        return (
            <div>
                <fieldset>
                    <legend>Tags</legend>
                    <ul>
                        {possibleTags ? possibleTags.map((tag) => <ListCheckbox toggle={this.toggle('selectedTags')} label={tag} checked={selectedTags.indexOf(tag) > -1} />) : false}
                    </ul>
                </fieldset>
            </div>
        );
    }
});

var ListCheckbox = React.createClass({
    handleChange(event) {
        this.props.toggle(this.props.label, !!event.target.checked);
    },

    render() {
        var { label, checked } = this.props;

        return (
            <li><label><input type="checkbox" checked={checked} onChange={this.handleChange} /> {label}</label></li>
        );
    }
});