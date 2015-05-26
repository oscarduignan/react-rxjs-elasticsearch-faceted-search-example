import React from 'react';
import SearchModule from './search/module';

/*

    Example of how you could avoid react state alltogether and just pass stuff
    down through props! Dunno how best practice this would be though, I think
    there's probably enough state avoidance in current setup, where only the main
    module actually has any state and all the child components get passed stuff
    via props!

        import { moduleState } from './search/observables';

        moduleState.subscribe(state => {
            React.render(<SearchModule {...state} />, document.getElementById('app'));
        });

*/

React.render(<SearchModule />, document.getElementById('app'));

// for debugging let me play with observables in the console
require('expose?observables!./search/observables');