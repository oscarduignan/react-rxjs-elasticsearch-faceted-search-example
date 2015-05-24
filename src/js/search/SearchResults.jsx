import React from 'react';

export var SearchResults = React.createClass({
    render() {
        var { results } = this.props;

        return (
            <ul>
                {results && results.hits.hits.map(hit => <li>{hit._source.title}</li>)}
            </ul>
        );
    }
});
