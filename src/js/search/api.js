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

    return client.search({
        index: 'elastic',
        type: 'muraContent',
        body: {
            query: {
                filtered: {
                    query: query,
                    /*
                    filter: {
                        and: options.filters
                    }
                    */
                }
            },
            aggs: {
                tags: {
                    terms: {
                        field: 'tags',
                        size: 10
                    }
                },
                /*
                all: {
                    global: {},
                    aggs: {
                        filter: {
                            query: query
                        },
                        typeAndSubType: {
                            terms: {
                                field: 'typeAndSubType'
                            }
                        }
                    }
                }
                */
            }
        }
    });
};