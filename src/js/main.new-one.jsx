import React from 'react';
import SearchModule from 'search/SearchModule';
import utils from 'utils';

// get initial state from URL
var queryParams = URI().search(true);
var { observables, actions: { changePage } } = require('search/observables.factory')({
    query: queryParams.q || "",
    page: queryParams.page || 1,
    selectedTags: queryParams.tags || [],
    selectedTypes: queryParams.types || [],
});

// watch for changes to props and rerender, and override the changePage action to include a confirmation dialog as an example
observables.props.subscribe(props => {
    React.render(<SearchModule {...props} changePage={(page) => confirm("Are you sure?") && changePage(page) } />, document.body);
});

// when someone clicks the back button we need to reload our state from URL, guess this should be done in the rx way!
window.addEventListener("popstate", () => {
    var queryParams = URI().search(true);
    actions.changeQuery(queryParams.q || "");
    observables.selectedTags.onNext([].concat(queryParams.tags || []));
    observables.selectedTypes.onNext([].concat(queryParams.types || []));
    actions.changePage(queryParams.page || 1);
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
    map(params => URI().setSearch(params).toString()).
    distinctUntilChanged().
    debounce(200).
    filter(nextURL => nextURL !== window.location.toString()).
    subscribe(nextURL => window.history[URI().search() ? 'pushState' : 'replaceState'](null, null, nextURL));
