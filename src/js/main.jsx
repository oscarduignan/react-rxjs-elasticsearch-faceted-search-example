import Rx from 'rx';
import React from 'react';
import SearchModule from './search/module';
import * as observables from 'expose?observables!./search/observables';
import * as utils from './utils';
import URI from 'URIjs';

// so to use this module inside another react component rather than rendering it like this
// you would just have to import the state. Either passing it down from whatever your top
// level component is, or just subscribing to the state stream on componentDidMount and
// calling setState when it changes. Shortcut for this is rx-react's getStateStream mixin.

// TODO this way all state has to load before anything can display, might not be what we want
// so might be good idea to have module state be a struct that I can stick anything I want in
// that way stuff can load partially? {} onNext({x:y}) onNext({y:z}) {x:y, y:z}
observables.moduleState.subscribe(state => {
    React.render(<SearchModule {...state} />, document.getElementById('app'));
});

// below is the code that makes the searches bookmarkable, kept it separate from the module
// because I felt like this was an external thing.

var loadStateFromURL = function() {
    var queryParams = URI().search(true);
    observables.query.onNext(queryParams.q || "");
    observables.selectedTags.onNext([].concat(queryParams.tags || []));
    observables.selectedTypes.onNext([].concat(queryParams.types || []));
    observables.changePage(queryParams.page || 1);
};

loadStateFromURL();

window.addEventListener("popstate", loadStateFromURL);

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
