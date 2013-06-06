<?php

class NavigationAppPresenterView extends AbstractPresenterView
{

    // VARIABLES


    private static $ID_WRAPPER = "navigation_wrapper";
    private static $ID_CONTAINER = "navigation_container";

    /**
     * @var array
     */
    private $items = array ();

    // /VARIABLES


    // CONSTRUCTOR


    /**
     * @see AbstractPresenterView::__construct()
     */
    public function __construct( AbstractMainView $view )
    {
        parent::__construct( $view );

        // Left menu toggler
        $this->addItem( Resource::image()->getEmptyImage(), "Menu", "left_menu_toggler" );
    }

    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @see AbstractPresenterView::draw()
     */
    public function draw( AbstractXhtml $root )
    {
        $wrapper = Xhtml::div()->id( self::$ID_WRAPPER );
        $container = Xhtml::div()->id( self::$ID_CONTAINER );

        // Items
        $this->drawItems( $container );

        $wrapper->addContent( $container );
        $root->addContent( $wrapper );
    }

    /**
     * @param AbstractXhtml $root
     */
    private function drawItems( AbstractXhtml $root )
    {
        foreach ( $this->items as $item )
            $root->addContent( $item );
    }

    /**
     * @param String $image
     * @param String $title
     * @param String $id
     * @param String $navigationId
     */
    public function addItem( $image, $title, $id = null, $navigationId = null )
    {
        $item = Xhtml::div()->class_( "navigation_item" );
        $item->addContent(Xhtml::div()->class_("highlight"));
        $item->addContent( Xhtml::img( $image, $title )->title( $title )->class_( "icon" ) );
        $item->addContent( Xhtml::div( $title )->class_( "title" ) );

        if ( $id )
            $item->attr( "id", $id );
        if ( $navigationId )
            $item->attr( "data-nav-id", $navigationId );

        $this->items[] = $item;
    }

    // /FUNCTIONS


}

?>