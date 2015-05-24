import Rx from 'rx-dom';
import React from 'react/addons';
import update from 'react/lib/update';
import * as observables from './observables';
import { SubscribesToObservablesMixin } from '../utils';

export var SearchFilters = React.createClass({
    mixins: [
        React.addons.LinkedStateMixin,
        SubscribesToObservablesMixin
    ],

    getInitialState() {
        return {
            selectedTags: [],
            possibleTags: [],
            selectedTypes: [],
            possibleTypes: [],
        };
    },

    subscribe() {
        return [
            Rx.Observable.
                combineLatest(
                    observables.possibleTags,
                    observables.possibleTypes,
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

    toggle(array) {
        var arrayRef = this.state[array];

        return (item, checked) => {
            // rather use an immutable-js set here
            var selected = (
                checked
                    ? arrayRef.indexOf(item) === -1
                        ? arrayRef.concat(item)
                        : arrayRef
                    : arrayRef.indexOf(item) > -1
                        ? update(arrayRef, {$splice: [[arrayRef.indexOf(item), 1]]})
                        : arrayRef
            );

            observables[array].onNext(selected);

            this.setState({
                [array]: selected
            });
        };
    },

    render() {
        var { selectedTags, possibleTags, selectedTypes, possibleTypes } = this.state;

        return (
            <div>
                <fieldset>
                    <legend>Tags</legend>
                    <ul>
                        {possibleTags ? possibleTags.map((tag) => <ListCheckbox toggle={this.toggle('selectedTags')} label={tag.key} key={tag.key} count={tag.doc_count} checked={selectedTags.indexOf(tag.key) > -1} />) : false}
                    </ul>
                </fieldset>

                <fieldset>
                    <legend>Types</legend>
                    <ul>
                        {possibleTypes ? possibleTypes.map((type) => <ListCheckbox toggle={this.toggle('selectedTypes')} label={type.key} key={type.key} count={type.doc_count} checked={selectedTypes.indexOf(type.key) > -1} />) : false}
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
        var { label, count, checked } = this.props;

        return (
            <li><label><input type="checkbox" checked={checked} onChange={this.handleChange} /> {label} ({count})</label></li>
        );
    }
});