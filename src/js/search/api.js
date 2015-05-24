import elasticsearch from 'elasticsearch';

var client = new elasticsearch.Client({
    host: 'localhost:9200'
});

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
                                query: query
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