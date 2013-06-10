// CONSTRUCTOR
TopMenuAppPresenterView.prototype = new AbstractPresenterView();

function TopMenuAppPresenterView(view) {
	AbstractPresenterView.apply(this, arguments);
	this.searchTimeout = null;
};

// VARIABLES

// /VARIABLES

// FUNCTIONS

// ... GET

/**
 * @returns {AapentAppMainView}
 */
TopMenuAppPresenterView.prototype.getView = function() {
	return AbstractPresenterView.prototype.getView.call(this);
};

// ... ... SEARCH INPUT WRAPPER

TopMenuAppPresenterView.prototype.getSearchInputWrapperElement = function() {
	return this.getRoot().find("#search_input_wrapper");
};

TopMenuAppPresenterView.prototype.getSearchInputElement = function() {
	return this.getSearchInputWrapperElement().find("#search_input");
};

TopMenuAppPresenterView.prototype.getSearchResetElement = function() {
	return this.getSearchInputWrapperElement().find(".search_reset");
};

// ... ... /SEARCH INPUT WRAPPER

// ... /GET

// ... DO

TopMenuAppPresenterView.prototype.doBindEventHandler = function() {
	AbstractPresenterView.prototype.doBindEventHandler.call(this);
	var context = this;

	this.getSearchInputElement().keyup(function(e) {
		// Menu close
		if (e.which == 27) {
			context.doMenuClose();
			return true;
		}

		// Search
		if (context.searchTimeout)
			clearTimeout(context.searchTimeout);
		context.searchTimeout = setTimeout(function() {
			context.doSearch(context.getSearchInputElement().val());
		}, AapentHandler.SEARCH_TIMEOUT);
	}).focus(function(event) {
		context.getView().doNavigationSelect("search_results");
	});

	this.getSearchResetElement().on("touchclick", function(event) {
		event.preventDefault();
		context.doSearchReset();
	});
};

TopMenuAppPresenterView.prototype.doMenuClose = function() {
	this.getSearchInputElement().blur();
	this.getView().doMenu(false);
};

TopMenuAppPresenterView.prototype.doSearch = function(searchText) {
//	this.getView().getAapentHandler().doSearch(searchText);	
	this.getView().getEventHandler().handle(new SearchEvent(searchText));
};

TopMenuAppPresenterView.prototype.doSearchReset = function() {
	this.getView().getEventHandler().handle(new SearchEvent(null));
//	this.getView().getAapentHandler().doSearchReset();
	if (this.getSearchInputElement().val() == "")
		return this.doMenuClose();
	this.getSearchInputElement().val("");
};

// ... /DO

TopMenuAppPresenterView.prototype.draw = function(root) {
	AbstractPresenterView.prototype.draw.call(this, root);
};

// /FUNCTIONS
