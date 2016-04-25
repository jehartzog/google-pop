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

    Meteor.http.get("https://www.googleapis.com/customsearch/v1", options, function(error, response) {
        if (error) {
            throw error;
        }

        let totalResults = response.data.searchInformation.totalResults;

        SearchResults.insert({
            search: searchText,
            totalResults: totalResults,
            date: new Date()
        });

        RawSearchResults.insert(JSON.stringify(response));
    });
}

Meteor.startup(function() {
    Meteor.setInterval(() => {
        if (!searchAlreadyDone()) {
            console.log('Search not done recently, searching now');
            SearchTerms.forEach(s => doSearch(s));
        }
        else {
            console.log('Search already done recently, back to waiting');
        }
    }, 100000);
});