// CONSTRUCTOR
AapentAppMainView.prototype = new AppMainView();

function AapentAppMainView(wrapperId) {
	AppMainView.apply(this, arguments);
	this.navigationPresenter = new NavigationAppPresenterView(this);
	this.topMenuPresenter = new TopMenuAppPresenterView(this);
	this.leftMenuPresenter = new LeftMenuAppPresenterView(this);
//	this.markersPlaces = {};
}

// /CONSTRUCTOR

// VARIABLES

AapentAppMainView.MARKER_ZINDEX_PLACE_AAPENT = 100;
AapentAppMainView.MARKER_ZINDEX_PLACE_GOOGLE = 50;

// /VARIABLES

// FUNCTIONS

// ... GET

/**
 * @return {AapentAppMainController}
 */
AapentAppMainView.prototype.getController = function() {
	return AppMainView.prototype.getController.call(this);
};

/**
 * @return {AapentHandler}
 */
AapentAppMainView.prototype.getAapentHandler = function() {
	return this.getController().getAapentHandler();
};

/**
 * @return {NavigationAppPresenterView}
 */
AapentAppMainView.prototype.getNavigationPresenter = function() {
	return this.navigationPresenter;
};

/**
 * @return {TopMenuAppPresenterView}
 */
AapentAppMainView.prototype.getTopMenuPresenter = function() {
	return this.topMenuPresenter;
};

/**
 * @return {LeftMenuAppPresenterView}
 */
AapentAppMainView.prototype.getLeftMenuPresenter = function() {
	return this.leftMenuPresenter;
};

// ... ... ELEMENT

AapentAppMainView.prototype.getMapWrapperElement = function() {
	return this.getWrapperElement().find("#map_wrapper");
};

AapentAppMainView.prototype.getMenuWrapperElement = function() {
	return this.getWrapperElement().find("#menu_wrapper");
};

AapentAppMainView.prototype.getNavigationWrapperElement = function() {
	return this.getWrapperElement().find("#navigation_wrapper");
};

AapentAppMainView.prototype.getTopMenuWrapperElement = function() {
	return this.getWrapperElement().find("#top_menu_wrapper");
};

AapentAppMainView.prototype.getLeftMenuWrapperElement = function() {
	return this.getWrapperElement().find("#left_menu_wrapper");
};

AapentAppMainView.prototype.getSearchWrapperElement = function() {
	return this.getWrapperElement().find("#search_wrapper");
};

/**
 * @return {Object}
 */
AapentAppMainView.prototype.getSearchInputWrapperElement = function() {
	return this.getSearchWrapperElement().find("#search_input_wrapper");
};

/**
 * @return {Object}
 */
AapentAppMainView.prototype.getSearchInputElement = function() {
	return this.getSearchInputWrapperElement().find("#search_input");
};

/**
 * @return {Object}
 */
AapentAppMainView.prototype.getSearchResetElement = function() {
	return this.getSearchInputWrapperElement().find("#search_reset");
};

/**
 * @return {Object}
 */
AapentAppMainView.prototype.getSearchButtonElement = function() {
	return this.getSearchInputWrapperElement().find("#search_button");
};

/**
 * @return {Object}
 */
AapentAppMainView.prototype.getSearchSuggestionWrapperElement = function() {
	return this.getSearchWrapperElement().find("#search_suggestion_wrapper");
};

/**
 * @return {Object}
 */
AapentAppMainView.prototype.getSearchSuggestionElement = function() {
	return this.getSearchSuggestionWrapperElement().find(".search_suggestion");
};

/**
 * @return {Object}
 */
AapentAppMainView.prototype.getSearchResultWrapperElement = function() {
	return this.getSearchWrapperElement().find("#search_result_wrapper");
};

// ... ... /ELEMENT

// ... /GET

// ... DO

AapentAppMainView.prototype.doBindEventHandler = function() {
	AppMainView.prototype.doBindEventHandler.call(this);
	var context = this;

	// LIST

//	this.getAapentHandler().mapPlacesList.addNotifyOnChange(function(type, object) {
//		switch (type) {
//		case "add":
//			context.handleMapPlace(object);
//			break;
//		case "addall":
//			context.handleMapPlaces(object);
//			break;
//		}
//	});

	// /LIST

	this.getEventHandler().registerListener(PlaceEvent.TYPE,
	/**
	 * @param {PlaceEvent}
	 *            event
	 */
	function(event) {
		context.doPlaceShow(event.getPlaceId());
	});

};

AapentAppMainView.prototype.doPlaceShow = function(placeId) {
	var place = this.getAapentHandler().getPlace(placeId);
	if (!place)
		return console.error("AapentAppMainView.doPlaceShow: Place dosen't exist (%s)", placeId);

	// Show Place in left menu if establishment
	if (place.isType(Place.TYPE_ESTABLISHMENT)) {
//		if (place.google.reference) {
//			this.getAapentHandler().doRetrievePlaceDetails(place.id);
//		}
//		this.leftMenuPresenter.placePresenter.doPlaceDraw(place.id);
//		this.getAapentHandler().doMapPlace(place.id);
		
		this.doNavigationSelect("place");
		this.getAapentHandler().mapHandler.doPlaceSet(placeId);
	} else {
		this.doPlaceShowOnMap(placeId);
	}
};

