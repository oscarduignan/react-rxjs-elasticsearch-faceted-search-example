import React from 'react';
import update from 'react/lib/update';
import * as observables from './observables';
import { SearchForm } from './SearchForm';
import { FilterList } from './FilterList';
import { SearchResults } from './SearchResults';
import { Pagination } from './Pagination';

var StateStreamMixin = require('rx-react').StateStreamMixin;

export default React.createClass({
    mixins: [StateStreamMixin],

    getStateStream() {
        return observables.moduleState;
    },

    updateQuery(event) {
        observables.query.onNext(event.target.value);
    },

    changePage(page) {
        observables.resultsFrom.onNext((page-1) * observables.resultsPerPage.value);
    },

    toggleFilter(array) {
        var current = observables[array].value; // better to get it from this.state?

        return (event) => {
            var value = event.target.value;

            // rather use an immutable-js set here
            observables[array].onNext(
                !!event.target.checked
                    ? current.indexOf(value) === -1
                        ? current.concat(value)
                        : current
                    : current.indexOf(value) > -1
                        ? update(current, {$splice: [[current.indexOf(value), 1]]})
                        : current
            );
        };
    },

    render(){
        var { query, totalPages, currentPage, selectedTags, possibleTags, selectedTypes, possibleTypes, results, searchInProgress } = this.state || {};

        return (
            <div>
                <div className="row">
                    <div className="col-sm-9 col-sm-push-3">
                        <h1>Elastic React RxJS Faceted Search</h1>
                        <SearchForm query={query} onChange={this.updateQuery} />
                    </div>
                </div>
                <div className="row">
                    {results
                        ? ( <div className="well col-sm-3">
                                <fieldset>
                                    <legend>Tags</legend>
                                    <FilterList selected={selectedTags} possible={possibleTags} onChange={this.toggleFilter("selectedTags")} />
                                </fieldset>
                                <fieldset>
                                    <legend>Types</legend>
                                    <FilterList selected={selectedTypes} possible={possibleTypes} onChange={this.toggleFilter("selectedTypes")} />
                                </fieldset>
                            </div>
                        ) : false}
                    <div className="col-sm-9 pull-right">
                        {searchInProgress
                            ? <p style={{color:'#999'}}><strong>Loading, please wait...</strong></p>
                            : (
                                <div>
                                    <SearchResults results={results} />

                                    {results
                                        ? <Pagination totalPages={totalPages} currentPage={currentPage} changePage={this.changePage} />
                                        : false}
                                </div>
                            )}
                    </div>
                </div>
            </div>
        );
    }
});