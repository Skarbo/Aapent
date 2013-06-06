<?php

class PlaceAppWidgetView extends AbstractWidgetView
{

    // VARIABLES


    private static $ID_WRAPPER = "place_wrapper";
    private static $ID_CONTAINER = "place_container";

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

        // Place
        $this->drawPlace( $container );

        $wrapper->addContent( $container );
        $root->addContent( $wrapper );
    }

    /**
     * @param AbstractXhtml $root
     */
    private function drawPlace( AbstractXhtml $root )
    {
        $this->drawPlaceInfo( $root );
        $this->drawPlaceHours( $root );
        $this->drawPlaceMap( $root );
    }

    /**
     * @param AbstractXhtml $root
     */
    private function drawPlaceInfo( AbstractXhtml $root )
    {
        $wrapper = Xhtml::div()->class_( "info_wrapper" );
        $container = Xhtml::div()->class_( "info_container" );

        // CONTENT


        $content = Xhtml::div()->class_( "content" )->attr( "data-touchclick", "true" );

        // Icon
        $icon = Xhtml::div( Xhtml::img( Resource::image()->getEmptyImage(), "Icon" )->title( "Icon" ) )->class_(
                "icon" );

        // Name/address
        $nameAddress = Xhtml::div()->class_( "name_address" );
        $nameAddress->addContent( Xhtml::div( "Name" )->class_( "name" ) );
        $nameAddress->addContent( Xhtml::div( "Address" )->class_( "address" ) );

        $content->addContent( $icon, $nameAddress );

        // /CONTENT


        // CONTACT


        $contactWrapper = Xhtml::div()->class_( "contact_wrapper" );
        $contactContainer = Xhtml::div()->class_( "contact_container" );
        $contact = Xhtml::div()->class_( "contact" );

        // Phone
        $phoneContactItem = Xhtml::div()->class_( "contact_item" )->attr( "data-contact", "phone" )->title(
                "Phone" );
        $phoneContactItem->addContent(
                Xhtml::div( Xhtml::img( Resource::image()->getEmptyImage() ) )->class_( "icon" ) );
        $phoneContactItem->addContent( Xhtml::div( "12 34 56 78" )->class_( "value" ) );

        // Email
        $emailContactItem = Xhtml::div()->class_( "contact_item" )->attr( "data-contact", "email" )->title(
                "Email" );
        $emailContactItem->addContent(
                Xhtml::div( Xhtml::img( Resource::image()->getEmptyImage() ) )->class_( "icon" ) );
        $emailContactItem->addContent( Xhtml::div( "email@email.com" )->class_( "value" ) );

        // Website
        $websiteContactItem = Xhtml::div()->class_( "contact_item" )->attr( "data-contact", "website" )->title(
                "Website" );
        $websiteContactItem->addContent(
                Xhtml::div( Xhtml::img( Resource::image()->getEmptyImage() ) )->class_( "icon" ) );
        $websiteContactItem->addContent( Xhtml::div( "website.com" )->class_( "value" ) );

        $contact->addContent( $phoneContactItem, $emailContactItem, $websiteContactItem );
        $contactContainer->addContent( $contact );

        // /CONTACT


        $contactWrapper->addContent( $contactContainer );
        $container->addContent( $content, $contactWrapper );
        $wrapper->addContent( $container );
        $root->addContent( $wrapper );
    }

    /**
     * @param AbstractXhtml $root
     */
    private function drawPlaceHours( AbstractXhtml $root )
    {
        $wrapper = Xhtml::div()->class_( "hours_wrapper" );
        $container = Xhtml::div()->class_( "hours_container" );

        // Icon
//         $icon = Xhtml::div( Xhtml::img( Resource::image()->getEmptyImage(), "Hours" ) )->class_( "icon" );

        // TIMES


        $timesWrapper = Xhtml::div()->class_( "times_wrapper" );
        $timesContainer = Xhtml::div()->class_( "times_container" );

        // Regular
        $regularTimesGroup = Xhtml::div()->class_( "times_group" )->attr( "data-times-group", "regular" );
        $timesRow = Xhtml::div()->class_( "times_row" );
        $timesRow->addContent( Xhtml::div( "Day" )->class_( "day" )->title( "Day" ) );
        $timesRow->addContent( Xhtml::div( "00:00" )->class_( "hour_from" )->title( "Open" ) );
        $timesRow->addContent( Xhtml::div( "00:00" )->class_( "hour_to" )->title( "Close" ) );
        $timesRow->addContent( Xhtml::div( "00:00" )->class_( "hour_alcohol" )->title( "Alcohol sale" ) );
        $regularTimesGroup->addContent( $timesRow );

        // Holiday
        $holidaysTimesGroup = Xhtml::div()->class_( "times_group" )->attr( "data-times-group", "holiday" );
        $holidaysTimesGroup->addContent( $timesRow );

        // Icons
        $iconsGroup = Xhtml::div()->class_( "icon_group" );
        $iconRow = Xhtml::div()->class_( "times_row" );
        $iconRow->addContent( Xhtml::div( Xhtml::$NBSP )->class_( "day" ) );
        $iconRow->addContent(
                Xhtml::div( Xhtml::img( Resource::image()->getEmptyImage(), "Open" ) )->class_( "hour_from" ) );
        $iconRow->addContent(
                Xhtml::div( Xhtml::img( Resource::image()->getEmptyImage(), "Close" ) )->class_( "hour_to" ) );
        $iconRow->addContent(
                Xhtml::div( Xhtml::img( Resource::image()->getEmptyImage(), "Alcohol sale" ) )->class_( "hour_alcohol" ) );
        $iconsGroup->addContent( $iconRow );

        $timesContainer->addContent( $iconsGroup, $regularTimesGroup, $holidaysTimesGroup );
        $timesWrapper->addContent( $timesContainer );

        // /TIMES


        $container->addContent( $timesWrapper );
        $wrapper->addContent( $container );

        // More
        $more = Xhtml::div(
                Xhtml::div( Xhtml::img( Resource::image()->getEmptyImage(), "More" ) )->class_( "hours_more_container" ) )->class_(
                "hours_more_wrapper" )->title( "More hours" );
        $wrapper->addContent( $more );

        $root->addContent( $wrapper );
    }

    /**
     * @param AbstractXhtml $root
     */
    private function drawPlaceMap( AbstractXhtml $root )
    {
        $wrapper = Xhtml::div()->class_( "map_wrapper" );
        $container = Xhtml::div()->class_( "map_container" );

        // Streetview
        $streetview = Xhtml::div(
                Xhtml::img( Resource::image()->getEmptyImage(), "Streetview" )->title( "Streetview" ) )->class_(
                "streetview" );

        // BUTTONS


        $buttons = Xhtml::div()->class_( "buttons" );

        // Directions
        $directionsButton = Xhtml::div(
                Xhtml::img( Resource::image()->getEmptyImage(), "Directions" )->class_( "icon" ) )->addContent(
                Xhtml::div( "Directions" )->class_( "title" ) )->class_( "button" )->attr("data-button", "directions")->title( "Directions" );

        // Map
        $mapButton = Xhtml::div(
                Xhtml::img( Resource::image()->getEmptyImage(), "Map" )->class_( "icon" ) )->addContent(
                Xhtml::div( "Map" )->class_( "title" ) )->class_( "button" )->attr("data-button", "map")->attr( "data-touchclick", "true" )->title( "Map" );

        // Google Plus
        $googlePlusButton = Xhtml::div(
                Xhtml::img( Resource::image()->getEmptyImage(), "Google Plus" )->class_( "icon" ) )->addContent(
                Xhtml::div( "Google+" )->class_( "title" ) )->class_( "button" )->attr("data-button", "google_plus")->attr( "data-touchclick", "true" )->title( "Google Plus" );

        $buttons->addContent( $directionsButton, $mapButton, $googlePlusButton );

        // /BUTTONS


        $container->addContent( $streetview, $buttons );
        $wrapper->addContent( $container );
        $root->addContent( $wrapper );

    }

    // /FUNCTIONS


}

?>