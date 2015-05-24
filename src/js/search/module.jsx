import Rx from 'rx-dom';
import React from 'react';
import { results, searchInProgress } from './observables';
import { SearchForm } from './SearchForm';
import { SearchFilters } from './SearchFilters';
import { SearchResults } from './SearchResults';

var StateStreamMixin = require('rx-react').StateStreamMixin;

export default React.createClass({
    mixins: [StateStreamMixin],

    getStateStream() {
        return Rx.Observable.combineLatest(
            results,
            searchInProgress,
            (results, searchInProgress) => {
                return {
                    results: results,
                    searchInProgress: searchInProgress,
                }
            }
        );
    },

    render(){
        var { results, searchInProgress } = this.state || {};

        return (
            <div>
                <h1>Elastic React RxJS Faceted Seatestrch</h1>
                <SearchForm />
                {searchInProgress ? <p style={{color:'#999'}}><strong>Loading, please wait...</strong></p> : false}
                <SearchFilters />
                <SearchResults results={results} />
            </div>
        );
    }
});