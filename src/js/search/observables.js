import Rx from "rx-dom";
import { search } from "./api";

// TODO pull initial value from url and persist to url on change
export var query = new Rx.BehaviorSubject("");
export var selectedTags = new Rx.BehaviorSubject([]);
export var selectedTypes = new Rx.BehaviorSubject([]);

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

export var searches = Rx.Observable.
    combineLatest(
        query,
        filters,
        (query, filters) => {
            return {
                query: query,
                filters: filters
            }
        }
    ).
    debounce(500).
    do(search => console.log(search)).
    share();

export var results = searches.
    flatMapLatest(options => search(options)).
    share();

export var possibleTags = results.
    pluck('aggregations', 'tags', 'buckets');

export var possibleTypes = results.
    pluck('aggregations', 'all', 'query', 'typeAndSubType', 'buckets');

export var searchInProgress = new Rx.BehaviorSubject(false);
query.map(() => true).subscribe(searchInProgress);
results.map(() => false).subscribe(searchInProgress);