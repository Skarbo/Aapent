<?php

class AapentRestController extends RestController
{

    // VARIABLES


    public static $CONTROLLER_NAME = "aapent";
    private static $SPLITTER_LOCATION = "_";

    CONST URI_ACTION = 1;
    const URI_LOCATION_LAT = 2;
    const URI_LOCATION_LONG = 3;
    const URI_SEARCH = 4;

    const QUERY_RADIUS = "radius";
    const ACTION_PLACES = "places";

    /**
     * @var PlaceListModel
     */
    private $places;
    /**
     * @var GroupPlaceListModel
     */
    private $groupPlaces;
    /**
     * @var FeatureListModel
     */
    private $features;

    // /VARIABLES


    // CONSTRUCTOR


    public function __construct( Api $api, View $view )
    {
        parent::__construct( $api, $view );

        $this->places = new PlaceListModel();
        $this->groupPlaces = new GroupPlaceListModel();
        $this->features = new FeatureListModel();
    }

    // /CONSTRUCTOR


    // FUNCTIONS


    public function getActionUri()
    {
        return self::getURI( self::URI_ACTION );
    }

    /**
     * @return double
     */
    public function getLocationLatUri()
    {
        return doubleval( str_replace( self::$SPLITTER_LOCATION, ".", self::getURI( self::URI_LOCATION_LAT ) ) );
    }

    /**
     * @return double
     */
    public function getLocationLongUri()
    {
        return doubleval( str_replace( self::$SPLITTER_LOCATION, ".", self::getURI( self::URI_LOCATION_LONG ) ) );
    }

    /**
     * @return String
     */
    public function getSearchUri()
    {
        return self::getURI( self::URI_SEARCH );
    }

    /**
     * @return Number Meters
     */
    public function getRadiusQuery()
    {
        return intval( Core::arrayAt( self::getQuery(), self::QUERY_RADIUS ) );
    }

    /**
     * @see RestController::getLastModified()
     */
    public function getLastModified()
    {
        return max( filemtime( __FILE__ ), parent::getLastModified(), $this->places->getLastModified(),
                $this->groupPlaces->getLastModified() );
    }

    /**
     * @return PlaceListModel
     */
    public function getPlaces()
    {
        return $this->places;
    }

    /**
     * @return GroupPlaceListModel
     */
    public function getGroupPlaces()
    {
        return $this->groupPlaces;
    }

    /**
     * @return FeatureListModel
     */
    public function getFeatures()
    {
        return $this->features;
    }

    public function request()
    {

        // Places
        if ( self::getActionUri() == self::ACTION_PLACES )
        {

            $locationLat = $this->getLocationLatUri();
            $locationLong = $this->getLocationLongUri();
            $search = $this->getSearchUri();
            $radius = $this->getRadiusQuery() / 1000;

            if ( !$locationLat || !$locationLong )
                throw new BadrequestException( "Location is not given" );

                // Search
            if ( !empty( $search ) )
            {
                $searchString = sprintf( "%%%s%%", preg_replace( "/[^\\w]/", "%", $search ) );
                $this->places = $this->getDaoContainer()->getPlaceDao()->searchLocation( $searchString, $locationLat,
                        $locationLong, $radius );
            }
            // Places nearby
            else
            {
                $this->places = $this->getDaoContainer()->getPlaceDao()->getLocation( $locationLat, $locationLong );
            }

        }
        else
        {
            $this->features = $this->getDaoContainer()->getFeatureDao()->getAll();
            $this->groupPlaces = $this->getDaoContainer()->getGroupPlaceDao()->getAll();
        }

    }

    // /FUNCTIONS


}