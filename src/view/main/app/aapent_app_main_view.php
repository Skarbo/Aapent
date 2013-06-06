<?php

class AapentAppMainView extends AbstractMainView
{

    // VARIABLES


    public static $ID_APP_WRAPPER = "aapent_app_wrapper";

    public static $ID_MAP_WRAPPER = "map_wrapper";
    public static $ID_MAP_CANVAS = "map_canvas";

    private static $ID_MENU_WRAPPER = "menu_wrapper";
    private static $ID_MENU_CONTAINER = "menu_container";
    private static $MENU_TABLE = "menu_table";
    private static $MENU_LEFT = "menu_left";
    private static $MENU_RIGHT = "menu_right";

    private static $ID_SEARCH_WRAPPER = "search_wrapper";
    private static $ID_SEARCH_CONTAINER = "search_container";
    private static $SEARCH_INPUT_WRAPPER = "search_input_wrapper";
    private static $SEARCH_INPUT = "search_input";
    private static $SEARCH_RESET = "search_reset";
    private static $SEARCH_BUTTON = "search_button";
    private static $SEARCH_SUGGESTION_WRAPPER = "search_suggestion_wrapper";
    private static $SEARCH_RESULT_WRAPPER = "search_result_wrapper";

    /**
     * @var NavigationAppPresenterView
     */
    private $navigationPresenter;
    /**
     * @var TopMenuAppPresenterView
     */
    private $topMenuPresenter;
    /**
     * @var LeftMenuAppPresenterView
     */
    private $leftMenuPresenter;

    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @see AbstractView::getController()
     * @return AapentAppMainController
     */
    public function getController()
    {
        return parent::getController();
    }

    /**
     * @see AbstractView::getLastModified()
     */
    protected function getLastModified()
    {
        return max( $this->getController()->getLastModified(), parent::getLastModified(), filemtime( __FILE__ ) );
    }

    // ... DRAW


    /**
     * @see AbstractView::before()
     */
    public function before()
    {
        // Top menu
        $this->topMenuPresenter = new TopMenuAppPresenterView( $this );

        // NAVIGATION


        $this->navigationPresenter = new NavigationAppPresenterView( $this );

        // Search results
        $this->navigationPresenter->addItem( Resource::image()->icon()->getSearchSvg( "white", "white" ),
                "Results", "nav_item_search_results", "search_results" );

        // Place
        $this->navigationPresenter->addItem( Resource::image()->icon()->getMarkerSvg( "white", "white" ),
                "Place", "nav_item_place", "place" );

        // Location
        $this->navigationPresenter->addItem( Resource::image()->icon()->getLocationSvg( "white", "white" ),
                "Location", "nav_item_location" );

        // /NAVIGATION


        // LEFT MENU


        $this->leftMenuPresenter = new LeftMenuAppPresenterView( $this );

        // Search results
        $searchResultsWidget = Xhtml::div();
        ResultsSearchAppWidgetView::init( $this )->draw( $searchResultsWidget );
        $this->leftMenuPresenter->addContent( "search_results", $searchResultsWidget );

        // Place
        $placeWidget = Xhtml::div();
        PlaceAppWidgetView::init( $this )->draw( $placeWidget );
        $this->leftMenuPresenter->addContent( "place", $placeWidget );

        // LEFT MENU
    }

    /**
     * @see AbstractView::draw()
     */
    public function draw( AbstractXhtml $root )
    {
        $wrapper = Xhtml::div()->id( self::$ID_APP_WRAPPER );

        // Navigation
        $this->navigationPresenter->draw( $wrapper );

        // Top menu
        $this->topMenuPresenter->draw( $wrapper );

        // Left menu
        $this->leftMenuPresenter->draw( $wrapper );

        // Map
        $this->drawMap( $wrapper );

        //         // Menu
        //         $this->drawMenu( $wrapper );


        //         // Search
        //         $this->drawSearch( $wrapper );


        //         // Map wrapper
        //         $mapWrapper = Xhtml::div()->id( "map_wrapper" );
        //         $wrapper->addContent( $mapWrapper );


        $root->addContent( $wrapper );
    }

    /**
     * @param AbstractXhtml $root
     */
    private function drawMap( AbstractXhtml $root )
    {
        $wrapper = Xhtml::div()->id( "map_wrapper" );
        $wrapper->addContent( Xhtml::div()->id( "map_canvas" ) );
        $root->addContent( $wrapper );
    }

