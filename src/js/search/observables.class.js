import Rx from "rx";
import { search } from "./api";
import actions from './actions';
import utils from "utils";
import update from 'react/lib/update';
import pluck from 'lodash/collection/pluck';

/*

so I can do:
    var observables = require("search/observables")

export default function({
    query="",
    resultsFrom=0,
    resultsPerPage=5,
    selectedTags=[],
    selectedTypes=[]
}) {
    var observables = {
        query: new Rx.BehaviorSubject(query),
        resultsFrom: new Rx.BehaviorSubject(resultsFrom),
        resultsPerPage: new Rx.BehaviorSubject(resultsPerPage),
        selectedTags: new Rx.BehaviorSubject(selectedTags),
        selectedTypes: new Rx.BehaviorSubject(selectedTypes),
        searchInProgress: new Rx.BehaviorSubject(false),
    };

    observables.state = utils.
        combineLatestAsObject({
            query: observables.query,
            results: observables.results,
            resultsFrom: observables.resultsFrom,
            resultsPerPage: observables.resultsPerPage,
            totalResults: observables.totalResults,
            totalPages: observables.totalPages,
            currentPage: observables.currentPage,
            selectedTags: observables.selectedTags,
            possibleTags: observables.possibleTags,
            selectedTypes: observables.selectedTypes,
            possibleTypes: observables.possibleTypes,
            searchInProgress: observables.searchInProgress,
        }).
        distinctUntilChanged();

    var subscriptions = [
        // reset results to start from 0 when selected tags / types or query changes
        Rx.Observable.
            merge(query, selectedTags, selectedTypes).
            map(() => 0).
            subscribe(resultsFrom),
        // cleared the selected tags and types when query changes
        query.map(() => []).subscribe(selectedTags),
        query.map(() => []).subscribe(selectedTypes),
        // set searchInProgress to true when query changes
        query.map(() => true).subscribe(searchInProgress),
        // set searchInProgress to false when we get some results
        results.map(() => false).subscribe(searchInProgress),
        // untoggle selected types when they are no longer possible selections
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
    ];

    return merge({
        dispose() {
            observables.concat(subscriptions).map(stream => stream.dispose());
        }
    }, pick(observables, ['public', 'keys']));
};

*/

export class Observables {
    init({
        query="",
        resultsFrom=0,
        resultsPerPage=5,
        selectedTags=[],
        selectedTypes=[]
    }) {
        this.query = observable();
        this.resultsFrom = observable(new Rx.BehaviorSubject(resultsFrom));
        this.resultsPerPage = observable(new Rx.BehaviorSubject(resultsPerPage));
        this.selectedTags = observable(new Rx.BehaviorSubject(selectedTags));
        this.selectedTypes = observable(new Rx.BehaviorSubject(selectedTypes));

        // reset the results to start from 0 when you click any filter or change the query
        observable(Rx.Observable.
            merge(query, selectedTags, selectedTypes).
            map(() => 0).
            subscribe(resultsFrom));

        // clear selected tags and types on new query
        observable(query.map(() => []).subscribe(selectedTags));
        observable(query.map(() => []).subscribe(selectedTypes));

        this.searches = utils.
            combineLatestAsObject({
                query: query,
                from: resultsFrom,
                size: resultsPerPage,
                tags: selectedTags,
                types: selectedTypes
            }).
            distinctUntilChanged().
            debounce(200).
            share();

        this.results = searches.
            flatMapLatest(options => search(options)).
            share();

        this.possibleTags = results.
            pluck('aggregations', 'tags', 'buckets');

        this.possibleTypes = results.
            pluck('aggregations', 'all', 'query', 'typeAndSubType', 'buckets');

        this.totalResults = results.
            pluck('hits', 'total');

        this.totalPages = Rx.Observable.
            combineLatest(
                totalResults,
                resultsPerPage,
                (totalResults, resultsPerPage) => Math.ceil(totalResults / resultsPerPage)
            );

        this.currentPage = Rx.Observable.
            combineLatest(
                resultsFrom,
                resultsPerPage,
                (resultsFrom, resultsPerPage) => Math.ceil((resultsFrom+1) / resultsPerPage)
            );

        this.searchInProgress = new Rx.BehaviorSubject(false);
        query.map(() => true).subscribe(searchInProgress);
        results.map(() => false).subscribe(searchInProgress);

        export var state = utils.
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
    },

    observable(observable) {
        this.observables = (this.observables || []).concat(observable);
        return observable;
    },

    dispose() {
        this.observables.map(observable => observable.dispose());
    },
};

/* 
    what about using a factory instead so I can have multiple search modules that have
    different state.

    export default function() {
        return {

        };
    };
*/

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

query.map(() => []).subscribe(selectedTags);
query.map(() => []).subscribe(selectedTypes);

export var searches = utils.
    combineLatestAsObject({
        query: query,
        from: resultsFrom,
        size: resultsPerPage,
        tags: selectedTags,
        types: selectedTypes
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

export var state = utils.
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