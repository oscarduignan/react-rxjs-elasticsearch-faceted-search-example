import React from 'react';

export var SearchResults = React.createClass({
    render() {
        var { results, ...props } = this.props;

        return results ? (
            <div {...props}>
                <p>Total: {results.hits.total}</p>
                <ul>
                    {results.hits.hits.map(hit => <li>{hit._source.title}</li>)}
                </ul>
            </div>
        ) : false;
    }
});
