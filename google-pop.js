var SearchResults = new Mongo.Collection("searchresults");

function log(info) {
  console.log(info);
}

function doSearch(searchText) {
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
    else {
      try {
        let totalResults = response.data.searchInformation.totalResults;
        // log(totalResults);

        SearchResults.insert({
          search: searchText,
          totalResults: totalResults,
          date: new Date()
        });
      }
      catch (err) {
        throw err;
      }
    }
  });
}

if (Meteor.isClient) {
  doSearch('angular');
  doSearch('react');
  doSearch('aurelia');
  doSearch('blaze');
  
  var now = new Date();
  console.log(SearchResults.find({date: {$dayOfYear: now}}));
  
  // console.log(SearchResults.find({}));
}

if (Meteor.isServer) {
  Meteor.startup(function() {
    // code to run on server at startup
  });
} 