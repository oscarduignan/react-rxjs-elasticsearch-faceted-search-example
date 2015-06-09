import Rx from 'rx';
import { search } from './api';
import utils from 'utils';
import update from 'react/lib/update';
import pluck from 'lodash/collection/pluck';
import merge from 'lodash/object/merge';

var ObservablesFactory = function({
    query='',
    selectedTags=[],
    selectedTypes=[],
    resultsPerPage=5,
    page=1,
}) {
    var subjects = {
        query: new Rx.BehaviorSubject(query),
        selectedTags: new Rx.BehaviorSubject(selectedTags),
        selectedTypes: new Rx.BehaviorSubject(selectedTypes),
        resultsPerPage: new Rx.BehaviorSubject(resultsPerPage),
        resultsFrom: new Rx.BehaviorSubject(resultsPerPage * (page - 1)),
        searchInProgress: new Rx.BehaviorSubject(false)
    };

    var actions = {
        changeQuery(nextQuery) {
            return subjects.query.onNext(nextQuery);
        },

        changePage(nextPage) {
            return subjects.resultsFrom.onNext((nextPage - 1) * subjects.resultsPerPage.value);
        },

        toggleFilter(filter, term) {
            var currentState = subjects[filter].value;

            return subjects[filter].onNext(
                currentState.indexOf(term) === -1
                    ? currentState.concat(term)
                    : update(currentState, {$splice: [[currentState.indexOf(term), 1]]})
            );
        }
    };

    var searches = utils.
        combineLatestAsObject(subjects).
        distinctUntilChanged();

    var results = searches.
        debounce(200).
        flatMapLatest(options => search(options)).
        share();

    var possibleTags = results.
        pluck('aggregations', 'tags', 'buckets').
        distinctUntilChanged().
        map(terms => {
            return terms.map(term => {
                return {
                    term: term.key,
                    count: term.doc_count
                };
            });
        }).
        share();

    var possibleTypes = results.
        pluck('aggregations', 'all', 'query', 'typeAndSubType', 'buckets').
        distinctUntilChanged().
        map(terms => {
            return terms.map(term => {
                return {
                    term: term.key,
                    count: term.doc_count
                };
            });
        });

    var totalResults = results.
        pluck('hits', 'total').
        distinctUntilChanged();

    var totalPages = totalResults.
        withLatestFrom(
            subjects.resultsPerPage,
            (total, perPage) => Math.ceil(total / perPage)
        );

    var currentPage = subjects.resultsFrom.
        withLatestFrom(
            subjects.resultsPerPage,
            (from, perPage) => Math.ceil((from + 1) / perPage)
        );

    var state = utils.
        combineLatestAsObject({
            results,
            totalResults,
            totalPages,
            currentPage,
            possibleTags,
            possibleTypes,
            ...subjects
        }).
        distinctUntilChanged();

    var props = state.
        map(currentState => merge({}, currentState, actions));

    // reset results to start from 0 when selected tags / types or query changes
    Rx.Observable.
        merge(
            subjects.query,
            subjects.selectedTags,
            subjects.selectedTypes
        ).
        map(() => 0).
        subscribe(subjects.resultsFrom);

    // clear selected tags and types. and search in progress on new search
    subjects.query.
        distinctUntilChanged().
        subscribe(() => {
            subjects.selectedTags.onNext([]);
            subjects.selectedTypes.onNext([]);
            subjects.searchInProgress.onNext(true);
        });

    // set searchInProgress to false when we get some results
    results.
        map(() => false).
        subscribe(subjects.searchInProgress);

    // untoggle selected types when they are no longer possible selections
    possibleTypes.
        withLatestFrom(
            subjects.selectedTypes.distinctUntilChanged(),
            (possible, selected) => {
                return {possible: pluck(possible, 'term'), selected};
            }
        ).
        subscribe(({possible, selected}) => {
            selected.
                filter(type => possible.indexOf(type) === -1).
                map(type => {
                    subjects.selectedTypes.onNext(
                        update(selected, {$splice: [[selected.indexOf(type), 1]]})
                    );
                });
        });


    return {
        actions: actions,
        observables: {
            props,
            state,
            results,
            totalResults,
            totalPages,
            currentPage,
            possibleTags,
            possibleTypes,
            ...subjects
        },
        dispose() {
            subjects.map(subject => subject.dispose());

            // do I need to connect to and dispose of hot observables too / any other cleanup?
        }
    };
};

export default ObservablesFactory;