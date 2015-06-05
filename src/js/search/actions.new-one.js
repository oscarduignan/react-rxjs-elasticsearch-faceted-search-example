import update from 'react/lib/update';

// actions your components can do, pass through props

export default function(observables) {
    return {
        changeQuery(query) {
            return observables.query.onNext(query);
        },

        changePage(page) {
            return observables.resultsFrom.onNext((page-1) * observables.resultsPerPage.value);
        },

        toggleFilter(filter, term) {
            var currentState = observables[filter].value;

            return observables[filter].onNext(
                currentState.indexOf(term) === -1
                    ? currentState.concat(term)
                    : update(currentState, {$splice: [[currentState.indexOf(term), 1]]})
            );
        }
    }
}