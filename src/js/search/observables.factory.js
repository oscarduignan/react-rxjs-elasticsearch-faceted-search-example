import Rx from 'rx';
import { search } from './api';
import utils from 'utils';
import update from 'react/lib/update';
import pluck from 'lodash/collection/pluck';
import merge from 'lodash/object/merge';

var ObservablesFactory = function({
    query='',
    currentPage=1,
    resultsPerPage=5,
    selectedTags=[],
    selectedTypes=[],
}) {
    var observables = {
        query: new Rx.BehaviorSubject(query),
        resultsFrom: new Rx.BehaviorSubject(resultsPerPage * (currentPage - 1)),
        resultsPerPage: new Rx.BehaviorSubject(resultsPerPage),
        selectedTags: new Rx.BehaviorSubject(selectedTags),
        selectedTypes: new Rx.BehaviorSubject(selectedTypes),
        searchInProgress: new Rx.BehaviorSubject(false)
    };

    observables.searches = utils.
        combineLatestAsObject({
            query: observables.query,
            from: observables.resultsFrom,
            size: observables.resultsPerPage,
            tags: observables.selectedTags,
            types: observables.selectedTypes
        }).
        distinctUntilChanged().
        debounce(200).
        share();

    observables.results = observables.searches.
        flatMapLatest(options => search(options)).
        share();

    observables.possibleTags = observables.results.
        pluck('aggregations', 'tags', 'buckets').
        map(terms => {
            return terms.map(term => {
                return {
                    term: term.key,
                    count: term.doc_count
                };
            });
        }).
        share();

    observables.possibleTypes = observables.results.
        pluck('aggregations', 'all', 'query', 'typeAndSubType', 'buckets').
        map(terms => {
            return terms.map(term => {
                return {
                    term: term.key,
                    count: term.doc_count
                };
            });
        }).
        share();

    observables.totalResults = observables.results.
        pluck('hits', 'total').
        share();

    observables.totalPages = Rx.Observable.
        combineLatest(
            observables.totalResults,
            observables.resultsPerPage,
            (total, perPage) => Math.ceil(total / perPage)
        ).
        share();

    observables.currentPage = Rx.Observable.
        combineLatest(
            observables.resultsFrom,
            observables.resultsPerPage,
            (from, perPage) => Math.ceil((from + 1) / perPage)
        ).
        share();

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
            searchInProgress: observables.searchInProgress
        }).
        distinctUntilChanged().
        share();

    var actions = require('./actions')(observables);

    observables.props = observables.state.
        map(state => merge({}, state, actions)).
        share();

    var subscriptions = [

        // reset results to start from 0 when selected tags / types or query changes
        Rx.Observable.
            merge(
                observables.query,
                observables.selectedTags,
                observables.selectedTypes
            ).
            map(() => 0).
            subscribe(observables.resultsFrom),

        observables.query.subscribe(() => {
            // clear the selected tags and types
            observables.selectedTags.onNext([]);
            observables.selectedTypes.onNext([]);
            // set searchInProgress to true
            observables.searchInProgress.onNext(true);
        }),

        // set searchInProgress to false when we get some results
        observables.results.map(() => false).subscribe(observables.searchInProgress),

        // untoggle selected types when they are no longer possible selections
        utils.
            combineLatestAsObject({
                selected: observables.selectedTypes,
                possible: observables.possibleTypes.map(possible => pluck(possible, 'term'))
            }).
            distinctUntilChanged().
            subscribe(types => {
                types.selected.
                    filter(type => types.possible.indexOf(type) === -1).
                    map(type => {
                        observables.selectedTypes.onNext(update(types.selected, {$splice: [[types.selected.indexOf(type), 1]]}));
                    });
            })

    ];

    return {
        observables: observables,
        actions: actions,
        dispose() {
            observables.concat(subscriptions).map(stream => stream.dispose());
        }
    };
};

export default ObservablesFactory;