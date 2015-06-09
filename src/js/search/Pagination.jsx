import React from 'react';
import cx from 'classnames';

export default React.createClass({
    propTypes: {
        changePage: React.PropTypes.func.isRequired,
        totalPages: React.PropTypes.number.isRequired,
        currentPage: React.PropTypes.number.isRequired
    },

    changePage(page) {
        return (e) => {
            e.preventDefault();
            this.props.changePage(page);
        };
    },

    render() {
        var { totalPages, currentPage } = this.props;

        return (
            <ul className="pagination">
                {currentPage > 1
                    ? <li><a href="#" onClick={this.changePage(currentPage - 1)}>Previous</a></li>
                    : <li className="disabled"><span>Previous</span></li>}

                {Array.from(Array(totalPages).keys()).map(page => { page++;
                    return (
                        <li className={cx({pagination__page: true, active: page === currentPage})}>
                            <a href="#" onClick={this.changePage(page)}>{page}</a>
                        </li>
                    );
                })}

                {currentPage < totalPages
                    ? <li><a href="#" onClick={this.changePage(currentPage + 1)}>Next</a></li>
                    : <li className="disabled"><span>Next</span></li>}
            </ul>
        );
    }
});
