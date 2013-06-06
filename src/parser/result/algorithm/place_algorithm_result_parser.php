<?php

class PlaceAlgorithmResultParser extends AlgorithmResultParser
{

    // VARIABLES


    /**
     * @var PlaceListModel
     */
    private $places;

    // /VARIABLES


    // CONSTRUCTOR


    public function __construct()
    {
        $this->places = new PlaceListModel();
    }

    // /CONSTRUCTOR


    // FUNCTIONS


    public function merge( PlaceAlgorithmResultParser $result )
    {
        $this->getPlaces()->addAll( $result->getPlaces() );
    }

    /**
     * @return PlaceListModel
     */
    public function getPlaces()
    {
        return $this->places;
    }

    /**
     * @param PlaceListModel $places
     */
    public function setPlaces( $places )
    {
        $this->places = $places;
    }

    /**
     * @see ClassCore::get_()
     * @return PlaceAlgorithmResultParser
     */
    public static function get_( $get )
    {
        return $get;
    }

    // /FUNCTIONS


}

?>