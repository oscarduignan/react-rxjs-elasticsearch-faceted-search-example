import React from 'react/addons';
import Pagination from '../../../src/js/search/Pagination.jsx';

var TestUtils = React.addons.TestUtils;

describe('Pagination', () => {
    var component;

    beforeEach(() => {
        component = TestUtils.renderIntoDocument(<Pagination totalPages={3} currentPage={2} />);
    });

    it('should display a link for each page', () => {
        expect(TestUtils.scryRenderedDOMComponentsWithClass(component, 'pagination__page').length).toBe(3);
    });

});