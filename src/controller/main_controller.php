<?php

abstract class MainController extends AbstractMainController
{

    // VARIABLES


    // ... DAO


    /**
     * @var DaoContainer
     */
    private $daoContainer;

    // ... /DAO


    // /VARIABLES


    // CONSTRUCTOR


    public function __construct( Api $api, View $view )
    {
        parent::__construct( $api, $view );

        $this->daoContainer = new DaoContainer( $this->getDbApi() );
    }

    // /CONSTRUCTOR


    // FUNCTIONS


    // ... GETTERS/SETTERS


    /**
     * @return DaoContainer
     */
    protected function getDaoContainer()
    {
        return $this->daoContainer;
    }

    // ... /GETTERS/SETTERS


    // ... GET


    /**
     * @see AbstractController::getLastModified()
     */
    public function getLastModified()
    {
        return max( filemtime( __FILE__ ), parent::getLastModified() );
    }

    /**
     * @see AbstractMainController::getTitle()
     */
    protected function getTitle()
    {
        return "Åpent";
    }

    // ... /GET


    protected function addJavascriptMap()
    {

        $code = <<<EOD
$(document).ready(function() {
	var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "%s";
    document.body.appendChild(script);
} );

function initMap()
{
    eventHandler.handle(new MapinitEvent());

    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "%s";
    document.body.appendChild(script);
}
EOD;

        $this->addJavascriptCode(
                sprintf( $code,
                        Resource::javascript()->getGoogleMapsApiUrl( Resource::getGoogleApiKey(), "initMap",
                                "geometry,places", "true", "NO" ), Resource::javascript()->getGoogleMapsMarkerlabel() ) );

    }

    // /FUNCTIONS


}

?>