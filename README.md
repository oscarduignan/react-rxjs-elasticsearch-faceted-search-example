# Example of using React and RxJS to build a faceted search interface for Elasticsearch

Start with https://github.com/oscarduignan/react-rxjs-elasticsearch-faceted-search-example/blob/master/src/js/main.jsx if you want to look at code - the react components are in the search directory and their names start with a capital, the rxjs stuff is inside https://github.com/oscarduignan/react-rxjs-elasticsearch-faceted-search-example/blob/master/src/js/search/observables.factory.js the elasticsearch bit is in https://github.com/oscarduignan/react-rxjs-elasticsearch-faceted-search-example/blob/master/src/js/search/api.js and the actions which are just ways to trigger events from the UI are in https://github.com/oscarduignan/react-rxjs-elasticsearch-faceted-search-example/blob/master/src/js/search/actions.js.

I've been experimenting with Elasticsearch for a while and also with React, I wanted to experiment with RxJS after using Reflux with React for a project and finding myself unsatisfied so I decided to create a faceted search interface to experiment. You can see my progression a bit in the commit history, and it's got a lot of comments showing my working out and general thought processes.

Summary of this is I'm pretty happy with RxJS and React as a combo and I wouldn't want to go back towards Flux or related variations because those feel a bit to complicated to me and it feels like with RxJS there is plenty of room to grow/mature my approach.

The thing that's lacking at the moment that most people at SocratesUK will probably notice are automated tests, I'm not sure what tooling there is available for writing tests against RxJS but it's something for me to look at now.

---

Ah and to build this the missing bit that will stop you running it is an instance of elasticsearch accessible at localhost:9200 and a collection with the meta data utilized in https://github.com/oscarduignan/react-rxjs-elasticsearch-faceted-search-example/blob/master/src/js/api.js!

Build tool for this is webpack + gulp, you should be able to get it working - served up in your browser with react hot reloading by running `gulp`.
