<?php

abstract class PlaceWebsiteAlgorithmParser extends WebsiteAlgorithmParser
{

    // VARIABLES


    const PARSE_TYPE_GROUP_PLACE = "group_place";
    const PARSE_TYPE_PLACE = "place";

    private $parseType;
    protected $place;

    // /VARIABLES


    // CONSTRUCTOR


    public function __construct( $parseType = self::PARSE_TYPE_GROUP_PLACE )
    {
        $this->parseType = $parseType;
    }

    // /CONSTRUCTOR


    // FUNCTIONS


    public function setPlace( PlaceModel $place )
    {
        $this->place = $place;
    }

    public function isAddSinglePlaceToQueue()
    {
        return false;
    }

    public function getSinglePlaceUrl( PlaceModel $place, $url )
    {

    }

    /**
     * @see WebsiteAlgorithmParser::parseHtmlDom()
     */
    public function parseHtmlDom( simple_html_dom $html )
    {
        throw new ParserException( "Parse HTML DOM Not implemented" );
    }

    public abstract function parseGroupPlace( $html );

    public function parsePlace( $html )
    {
        throw new ParserException( "Parse Place not implemented" );
    }

    /**
     * @see WebsiteAlgorithmParser::parseHtmlRaw()
     */
    public function parseHtmlRaw( $html )
    {
        $result = null;
        switch ( $this->parseType )
        {
            case self::PARSE_TYPE_PLACE :
                $result = $this->parsePlace( $html );
                break;

            default :
                $result = $this->parseGroupPlace( $html );
                break;
        }
        return $result;
    }

    // /FUNCTIONS


}

?>