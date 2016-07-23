
// show unanswered questions returned from stackoverflow
 var showQuestion = function(question) {

	// clone the results content temporarily stored in hidden DOM template element divs in HTML
	var result = $('.templates .question').clone();

	// set the actual question content properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the 'date/time question was asked' property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the ''# of times viewed' property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to the question-asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" '+
		'href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
		question.owner.display_name +
		'</a></p>' +
		'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};


// this function takes the results object from StackOverflow
// and returns the number of results and tags to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query + '</strong>';
	return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};


// sends a string of tag(s) (semi-colon separated) in "get unanswered questions" call to stackexchange
var getUnanswered = function(tags) {  // tags is a string containing one or more user submitted tags

	// the data: parameters passed in ajax request to stackexchange's API
  // create an object containing parameters to be passed
	var request = {
		tagged: tags,   // find questions tagged with a string array of tag(s) submitted by user and passed into this function
		site: 'stackoverflow',   // value included in query string, specifies the site at the domain in url below
		order: 'desc',
		sort: 'creation'
	};

  // deferred object var created
	$.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered", //specifies the domain and end point method
		data: request,    // data key defined above includes user input tags, subsite to search, order and sort
		type: "GET",     // type of call request
	})

	.done(function(result){ //this waits for the ajax to successfully return object
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);
		//$.each is a higher order function. It takes an array and a function as an argument.
		//The function is executed once for each item in the array.
		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})

	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
}; // end getUnanswered


// this function sets values for tag score object properties returned by the StackOverflow request
var showAnswerer = function(item) {

	// clone our result template code
	var result = $('.templates .answerer').clone();

	// set the user's display name and link in result
	var answererElem = result.find('.display-name');
  answererElem.html(': <a target="_blank" href="http://stackoverflow.com/users/' + item.user.user_id + '/' +
    item.user.display_name + '">' + item.user.display_name + '</a>'
);
// console.log(item.user.display_name);

	// set the user's answer acceptance rate for this tag in result
	var acceptRate = result.find('.accept-rate');
	// .text();

	// set the user's score
	var score = result.find('.score');
	score.html('<p>Answerer\'s score:' + item.user.score +
		'<p>Reputation: ' + item.user.reputation + '</p>'
	);

	return result;
};

// sends a tag string in /tags/{tag}/top-answerers/{period} call to stackexchange
var getAnswerer = function(tag) {

	// create an object containing the data: parameters to be passed in ajax request to stackexchange's API
	// method = "/2.2/tags/{tag}/top-answerers/{period}”
	var request = {
		tag: tag,
		site: 'stackoverflow',   // value included in query string, specifies the site at the domain in url below
		period: 'month'   // could be "all_time" or "month"
	};

console.log('tag is ' + request.tag);

  // consult method documentation to know what parameters/data the API is expecting
	$.ajax({
		url: "http://api.stackexchange.com/2.2/tags/" + request.tag + "/top-answerers/" + request.period,
		data: request,
		type: "GET",
	})

  //wait for the ajax to successfully return object
  .done(function(result){
		var searchResults = showSearchResults(request.tag, result.items.length);

		$('.search-results').html(searchResults);
		//$.each takes an array and a function as an argument and executes the function once for each item in the array
		$.each(result.items, function(i, item) {
			var answerer = showAnswerer(item);
			$('.results').append(answerer);
		});
	})

	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
}; // end getAnswerer

$(document).ready( function() {
	$('.unanswered-getter').submit( function(e){
		e.preventDefault();
		// zero out results container, including # of results, if previous search has run
		// why doesn't this work: $('.search-results').html('');
    $('.results').html('');
		// get the value of the tags the user submitted and pass as parameter in ajax call
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
	});
	$('.inspiration-getter').submit( function(e){
		e.preventDefault();
		// zero out results if previous search has run
		$('.results').html('');
		// get the top 30 answerers of questions with the tags the user submitted
		var tag = $(this).find("input[name='tag']").val();
		getAnswerer(tag);
	});
});
