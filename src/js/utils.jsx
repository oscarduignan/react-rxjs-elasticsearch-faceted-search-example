import Rx from 'rx';
import mapValues from 'lodash/object/mapValues';

export default {
    combineLatestAsObject(keysAndStreams) {
        var keys = Object.keys(keysAndStreams);
        var streams = keys.map(key => keysAndStreams[key]);

        return Rx.Observable.combineLatest(...streams, (...kwargs) => {
            return mapValues(keysAndStreams, (value, key) => {
                return kwargs[keys.indexOf(key)];
            });
        });
    }
};