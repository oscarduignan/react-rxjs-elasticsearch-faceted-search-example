import React from 'react';

export default React.createClass({
    propTypes: {
        selected: React.PropTypes.array,
        possible: React.PropTypes.arrayOf(React.PropTypes.shape({
            term: React.PropTypes.string,
            count: React.PropTypes.number
        })),
        onChange: React.PropTypes.func
    },

    render() {
        var { selected, possible, onChange } = this.props;

        return (
            <ul className="list-unstyled">
                {possible
                    ? possible.map(({term, count}) => {
                        return <TermCheckbox onChange={onChange} key={term} term={term} count={count} checked={(selected || []).indexOf(term) > -1} />;
                    })
                    : false}
            </ul>
        );
    }
});

var TermCheckbox = React.createClass({
    propTypes: {
        term: React.PropTypes.string,
        count: React.PropTypes.number,
        checked: React.PropTypes.bool,
        onChange: React.PropTypes.func
    },

    render() {
        var { term, count, checked, onChange } = this.props;

        return (
            <li><label><input type="checkbox" checked={checked} value={term} onChange={onChange} /> {term} ({count})</label></li>
        );
    }
});