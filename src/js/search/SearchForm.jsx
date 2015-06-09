import React from 'react';

export default React.createClass({
    propTypes: {
        query: React.PropTypes.string,
        onChange: React.PropTypes.func
    },

    render() {
        var { query, onChange } = this.props;

        return (
            <input type="text" value={query} onChange={onChange} />
        );
    }
});
