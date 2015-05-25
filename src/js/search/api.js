import elasticsearch from 'elasticsearch';

var client = new elasticsearch.Client({
    host: 'localhost:9200'
});

// TODO replace elasticsearch client with something else, it's like 400kb minified and I'm not using any of it!

export var search = function(options) {
    var query = {
        query_string: {
            query: options.query || '*',
            fields: ['title', 'summary', 'body', 'tags'],
        }
    };

    var filter = {};
    if (options.filters.length) {
        filter.and = options.filters;
    }

    var tagFilters = options.filters.filter(filter => (filter.term || filter.terms || {}).tags);

    return client.search({
        index: 'elastic',
        type: 'muraContent',
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
                                ].concat(tagFilters)
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