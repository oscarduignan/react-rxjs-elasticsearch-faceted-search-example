import React from 'react';
import SearchModule from './search/module';

React.render(<SearchModule />, document.getElementById('app'));

require('expose?observables!./search/observables');