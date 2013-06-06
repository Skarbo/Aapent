<?php

class TopMenuAppPresenterView extends AbstractPresenterView
{

    // VARIABLES


    private static $ID_WRAPPER = "top_menu_wrapper";
    private static $ID_CONTAINER = "top_menu_container";

    private static $ID_SEARCH_INPUT_WRAPPER = "search_input_wrapper";
    private static $ID_SEARCH_INPUT_CONTAINER = "search_input_container";
    private static $ID_SEARCH_INPUT = "search_input";

    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @see AbstractPresenterView::draw()
     */
    public function draw( AbstractXhtml $root )
    {
        $wrapper = Xhtml::div()->id( self::$ID_WRAPPER );
        $container = Xhtml::div()->id( self::$ID_CONTAINER );

        // Search input wrapper
        $this->drawSearchInput( $container );

        $wrapper->addContent( $container );
        $root->addContent( $wrapper );
    }

    /**
     * @param AbstractXhtml $root
     */
    private function drawSearchInput( AbstractXhtml $root )
    {
        $wrapper = Xhtml::div()->id( self::$ID_SEARCH_INPUT_WRAPPER );
        $container = Xhtml::div()->id( self::$ID_SEARCH_INPUT_CONTAINER );

        // Search icon
        $searchIcon = Xhtml::div(
                Xhtml::img()->src( Resource::image()->icon()->getSearchSvg( "white", "white" ), "Search" )->title( "Search" ) )->class_(
                "search_icon" );

        // Search input
        $searchInput = Xhtml::div(
                Xhtml::input()->placeholder( "Search" )->autocomplete(InputXhtml::$AUTOCOMPLETE_OFF)->title( "Search" )->id( self::$ID_SEARCH_INPUT ) )->class_(
                "input_wrapper" );

        // Search reset
        $searchReset = Xhtml::div()->attr( "data-icon", "cross" )->title( "Reset" )->class_( "search_reset" );

        $container->addContent( $searchIcon, $searchInput, $searchReset );
        $wrapper->addContent( $container );
        $root->addContent( $wrapper );
    }

    // /FUNCTIONS


}

?>