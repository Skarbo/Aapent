// CONSTRUCTOR
AppMainController.prototype = new MainController();

function AppMainController(eventHandler, mode, query) {
	MainController.apply(this, arguments);
}

// /CONSTRUCTOR

// VARIABLES

// /VARIABLES

// FUNCTIONS

// ... GET

/**
 * @return {AppMainView}
 */
AppMainController.prototype.getView = function() {
	return MainController.prototype.getView.call(this);
};

// ... /GET

// ... DO

// ... /DO

// ... RENDER

// ... /RENDER

// /FUNCTIONS
