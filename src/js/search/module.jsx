import React from 'react';
import * as observables from './observables';
import { SearchForm } from './SearchForm';
import { FilterList } from './FilterList';
import { SearchResults } from './SearchResults';
import { Pagination } from './Pagination';

export default React.createClass({
    render(){
        var { query, totalPages, currentPage, selectedTags, possibleTags, selectedTypes, possibleTypes, results, searchInProgress } = this.props;

        return (
            <div>
                <div className="row">
                    <div className="col-sm-9 col-sm-push-3">
                        <h1>Elastic React RxJS Faceted Search</h1>
                        <SearchForm query={query} onChange={(event) => observables.query.onNext(event.target.value)} />
                    </div>
                </div>
                <div className="row">
                    {results
                        ? ( <div className="well col-sm-3">
                                <fieldset>
                                    <legend>Tags</legend>
                                    <FilterList selected={selectedTags} possible={possibleTags} onChange={(event) => observables.toggleFilter("selectedTags", event.target.value)} />
                                </fieldset>
                                <fieldset>
                                    <legend>Types</legend>
                                    <FilterList selected={selectedTypes} possible={possibleTypes} onChange={(event) => observables.toggleFilter("selectedTypes", event.target.value)} />
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
                                        ? <Pagination totalPages={totalPages} currentPage={currentPage} changePage={observables.changePage} />
                                        : false}
                                </div>
                            )}
                    </div>
                </div>
            </div>
        );
    }
});