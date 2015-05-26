import Rx from "rx";
import mapValues from "lodash/object/mapValues";

export function combineLatestAsObject(keysAndStreams) {
    var keys = Object.keys(keysAndStreams);
    var streams = keys.map(key => keysAndStreams[key]);

    return Rx.Observable.combineLatest(...streams, (...streams) => {
        return mapValues(keysAndStreams, (value, key) => {
            return streams[keys.indexOf(key)];
        });
    });
}