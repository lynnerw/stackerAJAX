
// put unanswered questions (returned in response to API call) into DOM
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

	// set some properties related to the user who asked the question
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" '+ 'href=https://stackoverflow.com/users/' + question.owner.user_id + ' >' +
		question.owner.display_name +	'</a></p>' + '<p>Reputation: ' + question.owner.reputation + '</p>');

	return result;
  };

  // parse the results object returned and determine number of results to be appended to DOM
  var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query + '</strong>';
	return results;
  };

  // captures error string and turns it into displayable DOM element
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
		url: "https://api.stackexchange.com/2.2/questions/unanswered", //specifies the domain and end point method
		data: request,    // data key defined above includes user input tags, subsite to search, order and sort
		type: "GET",     // type of call request
	})

	.done(function(result){ //this waits for the ajax to successfully return object
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);
		//$.each executes the function passed in once for each item in array passed in
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

	// display user's display name with link
	var answererElem = result.find('.display-name');
  answererElem.html('<a target="_blank" href="https://stackoverflow.com/users/' + item.user.user_id + '/' +
    item.user.display_name + '">' + item.user.display_name + '</a>');

	// display the # of answers this user posted and answer score for this tag in result
  var ansScore = result.find('.answers-posted');
	ansScore.html(item.post_count + ', with a score of ' + item.score);

  // display the user's reputation
	var reputationElem = result.find('.reputation');
	reputationElem.html(item.user.reputation);

	return result;
};

// sends a tag string in /tags/{tag}/top-answerers/{period} call to stackexchange
var getAnswerer = function(tag) {

	// create an object containing the data: parameters to be passed in ajax request to stackexchange's API
	var request = {
		tag: tag,   // value input by user
		site: 'stackoverflow',   // value included in query string, specifies the site at the domain in url below
		period: 'all_time'   // could be "all_time" or "month"
	};

  // consult method documentation to know what parameters/data the API is expecting
	$.ajax({
		url: "https://api.stackexchange.com/2.2/tags/" + request.tag + "/top-answerers/" + request.period,
		data: request,
		type: "GET",
	})

  //wait for the ajax to successfully return object, then parse and append to DOM
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
