// CONSTRUCTOR
LeftMenuAppPresenterView.prototype = new AbstractPresenterView();

function LeftMenuAppPresenterView(view) {
	AbstractPresenterView.apply(this, arguments);
	this.resultsSearchPresenter = new ResultsSearchAppPresenterView(view);
	this.placePresenter = new PlaceAppPresenterView(view);
};

// VARIABLES

// /VARIABLES

// FUNCTIONS

// ... GET

/**
 * @returns {AapentAppMainView}
 */
LeftMenuAppPresenterView.prototype.getView = function() {
	return AbstractPresenterView.prototype.getView.call(this);
};

LeftMenuAppPresenterView.prototype.getContentElements = function() {
	return this.getRoot().find(".left_menu_content");
};

LeftMenuAppPresenterView.prototype.getNavigationElements = function() {
	return this.getContentElements().filter("[data-nav-content]");
};

LeftMenuAppPresenterView.prototype.getSearchResultsWrapperElement = function() {
	return this.getRoot().find("#search_results_wrapper");
};

LeftMenuAppPresenterView.prototype.getPlaceWrapperElement = function() {
	return this.getRoot().find("#place_wrapper");
};

// ... /GET

// ... DO

LeftMenuAppPresenterView.prototype.doBindEventHandler = function() {
	AbstractPresenterView.prototype.doBindEventHandler.call(this);
};

LeftMenuAppPresenterView.prototype.doNavigationSelect = function(navigationId) {
	var navigationElement = this.getNavigationElements().filter("[data-nav-content='" + navigationId + "']");

	this.getNavigationElements().removeAttr("data-nav-selected");
	if (navigationElement.length > 0)
		navigationElement.attr("data-nav-selected", "true");
};

// ... /DO

LeftMenuAppPresenterView.prototype.draw = function(root) {
	AbstractPresenterView.prototype.draw.call(this, root);

	this.resultsSearchPresenter.draw(this.getSearchResultsWrapperElement());
	this.placePresenter.draw(this.getPlaceWrapperElement());
};

// /FUNCTIONS
