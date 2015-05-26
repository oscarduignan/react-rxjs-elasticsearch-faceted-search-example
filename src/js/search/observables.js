import Rx from "rx";
import { search } from "./api";
import * as utils from "../utils";

// TODO pull initial value from url and persist to url on change
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