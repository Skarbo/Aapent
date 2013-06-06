// CONSTRUCTOR
ResultsSearchAppPresenterView.prototype = new AbstractPresenterView();

function ResultsSearchAppPresenterView(view) {
	AbstractPresenterView.apply(this, arguments);
	this.resultTemplate = null;
};

// VARIABLES

// /VARIABLES

// FUNCTIONS

// ... GET

/**
 * @returns {AapentAppMainView}
 */
ResultsSearchAppPresenterView.prototype.getView = function() {
	return AbstractPresenterView.prototype.getView.call(this);
};

/**
 * @returns {AapentHandler}
 */
ResultsSearchAppPresenterView.prototype.getAapentHandler = function() {
	return this.getView().getAapentHandler();
};

ResultsSearchAppPresenterView.prototype.getContainerElement = function() {
	return this.getRoot().find("#search_results_container");
};

ResultsSearchAppPresenterView.prototype.getResultElements = function() {
	return this.getContainerElement().find(".search_result");
};

ResultsSearchAppPresenterView.prototype.getResultsNoneElement = function() {
	return this.getRoot().find("#search_results_none");
};

/**
 * @returns {ListAdapter}
 */
ResultsSearchAppPresenterView.prototype.getSearchResultsList = function() {
	return this.getAapentHandler().searchResultsList;
};

// ... /GET

// ... DO

ResultsSearchAppPresenterView.prototype.doBindEventHandler = function() {
	AbstractPresenterView.prototype.doBindEventHandler.call(this);
	var context = this;

	// Search result list
	this.getSearchResultsList().addNotifyOnChange(function(type, object) {
		switch (type) {
		case "add":
			context.handleResultAdd(object, true);
			break;
		case "addall":
			context.handleResultAddAll(object);
			break;
		case "remove":
			context.handleResultRemove(object);
			break;
		case "clear":
			context.handleResultClear(object);
			break;
		}
	});

	// Search results
	this.getContainerElement().on("touchclick", function(event) {
		event.preventDefault();
		var resultElement = $(event.target).closest(".search_result");
		if (resultElement.length > 0 && resultElement.attr("data-result-id")) {
			if ($(event.target).closest(".distance").length > 0)
				context.doResultDirections(resultElement.attr("data-result-id"));
			else
				context.doResultSelect(resultElement.attr("data-result-id"));
		}
	});

};

ResultsSearchAppPresenterView.prototype.doNavigationSelect = function(navigationId) {
	var navigationElement = this.getNavigationItemElements().filter("[data-nav-id='" + navigationId + "']");
	this.getNavigationItemElements().removeAttr("data-nav-selected");

	if (navigationElement.length > 0) {
		navigationElement.attr("data-nav-selected", "true");
	}
};

ResultsSearchAppPresenterView.prototype.doResultDirections = function(placeId) {
	var isPlace = this.getAapentHandler().isPlace(placeId);
	if (!isPlace)
		return console.error("ResultsSearchAppPresenterView.doResultDirections: Place dosen't exist (%s)", placeId);

	this.getAapentHandler().doPlaceDirections(placeId);
};

ResultsSearchAppPresenterView.prototype.doResultSelect = function(placeId) {
	var isPlace = this.getAapentHandler().isPlace(placeId);
	if (!isPlace)
		return console.error("ResultsSearchAppPresenterView.doResultSelect: Place dosen't exist (%s)", placeId);

	this.getView().doPlaceShow(placeId);
};

ResultsSearchAppPresenterView.prototype.doResultsSort = function() {
	this.getResultElements().sortElements(function(left, right) {
		var leftDistance = parseInt($(left).attr("data-result-distance"));
		var rightDistance = parseInt($(right).attr("data-result-distance"));
		return isNaN(leftDistance) && isNaN(rightDistance) ? 0 : (leftDistance > rightDistance ? 1 : -1);
	});
};

// ... /DO

// ... HANDLE

ResultsSearchAppPresenterView.prototype.handleResultAddAll = function(results) {
	this.getContainerElement().empty();
	for ( var i in results)
		this.handleResultAdd(results[i]);
	this.doResultsSort();
	this.handleResultsNone();
};

ResultsSearchAppPresenterView.prototype.handleResultAdd = function(result, isSingle) {
	var isPlace = this.getAapentHandler().isPlace(result.id);
	if (!isPlace)
		return console.error("ResultsSearchAppPresenterView.handleResultAdd: Place does not exist", result.id);
	var placeElement = this.createPlaceElement(result.id);
	if (placeElement)
		this.getContainerElement().append(placeElement);
	else
		return console.error("ResultsSearchAppPresenterView.handleResultAdd: Could not create result element", result.id);

	if (isSingle) {
		this.getContainerElement().append(placeElement);
		this.doResultsSort();
	}
};

ResultsSearchAppPresenterView.prototype.handleResultClear = function() {
	this.handleResultsNone();
};

