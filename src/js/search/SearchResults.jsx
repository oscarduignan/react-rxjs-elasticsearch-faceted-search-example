import React from 'react';

export var SearchResults = React.createClass({
    render() {
        var { results } = this.props;

        return results ? (
            <div>
                <p>Total: {results.hits.total}</p>
                <ul>
                    {results.hits.hits.map(hit => <li>{hit._source.title}</li>)}
                </ul>
            </div>
        ) : false;
    }
});