AapentAppMainView.prototype.doPlaceShowOnMap = function(placeId) {
	var isPlace = this.getAapentHandler().isPlace(placeId);
	if (!isPlace)
		return console.error("AapentAppMainView.doPlaceShowOnMap: Place dosen't exist (%s)", placeId);

	// Left menu is covering map, close menu
	if (this.getLeftMenuWrapperElement().css("right") == "0px") {
		this.doMenu(false);
	}

	this.getAapentHandler().mapHandler.doPlaceSet(placeId);
//	this.getAapentHandler().doMapPlace(placeId);
};

AapentAppMainView.prototype.doNavigationSelect = function(navigationId) {
	this.leftMenuPresenter.doNavigationSelect(navigationId);
	this.navigationPresenter.doNavigationSelect(navigationId);
	this.doMenu(true);
};

/**
 * @param {Boolean}
 *            Open, null if toggle
 */
AapentAppMainView.prototype.doMenu = function(open) {
	if (typeof open != "boolean")
		open = !this.getWrapperElement().attr("data-leftmenu");
	if (open)
		this.getWrapperElement().attr("data-leftmenu", "true");
	else
		this.getWrapperElement().removeAttr("data-leftmenu");
};

// ... /DO

// ... HANDLE

// ... ... ... PLACES

//AapentAppMainView.prototype.handleMapPlaces = function(placeIds) {
//	for ( var i in placeIds) {
//		this.handleMapPlace(placeIds[i].id);
//	}
//};
//
//AapentAppMainView.prototype.handleMapPlace = function(placeId) {
//	var context = this;
//	var place = this.getAapentHandler().getPlace(placeId);
//
//	if (!place)
//		return console.error("AapentAppMainView.handleMapPlace: Place dosn't exist (%s)", placeId);
//	if (!this.getAapentHandler().map)
//		return console.error("AapentAppMainView.handleMapPlace: Map is not initilized");
//
//	if (this.markersPlaces[place.id])
//		return; // Already placed
//
//	var marker = new PinImageMarker({
//		map : this.getAapentHandler().map,
//		placeId : place.id,
//		title : place.name,
//		position : new google.maps.LatLng(place.location.lat, place.location.lng),
//		zIndex : place.isGoogle ? AapentAppMainView.MARKER_ZINDEX_PLACE_GOOGLE : AapentAppMainView.MARKER_ZINDEX_PLACE_AAPENT,
//		image : place.images.pin,
//		imageScale : place.isGoogle ? 0.5 : 1,
//		strokeColor : typeof place.hours.isOpen == "boolean" ? (place.hours.isOpen ? "#6aa84f" : "#e06666") : null
//	});
//	// var marker = new google.maps.Marker({
//	// map : this.getAapentHandler().map,
//	// visible : true,
//	// placeId : place.id,
//	// title : place.name,
//	// position : new google.maps.LatLng(place.location.lat,
//	// place.location.lng),
//	// zIndex : place.isGoogle ? AapentAppMainView.MARKER_ZINDEX_PLACE_GOOGLE :
//	// AapentAppMainView.MARKER_ZINDEX_PLACE_AAPENT,
//	// optimized: false
//	// });
//	// if (place.images.pin) {
//	// var size = new google.maps.Size(20, 20);
//	// if (place.isAapen)
//	// size = new google.maps.Size(50, 50);
//	// marker.setIcon(new google.maps.MarkerImage(place.images.pin, null, null,
//	// null, size));
//	// }
//	// marker.setIcon(new google.maps.MarkerImage(icon, null, null, null, new
//	// google.maps.Size(50, 50)));
//
//	// google.maps.event.addListener(marker, 'click', function() {
//	// if (this.placeId)
//	// context.doPlaceShow(this.placeId);
//	// });
//	marker.addListener(function(pinImage) {
//		if (pinImage.options.placeId)
//			context.doPlaceShow(pinImage.options.placeId);
//	});
//
//	this.markersPlaces[place.id] = marker;
//};

// ... ... ... /PLACES

// ... ... /MAP

// ... /HANDLE

AapentAppMainView.prototype.draw = function(controller) {
	AppMainView.prototype.draw.call(this, controller);

	this.navigationPresenter.draw(this.getNavigationWrapperElement());
	this.topMenuPresenter.draw(this.getTopMenuWrapperElement());
	this.leftMenuPresenter.draw(this.getLeftMenuWrapperElement());

	var navigationDefault = "search_results";
	this.leftMenuPresenter.doNavigationSelect(navigationDefault);
	this.navigationPresenter.doNavigationSelect(navigationDefault);

	// this.searchSuggestionTemplate =
	// this.getSearchSuggestionElement().filter(".template");
	//
	// // Search wrapper top
	// var menuWrapper = this.getWrapperElement().find("#menu_wrapper");
	// var searchWrapper = this.getWrapperElement().find("#search_wrapper");
	// searchWrapper.css("top", menuWrapper.height());
};

// /FUNCTIONS