ResultsSearchAppPresenterView.prototype.handleResultRemove = function(result) {
	if (!result)
		return console.warn("ResultsSearchAppPresenterView.handleResultRemove: No result given", result);

	var searchResultElement = this.getResultElements().filter("[data-result-id='" + result.id + "']");
	if (searchResultElement.length > 0)
		searchResultElement.remove();
	this.handleResultsNone();
};

ResultsSearchAppPresenterView.prototype.handleResultsNone = function() {
	if (this.getSearchResultsList().size() == 0) {
		this.getContainerElement().empty();
		this.getResultsNoneElement().removeClass("hide");
	} else
		this.getResultsNoneElement().addClass("hide");
};

// ... /HANDLE

// ... CREATE

ResultsSearchAppPresenterView.prototype.createPlaceElement = function(placeId) {
	var place = this.getAapentHandler().getPlace(placeId);
	if (!place)
		return console.error("ResultsSearchAppPresenterView.createPlaceElement: Place does not exist", placeId);

	var resultObject = {
		name : "",
		title : "",
		address : "",
		distance : null,
		hours : {
			from : null,
			to : null,
			open : null
		},
		icon : null,
		position : null,
		id : null
	};

	resultObject.name = resultObject.title = place.name;
	resultObject.position = {
		lat : place.location.lat,
		lng : place.location.lng
	};
	resultObject.address = place.info.addressFormatted || place.info.address || null;
	resultObject.icon = place.images.pin || null;
	resultObject.id = place.id;
	var hours = PlaceUtil.getHours(place);
	if (hours && typeof hours == "object") {
		resultObject.hours.from = hours[0].substr(0, 2);
		resultObject.hours.to = hours[1].substr(0, 2);
	}
	resultObject.hours.open = PlaceUtil.isOpen(place);

	// // Google Place
	// if (place.reference) {
	// resultObject.name = resultObject.title = place.name;
	// resultObject.position = {
	// lat : place.geometry.location.lat(),
	// lng : place.geometry.location.lng()
	// };
	// resultObject.address = place.formatted_address;
	// resultObject.hours.open = place.opening_hours ?
	// place.opening_hours.open_now : null;
	// resultObject.icon = place.icon || null;
	// resultObject.id = place.id;
	// }
	// // Aapent Place
	// else {
	// var group = this.getAapentHandler().getGroupPlace(place.group);
	// var placeAapent = PlaceUtil.createPlaceFromAapent(place, group);
	//
	// resultObject.name = resultObject.title = place.name;
	// resultObject.position = {
	// lat : place.locationLat,
	// lng : place.locationLong
	// };
	// resultObject.address = PlaceUtil.getAddress(place);
	// resultObject.hours.open = PlaceUtil.isOpen(place);
	// resultObject.icon = placeAapent.icon || null;
	// resultObject.id = place.id;
	// var hours = PlaceUtil.getHours(place);
	// if (typeof hours == "object") {
	// resultObject.hours.from = hours[0].substr(0, 2);
	// resultObject.hours.to = hours[1].substr(0, 2);
	// }
	// }

	// Result element
	var resultElement = this.resultTemplate.clone();

	if (resultObject.name) {
		resultElement.attr("data-result-id", resultObject.id);
		resultElement.attr("title", resultObject.title);
		resultElement.find(".name").text(resultObject.name);
		if (resultObject.address)
			resultElement.find(".address").text(resultObject.address);
		else
			resultElement.find(".address").addClass("hide");

		// Hours
		resultElement.attr("data-result-hours-open", resultObject.hours.open !== null ? (resultObject.hours.open ? "open" : "closed") : null);
		if (resultObject.hours.from !== null && resultObject.hours.to !== null)
			resultElement.attr("data-result-hours", "true");
		if (resultObject.hours.from && resultObject.hours.to) {
			resultElement.find(".time .from").text(resultObject.hours.from);
			resultElement.find(".time .to").text(resultObject.hours.to);
		}

		// Distance
		var position = this.getAapentHandler().position;
		if (resultObject.position && position) {
			var distance = suggestionDistance = MapUtil.distance(position.lat(), position.lng(), resultObject.position.lat, resultObject.position.lng) * 1000; // Meters
			if (!isNaN(distance)) {
				if (distance < 1000)
					resultElement.find(".distance").text(Math.round(distance));
				else
					resultElement.find(".distance").text(Core.roundNumber(distance / 1000, 2)).attr("data-result-distance-km", "true");
				resultElement.attr("data-result-distance", Math.round(suggestionDistance));
			} else
				resultElement.find(".distance").text("");
		} else {
			resultElement.find(".distance").text("");
		}

		// Icon
		if (resultObject.icon)
			resultElement.find(".icon img").attr("src", resultObject.icon);

		return resultElement;
	}
	return null;
};

// ... CREATE

ResultsSearchAppPresenterView.prototype.draw = function(root) {
	AbstractPresenterView.prototype.draw.call(this, root);

	this.resultTemplate = this.getResultElements().filter(".template").clone().removeClass("template");
	this.handleResultsNone();
};

// /FUNCTIONS
