import elasticsearch from 'elasticsearch';

// TODO is this better? So in observables I just do api = require(api)({host: "localhost:9200"}) // config
// feel like at this point it's better to not use closures state and just pass the host, type, index to the
// search function! Then these can be defined in observables, defined as observables, or whatever. And it
// would make this easier to test I think not having that static state.
/*
export default function(host) {
    var client = new elasticsearch.Client({ host: host });

    return {
        search({query="*", tags=[], types=[], from=0, size=10}) {
            ...
        }
    }
}

TODO move these here

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

*/

var client = new elasticsearch.Client({
    host: 'localhost:9200'
});

// TODO replace elasticsearch client with something else, it's like 400kb
// minified and I'm not really using it, could just use jquery since I've
// bundled it for bootstrap

export var search = function({query='*', selectedTags=[], selectedTypes=[], resultsFrom=0, resultsPerPage=5}) {

    query = {
        query_string: {
            query: query || '*',
            fields: ['title', 'summary', 'body', 'tags']
        }
    };

    var tagsFilters = selectedTags.
        map(tag => {
            return {term: {tags: tag}};
        });

    var typesFilter = selectedTypes.length ? {terms: {typeAndSubType: selectedTypes}} : [];

    var filter = {};

    var combinedFilters = tagsFilters.concat(typesFilter);

    if (combinedFilters.length) {
        filter.and = combinedFilters;
    }

    return client.search({
        index: 'elastic',
        type: 'muraContent',
        from: resultsFrom,
        size: resultsPerPage,
        body: {
            query: {
                filtered: {
                    query: query,
                    filter: filter
                }
            },
            aggs: {
                tags: {
                    terms: {
                        field: 'tags',
                        size: 10
                    }
                },
                all: {
                    global: {},
                    aggs: {
                        query: {
                            filter: {
                                and: [
                                    { query: query }
                                ].concat(tagsFilters)
                            },
                            aggs: {
                                typeAndSubType: {
                                    terms: {
                                        field: 'typeAndSubType'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
};