// CONSTRUCTOR
MainController.prototype = new AbstractMainController();

function MainController(eventHandler, mode, query) {
	AbstractMainController.apply(this, arguments);
}

// /CONSTRUCTOR

// VARIABLES

// /VARIABLES

// FUNCTIONS

// ... GET

/**
 * @return {MainView}
 */
MainController.prototype.getView = function() {
	return AbstractMainController.prototype.getView.call(this);
};

// ... /GET

// ... DO

MainController.prototype.doBindEventHandler = function() {
	AbstractMainController.prototype.doBindEventHandler.call(this);
};

// ... /DO

// ... RENDER

/**
 * @param {MainView}
 *            view
 */
MainController.prototype.render = function(view) {
	AbstractMainController.prototype.render.call(this, view);
};

// ... /RENDER

// /FUNCTIONS
