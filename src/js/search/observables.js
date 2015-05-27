import Rx from "rx";
import { search } from "./api";
import * as utils from "../utils";
import update from 'react/lib/update';
import pluck from 'lodash/collection/pluck';

export var query = new Rx.BehaviorSubject("");
export var resultsFrom = new Rx.BehaviorSubject(0);
export var resultsPerPage = new Rx.BehaviorSubject(5);
export var selectedTags = new Rx.BehaviorSubject([]);
export var selectedTypes = new Rx.BehaviorSubject([]);

// reset the results to start from 0 when you click any filter or change the query
Rx.Observable.
    merge(query, selectedTags, selectedTypes).
    map(() => 0).
    subscribe(resultsFrom);

// clear selected tags and types on new query
query.map(() => []).subscribe(selectedTags);
query.map(() => []).subscribe(selectedTypes);

// results must have each tag
var tagsTermFilters = selectedTags.
    map(tags => tags.map(tag => {
        return {term: {tags: tag}}
    }));

// results can have any of the types
var typesTermsFilter = selectedTypes.
    map(types => {
        return types.length ? {terms: {typeAndSubType: types}} : [];
    });

var filters = Rx.Observable.
    combineLatest(
        typesTermsFilter,
        tagsTermFilters,
        (typesTermsFilter, tagsTermFilters) => {
            return tagsTermFilters.concat(typesTermsFilter);
        }
    );

export var searches = utils.
    combineLatestAsObject({
        query: query,
        from: resultsFrom,
        size: resultsPerPage,
        filters: filters
    }).
    distinctUntilChanged().
    debounce(200).
    share();

export var results = searches.
    flatMapLatest(options => search(options)).
    share();

export var possibleTags = results.
    pluck('aggregations', 'tags', 'buckets');

export var possibleTypes = results.
    pluck('aggregations', 'all', 'query', 'typeAndSubType', 'buckets');

export var totalResults = results.
    pluck('hits', 'total');

export var totalPages = Rx.Observable.
    combineLatest(
        totalResults,
        resultsPerPage,
        (totalResults, resultsPerPage) => Math.ceil(totalResults / resultsPerPage)
    );

export var currentPage = Rx.Observable.
    combineLatest(
        resultsFrom,
        resultsPerPage,
        (resultsFrom, resultsPerPage) => Math.ceil((resultsFrom+1) / resultsPerPage)
    );

export var searchInProgress = new Rx.BehaviorSubject(false);
query.map(() => true).subscribe(searchInProgress);
results.map(() => false).subscribe(searchInProgress);

export var moduleState = utils.
    combineLatestAsObject({
        query: query,
        results: results,
        resultsFrom: resultsFrom,
        resultsPerPage: resultsPerPage,
        totalResults: totalResults,
        totalPages: totalPages,
        currentPage: currentPage,
        selectedTags: selectedTags,
        possibleTags: possibleTags,
        selectedTypes: selectedTypes,
        possibleTypes: possibleTypes,
        searchInProgress: searchInProgress,
    }).
    distinctUntilChanged();

export var changePage = function(page) {
    resultsFrom.onNext((page-1) * resultsPerPage.value);
};

export var toggleFilter = function(filter, term) {
    var currentState = this[filter].value;

    this[filter].onNext(
        currentState.indexOf(term) === -1
            ? currentState.concat(term)
            : update(currentState, {$splice: [[currentState.indexOf(term), 1]]})
    );
};

// untoggle selected types that are no longer possible to select to prevent 0 results situations
// this is possible because types are "OR"ed together where as tags are "AND"ed - so if you select
// all types then select some tags, some types will no longer be possible, and without the below
// if you unselect the possible types then with the current UI you're left with types and tags
// selected that leave no results and there is no way to uncheck your selections because possible
// types and tags are blank. To allow for 0 results, then we would have to make it so that your
// selections were always visible so you could unselect them but I prefer this functionality.
utils.
    combineLatestAsObject({
        selected: selectedTypes,
        possible: possibleTypes.map(possible => pluck(possible, "key")),
    }).
    distinctUntilChanged().
    subscribe(types => {
        return types.selected.
            filter(type => types.possible.indexOf(type) === -1).
            map(type => {
                return selectedTypes.
                    onNext(update(types.selected, {$splice: [[types.selected.indexOf(type), 1]]}))
            });
    });