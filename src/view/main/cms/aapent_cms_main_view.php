<?php

class AapentCmsMainView extends CmsMainView
{

    // VARIABLES


    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @see AbstractView::getController()
     * @return AapentCmsMainController
     */
    public function getController()
    {
        return parent::getController();
    }

    /**
     * @see AbstractView::draw()
     */
    public function draw( AbstractXhtml $root )
    {
        $wrapper = Xhtml::div();

        if (AapentCmsMainController::getQuery("fail"))
            $wrapper->addContent(Xhtml::div("Failed")->style("color: red;"));
        if (AapentCmsMainController::getQuery("success"))
            $wrapper->addContent(Xhtml::div(AapentCmsMainController::getQuery("success"))->style("color: green;"));

        // ADD QUEUE


        $form = Xhtml::form()->action( "?&addqueue=true" )->method( FormXhtml::$METHOD_POST );
        $select = Xhtml::select()->name( "group_place_id" );

        for ( $this->getController()->getPlaceGroups()->rewind(); $this->getController()->getPlaceGroups()->valid(); $this->getController()->getPlaceGroups()->next() )
        {
            $placeGroup = $this->getController()->getPlaceGroups()->current();

            $select->addContent( Xhtml::option( $placeGroup->getPlaceGroupName(), $placeGroup->getId() ) );
        }

        $form->addContent( $select );
        $form->addContent( Xhtml::button( "Add" )->type( ButtonXhtml::$TYPE_SUBMIT ) );
        $wrapper->addContent( Xhtml::h( 1, "Add Queue" ), $form );

        // /ADD QUEUE


        $wrapper->addContent( Xhtml::h(1, "Execute Queue" ), Xhtml::a( "Execute Queue", "?&executequeue=true" ) );

        // QUEUES


        $queuesWrapper = Xhtml::div( Xhtml::h( 1, "Queue" ) );

        for ( $this->getController()->getQueues()->rewind(); $this->getController()->getQueues()->valid(); $this->getController()->getQueues()->next() )
        {
            $queue = $this->getController()->getQueues()->current();

            $queueWrapper = Xhtml::div();

            $queuesWrapper->addContent( Xhtml::div( sprintf( "Id: %d", $queue->getId() ) ) );
            $queuesWrapper->addContent( Xhtml::div( sprintf( "Type: %s", $queue->getType() ) ) );
            $queuesWrapper->addContent(
                    Xhtml::div( sprintf( "Arguments: %s", Core::createJsonString( $queue->getArguments() ) ) ) );
            $queuesWrapper->addContent( Xhtml::div( sprintf( "Occurence: %d", $queue->getOccurence() ) ) );
            $queuesWrapper->addContent( Xhtml::div( sprintf( "Error: %d", $queue->getError() ) ) );
            $queuesWrapper->addContent(
                    Xhtml::div( sprintf( "Registered: %s", date( "H:i d. m y", $queue->getRegistered() ) ) ) );
            $queuesWrapper->addContent( Xhtml::div( Xhtml::a( "Delete", "?&deletequeue=" . $queue->getId() ) ) );

            $queuesWrapper->addContent( $queueWrapper );
        }

        $wrapper->addContent( $queuesWrapper );

        // /QUEUES


        $root->addContent( $wrapper );
    }

    // /FUNCTIONS


}

?>