<?php

class CssResource extends AbstractCssResource
{

    // VARIABLES


    private static $CSS_ROOT = "css";

    private $cssFile = "stylesheet.css.php";

    // /VARIABLES


    // CONSTRUCTOR


    public function __construct()
    {
        $this->cssFile = sprintf( "%s/%s", self::$CSS_ROOT, $this->cssFile );
    }

    // /CONSTRUCTOR


    // FUNCTIONS


    public function getCssFile()
    {
        return $this->cssFile;
    }

    // /FUNCTIONS


}

?>