import React from 'react';

export default React.createClass({
    propTypes: {
        results: React.PropTypes.any
    },

    render() {
        var { results, ...props } = this.props;

        return results ? (
            <div {...props}>
                <p>Total: {results.hits.total}</p>

                {results.hits.hits.map(hit => <SearchResult hit={hit} />)}
            </div>
        ) : (
            <div {...props}>
                <p>No results found</p>
            </div>
        );
    }
});

var SearchResult = React.createClass({
    propTypes: {
        hit: React.PropTypes.shape({
            _score: React.PropTypes.number,
            _source: React.PropTypes.shape({
                url: React.PropTypes.string,
                title: React.PropTypes.string
            })
        })
    },

    render() {
        var { title, url } = this.props.hit._source;

        return (
            <div>
                <h3><a href={url}>{title}</a></h3>
                <p>Score: {this.props.hit._score}</p>
            </div>
        );
    }
});