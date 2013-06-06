<?php

class ImageResource extends AbstractImageResource
{

    // VARIABLES


    private static $ICON;

    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @return IconImageResource
     */
    public function icon()
    {
        self::$ICON = self::$ICON ? self::$ICON : new IconImageResource();
        return self::$ICON;
    }

    // /FUNCTIONS


}

?>