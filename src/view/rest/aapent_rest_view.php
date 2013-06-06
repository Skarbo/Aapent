<?php

class AapentRestView extends AbstractRestView
{

    // VARIABLES


    public static $FIELD_PLACES = "places";
    public static $FIELD_GROUP_PLACES = "groups";
    public static $FIELD_FEATURES = "features";
    private static $FIELD_INFO = "info";
    private static $FIELD_INFO_PLACES = "places";
    private static $FIELD_INFO_SEARCH = "search";
    private static $FIELD_INFO_RADIUS = "radius";
    private static $FIELD_INFO_LASTMODIFIED = "lastmodifed";

    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    // ... GET


    /**
     * @see AbstractView::getController()
     * @return AapentRestController
     */
    public function getController()
    {
        return parent::getController();
    }

    /**
     * @see AbstractView::getLastModified()
     */
    protected function getLastModified()
    {
        return max( $this->getController()->getLastModified(), parent::getLastModified(), filemtime( __FILE__ ) );
    }

    // ... /GET


    /**
     * @see AbstractView::isNoCache()
     */
    protected function isNoCache()
    {
        return $this->getController()->getActionUri() == AapentRestController::ACTION_PLACES;
    }

    /**
     * @see AbstractRestView::getData()
     */
    public function getData()
    {
        $data = array ();

        // Places
        if ( $this->getController()->getActionUri() == AapentRestController::ACTION_PLACES )
        {
            $data[ self::$FIELD_PLACES ] = $this->getController()->getPlaces() ? $this->getController()->getPlaces()->getJson() : array ();
            $data[ self::$FIELD_INFO ][ self::$FIELD_INFO_PLACES ] = $this->getController()->getPlaces()->size();
            if ( $this->getController()->getSearchUri() )
                $data[ self::$FIELD_INFO ][ self::$FIELD_INFO_SEARCH ] = $this->getController()->getSearchUri();
            if ( $this->getController()->getRadiusQuery() )
                $data[ self::$FIELD_INFO ][ self::$FIELD_INFO_RADIUS ] = $this->getController()->getRadiusQuery();
        }
        else
        {
            $data[ self::$FIELD_FEATURES ] = $this->getController()->getGroupPlaces() ? $this->getController()->getFeatures()->getJson() : array ();
            $data[ self::$FIELD_GROUP_PLACES ] = $this->getController()->getGroupPlaces() ? $this->getController()->getGroupPlaces()->getJson() : array ();
        }

        $data[ self::$FIELD_INFO ][ self::$FIELD_INFO_LASTMODIFIED ] = gmdate( 'D, d M Y H:i:s \G\M\T',
                $this->getLastModified() );

        return $data;
    }

    // /FUNCTIONS


}

?>