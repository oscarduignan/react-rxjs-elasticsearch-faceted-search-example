import React from 'react';

export var SearchForm = React.createClass({
    render() {
        return (
            <input type="text" value={this.props.query} onChange={this.props.onChange} />
        );
    }
});
