<?php

class Resource extends AbstractResource
{

    // VARIABLES


    protected static $CSS, $DB, $IMAGE, $JAVASCRIPT, $URL;

    private static $GOOGLE_API_KEY = "AIzaSyBy5yabtN3ZFIlRM8-NEghybXTCZ-UQ7Dk";

    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @return CssResource
     */
    public static function css()
    {
        self::$CSS = self::$CSS ? self::$CSS : new CssResource();
        return self::$CSS;
    }

    /**
     * @return DbResource
     */
    public static function db()
    {
        self::$DB = self::$DB ? self::$DB : new DbResource();
        return self::$DB;
    }

    /**
     * @return ImageResource
     */
    public static function image()
    {
        self::$IMAGE = self::$IMAGE ? self::$IMAGE : new ImageResource();
        return self::$IMAGE;
    }

    /**
     * @return JavascriptResource
     */
    public static function javascript()
    {
        self::$JAVASCRIPT = self::$JAVASCRIPT ? self::$JAVASCRIPT : new JavascriptResource();
        return self::$JAVASCRIPT;
    }

    /**
     * @return UrlResource
     */
    public static function url()
    {
        self::$URL = self::$URL ? self::$URL : new UrlResource();
        return self::$URL;
    }

    public static function getGoogleApiKey()
    {
        return self::$GOOGLE_API_KEY;
    }

    // /FUNCTIONS


}

?>