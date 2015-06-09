import React from 'react';
import SearchModule from 'search/SearchModule';
import utils from 'utils';
import uri from 'URIjs';

// get initial state from URL and load observables from it
var queryParams = uri().search(true);

var { observables, actions: { changeQuery, changePage } } = require('search/observables.factory')({
    query: queryParams.q || '',
    page: queryParams.page || 1,
    selectedTags: queryParams.tags || [],
    selectedTypes: queryParams.types || []
});

// watch for changes to props and rerender, and override the changePage action to include a confirmation dialog as an example
// small throttle to cut down the number of rerenders - is this helpful, harmful, or neither?
observables.props.subscribe(props => {
    // example of how to override an action:
    // React.render(<SearchModule {...props} changePage={(page) => confirm("Are you sure?") && changePage(page) } />, document.getElementById("app"));

    React.render(<SearchModule {...props} />, document.getElementById('app'));
});

// when someone clicks the back button we need to reload our state from URL, guess this should be done in the rx way!
window.addEventListener('popstate', () => {
    var newQueryParams = uri().search(true);
    changeQuery(newQueryParams.q || '');
    observables.selectedTags.onNext([].concat(newQueryParams.tags || []));
    observables.selectedTypes.onNext([].concat(newQueryParams.types || []));
    changePage(newQueryParams.page || 1);
});

// when the state changes update the URL (unless the URL is the same, which means someone clicked the back button)
utils.
    combineLatestAsObject({
        q: observables.query,
        tags: observables.selectedTags,
        types: observables.selectedTypes,
        page: observables.currentPage
    }).
    // TODO this replaces all params not just the named ones
    map(params => uri().setSearch(params).toString()).
    distinctUntilChanged().
    debounce(200).
    filter(nextURL => nextURL !== window.location.toString()).
    subscribe(nextURL => window.history[uri().search() ? 'pushState' : 'replaceState'](null, null, nextURL));
