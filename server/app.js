'use strict';

const SearchResults = new Mongo.Collection("searchresults");
const RawSearchResults = new Mongo.Collection("rawsearchresults");

const SearchTerms = ['angular', 'aurelia', 'react'];

function searchAlreadyDone() {
    let now = new Date().getTime();
    let msInDay = 1000 * 60 * 60 * 24;

    let prevResult = SearchResults.findOne({
        date: {
            $gt: new Date(now - msInDay)
        }
    });

    return (typeof prevResult !== 'undefined');
}

function doSearch(searchText) {
    console.log('Searching for term ' + searchText);

    let options = {
        params: {
            q: searchText,
            // cr: 'US',
            cx: '017710882725909504227:g4-svrxw-2a',
            dateRestrict: '1d',
            key: 'AIzaSyAQ4Q8py7NZFimJA2GViv6j7G33OlfVb2M'
        }
    };

    let response = Meteor.http.get("https://www.googleapis.com/customsearch/v1", options);
    RawSearchResults.insert(JSON.stringify(response));
    return response;
}

function processSearch() {
    let results = {};
    SearchTerms.forEach(searchText => {
        let response = doSearch(searchText);
        let totalResults = response.data.searchInformation.totalResults;
        results[searchText] = totalResults;
    });

    results.date = new Date();
    SearchResults.insert(results);
}

Meteor.startup(function() {
    Meteor.setInterval(() => {
        if (!searchAlreadyDone()) {
            console.log('Search not done recently, searching now');
            processSearch();
        }
        else {
            console.log('Search already done recently, back to waiting');
        }
    }, 1000 * 24 * 24);
});