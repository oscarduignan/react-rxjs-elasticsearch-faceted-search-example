import React from 'react';
import cx from 'classnames';

export var Pagination = React.createClass({
    render() {
        var { totalPages, currentPage, changePage } = this.props;

        return (
            <ul className="pagination">
                {currentPage > 1
                    ? <li><a href="#" onClick={() => changePage(currentPage-1)}>Previous</a></li>
                    : <li className="disabled"><span>Previous</span></li>}

                {Array.from(Array(totalPages).keys()).map(page => {
                    page++;

                    return (
                        <li className={cx({active: page === currentPage})}>
                            <a href="#" onClick={() => changePage(page)}>{page}</a>
                        </li>
                    );
                })}

                {currentPage < totalPages
                    ? <li><a href="#" onClick={() => changePage(currentPage+1)}>Next</a></li>
                    : <li className="disabled"><span>Next</span></li>}
            </ul>
        );
    }
});
