// CONSTRUCTOR
AppMainView.prototype = new MainView();

function AppMainView(wrapperId) {
	MainView.apply(this, arguments);
}

// /CONSTRUCTOR

// VARIABLES

// /VARIABLES

// FUNCTIONS

// ... GET

/**
 * @return {AppMainController}
 */
AppMainView.prototype.getController = function() {
	return MainView.prototype.getController.call(this);
};

// ... /GET

// ... DO

AppMainView.prototype.doBindEventHandler = function() {
	MainView.prototype.doBindEventHandler.call(this);
};

// ... /DO

// ... DRAW

AppMainView.prototype.draw = function(controller) {
	MainView.prototype.draw.call(this, controller);
};

// ... /DRAW

// /FUNCTIONS
