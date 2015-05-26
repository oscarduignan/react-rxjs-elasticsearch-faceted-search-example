import Rx from 'rx';
import React from 'react';
import SearchModule from './search/module';
import * as observables from './search/observables';
import * as utils from './utils';
import URI from 'URIjs';

// debugging
// require('expose?observables!./search/observables');

/*

    Example of how you could avoid react state alltogether and just pass stuff
    down through props!

        import { moduleState } from './search/observables';

        moduleState.subscribe(state => {
            React.render(<SearchModule {...state} />, document.getElementById('app'));
        });

*/

var addNextSearchToHistory = new Rx.BehaviorSubject(true);

function loadStateFromURL() {
    addNextSearchToHistory.onNext(false);
    var queryParams = URI().search(true);
    if (queryParams.q)     { observables.query.onNext(queryParams.q); }
    if (queryParams.page)  { observables.changePage(queryParams.page); }
    if (queryParams.tags)  { observables.selectedTags.onNext(queryParams.tags); }
    if (queryParams.types) { observables.selectedTypes.onNext(queryParams.types); }
}

loadStateFromURL();

window.addEventListener("popstate", loadStateFromURL);

React.render(<SearchModule />, document.getElementById('app'));

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
    subscribe(nextURL => {
        // TODO what's the most idiomatic way to do this?
        if (addNextSearchToHistory.value)
            window.history.pushState(null, null, nextURL)
        addNextSearchToHistory.onNext(true);
    });
