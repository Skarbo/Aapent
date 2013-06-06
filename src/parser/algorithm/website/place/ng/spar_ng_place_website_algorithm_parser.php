<?php

class SparNgPlaceWebsiteAlgorithmParser extends NgPlaceWebsiteAlgorithmParser
{

    // VARIABLES


    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @see NgPlaceWebsiteAlgorithmParser::getPlaceType()
     */
    protected function getPlaceType()
    {
        return GroupPlaceModel::$TYPE_SPAR;
    }

    /**
     * @see PlaceWebsiteAlgorithmParser::isAddSinglePlaceToQueue()
     */
    public function isAddSinglePlaceToQueue()
    {
        return true;
    }

    /**
     * @see PlaceWebsiteAlgorithmParser::getSinglePlaceUrl()
     */
    public function getSinglePlaceUrl( PlaceModel $place, $url )
    {
        return sprintf( $url,
                str_replace( array ( " ", "æ", "ø", "å", "Æ", "Ø", "Å" ), array ( "-", "a", "o", "a", "A", "O", "A" ),
                        $place->getName() ) );
    }

    // ... PLACE


    /**
     * @see PlaceWebsiteAlgorithmParser::parsePlace()
     */
    public function parsePlace( $html )
    {

    }

    // ... /PLACE


    // /FUNCTIONS


}

?>