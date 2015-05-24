import Rx from 'rx-dom';
import React from 'react/addons';
import * as observables from './observables';
import { SearchForm } from './SearchForm';
import { SearchFilterList } from './SearchFilterList';
import { SearchResults } from './SearchResults';

var StateStreamMixin = require('rx-react').StateStreamMixin;

export default React.createClass({
    mixins: [StateStreamMixin],

    getInitialState() {
        return {
            selectedTags: [],
            possibleTags: [],
            selectedTypes: [],
            possibleTypes: [],
        };
    },

    getStateStream() {
        return Rx.Observable.combineLatest(
            observables.query,
            observables.results,
            observables.selectedTags,
            observables.possibleTags,
            observables.selectedTypes,
            observables.possibleTypes,
            observables.searchInProgress,
            (   query,
                results,
                selectedTags,
                possibleTags,
                selectedTypes,
                possibleTypes,
                searchInProgress
            ) => {
                return {
                    query: query,
                    selectedTags: selectedTags,
                    possibleTags: possibleTags,
                    selectedTypes: selectedTypes,
                    possibleTypes: possibleTypes,
                    results: results,
                    searchInProgress: searchInProgress,
                }
            }
        );
    },

    updateQuery(event) {
        observables.query.onNext(event.target.value);
    },

    toggleFilter(array) {
        var current = this.state[array];

        return (event) => {
            var value = event.target.value;

            // rather use an immutable-js set here I think
            observables[array].onNext(
                !!event.target.checked
                    ? current.indexOf(value) === -1
                        ? current.concat(value)
                        : current
                    : current.indexOf(value) > -1
                        ? React.addons.update(current, {$splice: [[current.indexOf(value), 1]]})
                        : current
            );
        };
    },

    render(){
        var { query, selectedTags, possibleTags, selectedTypes, possibleTypes, results, searchInProgress } = this.state || {};

        return (
            <div>
                <h1>Elastic React RxJS Faceted Search</h1>
                <SearchForm query={query} onChange={this.updateQuery} />
                {searchInProgress ? <p style={{color:'#999'}}><strong>Loading, please wait...</strong></p> : false}
                <fieldset>
                    <legend>Tags</legend>
                    <SearchFilterList selected={selectedTags} possible={possibleTags} onChange={this.toggleFilter("selectedTags")} />
                </fieldset>
                <fieldset>
                    <legend>Types</legend>
                    <SearchFilterList selected={selectedTypes} possible={possibleTypes} onChange={this.toggleFilter("selectedTypes")} />
                </fieldset>
                <SearchResults results={results} />
            </div>
        );
    }
});