<?php

class DbResource extends AbstractDbResource
{

    // VARIABLES


    private static $PLACE, $GROUPPLACE, $QUEUE, $FEATURE;

    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @return PlaceDbResource
     */
    public static function place()
    {
        self::$PLACE = self::$PLACE ? self::$PLACE : new PlaceDbResource();
        return self::$PLACE;
    }

    /**
     * @return GroupPlaceDbResource
     */
    public static function groupPlace()
    {
        self::$GROUPPLACE = self::$GROUPPLACE ? self::$GROUPPLACE : new GroupPlaceDbResource();
        return self::$GROUPPLACE;
    }

    /**
     * @return QueueDbResource
     */
    public static function queue()
    {
        self::$QUEUE = self::$QUEUE ? self::$QUEUE : new QueueDbResource();
        return self::$QUEUE;
    }

    /**
     * @return FeatureDbResource
     */
    public static function feature()
    {
        self::$FEATURE = self::$FEATURE ? self::$FEATURE : new FeatureDbResource();
        return self::$FEATURE;
    }

    // /FUNCTIONS


}

?>