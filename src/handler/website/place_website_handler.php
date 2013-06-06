<?php

class PlaceWebsiteHandler extends Handler
{

    // VARIABLES


    /* Number of Place Websites to parse at a time */
    private static $PLACES_PARSE_COUNT = 10;

    /**
     * @var DaoContainer
     */
    private $daoContainer;
    /**
     * @var WebsiteParser()
     */
    private $websiteParser;
    /**
     * @var QueueHandler
     */
    private $queueHandler;

    // /VARIABLES


    // CONSTRUCTOR


    public function __construct( DaoContainer $daoContainer )
    {
        $this->daoContainer = $daoContainer;
        $this->websiteParser = new WebsiteParser();
        $this->queueHandler = new QueueHandler( $daoContainer );
    }

    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @return DaoContainer
     */
    public function getDaoContainer()
    {
        return $this->daoContainer;
    }

    /**
     * @return WebsiteParser
     */
    public function getWebsiteParser()
    {
        return $this->websiteParser;
    }

    /**
     * @param GroupPlaceModel $groupPlace
     * @throws HandlerException
     * @return PlaceAlgorithmResultParser
     */
    public function handleGroup( GroupPlaceModel $groupPlace )
    {
        $algorithm = $this->getAlgorithm( $groupPlace->getPlaceGroupType() );

        if ( !$algorithm )
            throw new HandlerException(
                    sprintf( "Algorithm for type \"%s\" not given", $groupPlace->getPlaceGroupType() ),
                    HandlerException::ALGORITHM_NOT_GIVEN );

        $urlObject = Core::arrayAt( $groupPlace->getPlaceGroupUrls(), GroupPlaceModel::$URL_TYPE_GROUP );
        if ( !$urlObject )
            throw new HandlerException(
                    sprintf( "URL Group does not exist for Group Place \"%d\"", $groupPlace->getId() ) );

        $url = Core::arrayAt( $urlObject, GroupPlaceModel::$URL_URL );
        if ( !$url )
            throw new HandlerException( sprintf( "URL not given for id \"%d\"", $groupPlace->getId() ) );

            // Parse
        $method = Core::arrayAt( $urlObject, GroupPlaceModel::$URL_METHOD );
        $post = Core::arrayAt( $urlObject, GroupPlaceModel::$URL_POST, array () );
        $result = PlaceAlgorithmResultParser::get_(
                $this->getWebsiteParser()->parse( $url, $algorithm,
                        $method == GroupPlaceModel::$URL_METHOD_POST ? $post : null ) );

        if ( !$result )
            throw new HandlerException( sprintf( "Result is null for Group Place \"%d\"", $groupPlace->getId() ) );

            // Add Places
        $this->getDaoContainer()->getPlaceDao()->removeForeign( $groupPlace->getId() );
        for ( $result->getPlaces()->rewind(); $result->getPlaces()->valid(); $result->getPlaces()->next() )
        {
            $place = $result->getPlaces()->current();
            $place->setId( $this->getDaoContainer()->getPlaceDao()->add( $place, $groupPlace->getId() ) );
        }

        // Queue
        if ( $algorithm->isAddSinglePlaceToQueue() )
        {
            $queue = QueueFactoryModel::createQueue( QueueModel::TYPE_PLACE, QueueModel::PRIORITY_LOW,
                    array ( QueueModel::$ARGUMENT_PLACE => $result->getPlaces()->getIds(),
                            QueueModel::$ARGUMENT_GROUP_PLACE => $groupPlace->getId() ) );
            $this->queueHandler->addQueue( $queue );
        }

        return $result;
    }

    /**
     * @param GroupPlaceModel $groupPlace
     * @param array $placeIds
     * @throws HandlerException
     * @return PlaceAlgorithmResultParser
     */
    public function handlePlaces( GroupPlaceModel $groupPlace, array $placeIds )
    {
        $algorithm = $this->getAlgorithm( $groupPlace->getPlaceGroupType(),
                PlaceWebsiteAlgorithmParser::PARSE_TYPE_PLACE );

        if ( !$algorithm )
            throw new HandlerException(
                    sprintf( "Algorithm for type \"%s\" not given", $groupPlace->getPlaceGroupType() ),
                    HandlerException::ALGORITHM_NOT_GIVEN );

        $urlObject = Core::arrayAt( $groupPlace->getPlaceGroupUrls(), GroupPlaceModel::$URL_TYPE_PLACE );
        if ( !$urlObject )
            throw new HandlerException(
                    sprintf( "URL Place does not exist for Group Place \"%d\"", $groupPlace->getId() ) );

        $url = Core::arrayAt( $urlObject, GroupPlaceModel::$URL_URL );
        if ( !$url )
            throw new HandlerException( sprintf( "URL not given for id \"%d\"", $groupPlace->getId() ) );

            // Parse Places
        $result = new PlaceAlgorithmResultParser();
        $count = 0;
        for ( $i = 0; $count < self::$PLACES_PARSE_COUNT && $i < count( $placeIds ); $i++ )
        {
            $placeId = Core::arrayAt( $placeIds, $i );
            $place = $this->getDaoContainer()->getPlaceDao()->get( $placeId );

            if ( !$place )
                continue;
                //throw new HandlerException( sprintf( "Place does not exist (%d)", $placeId ) );


            $algorithm->setPlace( $place );

            $placeUrl = $algorithm->getSinglePlaceUrl( $place, $url );

            if ( !$placeUrl )
                throw new HandlerException(
                        sprintf( "Place Algorithm din't create single Place url for Group Place \"%s\"",
                                $groupPlace->getPlaceGroupType() ) );

            $result->merge(
                    PlaceAlgorithmResultParser::get_( $this->getWebsiteParser()->parse( $placeUrl, $algorithm ) ) );
            $count++;
        }

        // Save Places
        for ( $result->getPlaces()->rewind(); $result->getPlaces()->valid(); $result->getPlaces()->next() )
        {
            $place = $result->getPlaces()->current();
            $this->getDaoContainer()->getPlaceDao()->edit( $place->getId(), $place, $groupPlace->getId() );
        }

        return $result;
    }

    /**
     * @param String $groupPlaceType
     * @param String $parseAlgorithmType
     * @return PlaceWebsiteAlgorithmParser|NULL
     */
    private function getAlgorithm( $groupPlaceType, $parseAlgorithmType = null )
    {
        switch ( $groupPlaceType )
        {
            case GroupPlaceModel::$TYPE_RIMI :
                return new RimiPlaceWebsiteAlgorithmParser( $parseAlgorithmType );
            case GroupPlaceModel::$TYPE_KIWI :
                return new KiwiPlaceWebsiteAlgorithmParser( $parseAlgorithmType );
            case GroupPlaceModel::$TYPE_MENY :
                return new MenyNgPlaceWebsiteAlgorithmParser( $parseAlgorithmType );
            case GroupPlaceModel::$TYPE_JOKER :
                return new JokerNgPlaceWebsiteAlgorithmParser( $parseAlgorithmType );
            case GroupPlaceModel::$TYPE_SPAR :
                return new SparNgPlaceWebsiteAlgorithmParser( $parseAlgorithmType );
            case GroupPlaceModel::$TYPE_BUNNPRIS :
                return new BunnprisPlaceWebsiteAlgorithmParser( $parseAlgorithmType );
            case GroupPlaceModel::$TYPE_REMA :
                return new RemaPlaceWebsiteAlgorithmParser( $parseAlgorithmType );
        }
        return null;
    }

    // /FUNCTIONS


}

?>