    /**
     * @param AbstractXhtml wrapper
     */
    private function drawMenu( AbstractXhtml $root )
    {
        $wrapper = Xhtml::div()->id( self::$ID_MENU_WRAPPER );
        $container = Xhtml::div()->id( self::$ID_MENU_CONTAINER );

        $left = Xhtml::div()->id( self::$MENU_LEFT );
        $right = Xhtml::div()->id( self::$MENU_RIGHT );

        $menuItemLocation = Xhtml::div( Xhtml::span( "Location" ) )->addContent(
                Xhtml::img( Resource::image()->getEmptyImage(), "Location" ) )->class_( "menu_item" )->attr( "data-item",
                "location" )->title( "Location" )->attr( "data-touchclick", "true" );
        $menuItemSearch = Xhtml::div( Xhtml::span( "Search" ) )->addContent(
                Xhtml::img( Resource::image()->getEmptyImage(), "Search" ) )->class_( "menu_item" )->attr( "data-item",
                "search" )->title( "Search" )->attr( "data-touchclick", "true" );
        $menuItemMore = Xhtml::div( Xhtml::img( Resource::image()->getEmptyImage(), "More" ) )->class_( "menu_item" )->attr(
                "data-item", "more" )->title( "More" )->attr( "data-touchclick", "true" );

        $right->addContent( $menuItemLocation, $menuItemSearch, $menuItemMore );

        $container->addContent( $left, $right );
        $wrapper->addContent( $container );
        $root->addContent( $wrapper );
    }

    /**
     * @param AbstractXhtml wrapper
     */
    private function drawSearch( AbstractXhtml $root )
    {
        $wrapper = Xhtml::div()->id( self::$ID_SEARCH_WRAPPER )->class_( "hide" );
        $container = Xhtml::div()->id( self::$ID_SEARCH_CONTAINER );

        $inputWrapper = Xhtml::div()->id( self::$SEARCH_INPUT_WRAPPER );
        $suggestionWrapper = Xhtml::div()->id( self::$SEARCH_SUGGESTION_WRAPPER );
        $resultWrapper = Xhtml::div()->id( self::$SEARCH_RESULT_WRAPPER );

        // Search input
        $input = Xhtml::div(
                Xhtml::input()->placeholder( "Search" )->autocomplete( InputXhtml::$AUTOCOMPLETE_OFF )->id(
                        self::$SEARCH_INPUT ) )->class_( "input_wrapper" )->title( "Search" );
        $reset = Xhtml::div()->attr( "data-icon", "cross" )->id( self::$SEARCH_RESET )->title( "Reset" );
        $button = Xhtml::div( Xhtml::img( Resource::image()->getEmptyImage(), "Search" ) )->id( self::$SEARCH_BUTTON )->attr(
                "data-touchclick", "true" );
        $inputWrapper->addContent( $input, $reset, $button );

        // Search suggestion
        $suggestionItem = Xhtml::div(
                Xhtml::div( Xhtml::img( Resource::image()->getEmptyImage(), "Suggestion" ) )->class_( "icon" ) );
        $suggestionItem->addContent(
                Xhtml::div(
                        Xhtml::div( Xhtml::div( "Title" )->class_( "title" ) )->addContent(
                                Xhtml::div( "Address" )->class_( "address" ) )->class_( "description_wrapper" ) )->class_(
                        "description" ) );
        $suggestionItem->addContent(
                Xhtml::div(
                        Xhtml::div( Xhtml::span( "00" )->class_( "from" ) )->addContent(
                                Xhtml::span( "00" )->class_( "to" ) )->class_( "time" ) )->addContent(
                        Xhtml::div()->attr( "data-icon", "clock" )->class_( "clock" ) )->class_( "hours" ) );
        $suggestionItem->addContent( Xhtml::div( "000" )->class_( "distance" ) );
        $suggestionItem->class_( "search_suggestion", "template" )->attr( "data-suggestion-type", "suggestion" );
        $suggestionItem->attr( "data-touchclick", "true" );
        $suggestionWrapper->addContent( $suggestionItem );

        $container->addContent( $inputWrapper, $suggestionWrapper, $resultWrapper );
        $wrapper->addContent( $container );
        $root->addContent( $wrapper );
    }

    // ... /DRAW


    // /FUNCTIONS


}

?>