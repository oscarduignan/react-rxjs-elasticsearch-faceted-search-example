import React from 'react';

export var FilterList = React.createClass({
    render() {
        var { selected, possible, onChange } = this.props;

        return (
            <ul className="list-unstyled">
                {possible
                    ? possible.map((term) => {
                        return <li><TermCheckbox onChange={onChange} term={term} checked={(selected || []).indexOf(term.key) > -1} /></li>;
                    })
                    : false}
            </ul>
        );
    }
});

var TermCheckbox = React.createClass({
    render() {
        var { term, checked, onChange } = this.props;

        return (
            <label><input type="checkbox" checked={checked} value={term.key} onChange={onChange} /> {term.key} ({term.doc_count})</label>
        );
    }
});