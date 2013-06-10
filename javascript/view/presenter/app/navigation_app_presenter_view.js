// CONSTRUCTOR
NavigationAppPresenterView.prototype = new AbstractPresenterView();

function NavigationAppPresenterView(view) {
	AbstractPresenterView.apply(this, arguments);
};

// VARIABLES

// /VARIABLES

// FUNCTIONS

// ... GET

/**
 * @returns {AapentAppMainView}
 */
NavigationAppPresenterView.prototype.getView = function() {
	return AbstractPresenterView.prototype.getView.call(this);
};

/**
 * @returns {AapentHandler}
 */
NavigationAppPresenterView.prototype.getAapentHandler = function() {
	return this.getView().getAapentHandler();
};

NavigationAppPresenterView.prototype.getItemElements = function() {
	return this.getRoot().find(".navigation_item");
};

NavigationAppPresenterView.prototype.getLeftMenuTogglerElement = function() {
	return this.getItemElements().filter("#left_menu_toggler");
};

NavigationAppPresenterView.prototype.getNavigationItemElements = function() {
	return this.getItemElements().filter("[data-nav-id]");
};

// ... /GET

// ... DO

NavigationAppPresenterView.prototype.doBindEventHandler = function() {
	AbstractPresenterView.prototype.doBindEventHandler.call(this);
	var context = this;

	this.getNavigationItemElements().on("touchclick", function() {
		context.getView().doNavigationSelect($(this).attr("data-nav-id"));
	});

	this.getLeftMenuTogglerElement().on("touchclick", function() {
		context.getView().doMenu();
	});

	this.getItemElements().filter("#nav_item_location").on("touchclick", function() {
		if (context.getAapentHandler().position != null) {
			context.getAapentHandler().mapHandler.doViewport(context.getAapentHandler().position, true);
		} else {
			context.getAapentHandler().doGeolocationInit();
		}
	});
};

NavigationAppPresenterView.prototype.doNavigationSelect = function(navigationId) {
	var navigationElement = this.getNavigationItemElements().filter("[data-nav-id='" + navigationId + "']");
	this.getNavigationItemElements().removeAttr("data-nav-selected");

	if (navigationElement.length > 0) {
		navigationElement.attr("data-nav-selected", "true");
	}
};

// ... /DO

NavigationAppPresenterView.prototype.draw = function(root) {
	AbstractPresenterView.prototype.draw.call(this, root);
};

// /FUNCTIONS
