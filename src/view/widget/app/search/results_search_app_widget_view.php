<?php

class ResultsSearchAppWidgetView extends AbstractWidgetView
{

    // VARIABLES


    private static $ID_WRAPPER = "search_results_wrapper";
    private static $ID_CONTAINER = "search_results_container";
    private static $ID_NORESULTS = "search_results_none";

    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @see AbstractWidgetView::draw()
     */
    public function draw( AbstractXhtml $root )
    {
        $wrapper = Xhtml::div()->id( self::$ID_WRAPPER );
        $container = Xhtml::div()->id( self::$ID_CONTAINER );

        // Search result
        $this->drawSearchResult( $container );

        $wrapper->addContent( $container );

        // No results
        $wrapper->addContent( Xhtml::div( "No results" )->id( self::$ID_NORESULTS ) );

        $root->addContent( $wrapper );
    }

    /**
     * @param AbstractXhtml $root
     */
    private function drawSearchResult( AbstractXhtml $root )
    {
        $wrapper = Xhtml::div()->class_( "search_result", "template" );

        // CONTENT


        $contentWrapper = Xhtml::div()->class_( "content_wrapper" )->attr( "data-touchclick", "true" );
        $content = Xhtml::div()->class_( "content" );

        // Icon
        $icon = Xhtml::div( Xhtml::img( Resource::image()->getEmptyImage(), "Icon" )->title( "Icon" ) )->class_(
                "icon" );

        // Info
        $infoWrapper = Xhtml::div()->class_("info_wrapper");
        $info = Xhtml::div()->class_( "info" );
        $name = Xhtml::div( "Name" )->class_( "name" );
        $address = Xhtml::div( "Address" )->class_( "address" );
        $info->addContent( $name, $address );
        $infoWrapper->addContent($info);

        // Hours
        $hours = Xhtml::div()->class_( "hours" );
        $time = Xhtml::div( Xhtml::span( "00" )->class_( "from" ) )->addContent( Xhtml::span( "00" )->class_( "to" ) )->class_(
                "time" );
        $clock = Xhtml::div()->attr( "data-icon", "clock" )->class_( "clock" );
        $hours->addContent( $time, $clock );

        $content->addContent( $icon, $infoWrapper, $hours );
        $contentWrapper->addContent( $content );
        $wrapper->addContent( $contentWrapper );

        // /CONTENT


        // Border
        $wrapper->addContent( Xhtml::div()->class_( "border" ) );

        // Distance
        $wrapper->addContent( Xhtml::div( "000" )->class_( "distance" )->attr( "data-touchclick", "true" ) );

        $root->addContent( $wrapper );
    }

    // /FUNCTIONS


}

?>