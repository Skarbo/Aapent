<?php

class FeatureUtil extends ClassCore
{

    // VARIABLES


    const MAY_17 = "may17";
    const CHRISTMAS_1 = "christmas1";
    const CHRISTMAS_2 = "christmas2";

    private function __construct()
    {

    }

    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    public function getSpecialDay( $specialDay, $year = null )
    {
        $year = $year ? $year : intval( date( "y", time() ) );

        switch ( $specialDay )
        {
            case self::MAY_17 :
                return mktime( 0, 0, 0, 5, 17, $year );
            case self::CHRISTMAS_1 :
                return mktime( 0, 0, 0, 12, 25, $year );
            case self::CHRISTMAS_2 :
                return mktime( 0, 0, 0, 12, 26, $year );
        }

        return null;
    }

    // /FUNCTIONS


}

?>