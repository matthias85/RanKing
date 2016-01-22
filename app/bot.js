console.log('running ...');

var request = require('request');
var _ = require("underscore");
var fs = require('fs');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/googleSearchBot');

var date = new Date();
var Record = mongoose.model('Record', mongoose.Schema({
    date: {
        type: Date
    },
    keyword: {
        type: String
    },
    rank: {
        type: Number
    },
    link: {
        type: String
    }
}));

var allKeywords = require('./keywords.json');

module.exports = {

  fetchKeywordIndizes: [],

  settings: {},

  fetchKeyword: function(callback){

    var me = this;
  	if (this.fetchKeywordIndizes.length > 0){
  		var fetchIndex = this.fetchKeywordIndizes.shift();


  		var index = fetchIndex % allKeywords.length;
  		this.fetchPage(index,0,function(){
  			me.fetchKeyword(callback);
  		});
  	}else {
  		if (typeof callback === "function"){
  			callback();
  		}
  	}

  },

  fetchPage: function(keywordIndex, index, callback){

    var me = this;
  	var keyword = allKeywords[keywordIndex];
  	var url = 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&rsz=8&q=' + keyword + '&start=' + index

  	console.log("[Request]");
  	console.log("Keyword: "+keyword);
  	console.log("Page: "+index);
  	console.log("--------------------");

  	request(url, function (error, response, body) {

  		if (!error && response.statusCode == 200) {

  			var json = JSON.parse(body);
  			if (json.responseData != null) {

          var results = json.responseData.results;
          _.each(results, function(element, i){
            var results = json.responseData.results;

              var e = new Record({
                date: date,
                keyword: keyword,
                rank: index + i + 1,
                link: element.url
              });

              e.save(function (err, obj) {
                if (err) console.log('error while saving');
              });


          });

  			}

  		} else {
  			console.log("Got an error: ", error, ", status code: ", response.statusCode);
  		}

  		if (++index < me.settings.pageLimit){
  			me.fetchPage(keywordIndex, index, callback);
  		}else {


  			me.settings.start = keywordIndex+1;
  			if (me.settings.start > allKeywords.length){
  				me.settings.start = 0;
  			}

  			fs.writeFile("./settings.json", JSON.stringify(me.settings), function(err){
          if (err){
            console.log(err);
          }
  				if (typeof callback === "function"){
  					callback();
  				}
  			});



  		}

  	});


  },


  start: function(){

    console.log('Start');
    this.settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
    console.log(this.settings);
    this.fetchKeywordIndizes = _.range(this.settings.start, this.settings.start+this.settings.keywordsPerRun);
    this.fetchKeyword(function(){
      console.log('Done');
    });

  },

  log: function(message){
    console.log(message);
  }

}
