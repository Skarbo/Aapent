<?php

class LeftMenuAppPresenterView extends AbstractPresenterView
{

    // VARIABLES


    private static $ID_WRAPPER = "left_menu_wrapper";
    private static $ID_CONTAINER = "left_menu_container";

    /**
     * @var array
     */
    private $contents = array ();

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

        // Contents
        $this->drawContents( $container );

        $wrapper->addContent( $container );
        $root->addContent( $wrapper );
    }

    /**
     * @param AbstractXhtml $root
     */
    private function drawContents( AbstractXhtml $root )
    {
        foreach ( $this->contents as $content )
            $root->addContent( $content );
    }

    /**
     * @param String $navId
     * @param AbstractXhtml $content
     */
    public function addContent( $navId, AbstractXhtml $content )
    {
        $content->attr( "data-nav-content", $navId )->addClass( "left_menu_content" );
        $this->contents[] = $content;
    }

    // /FUNCTIONS


}

?>