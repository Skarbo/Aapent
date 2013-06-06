<?php

abstract class RestController extends AbstractRestController
{

    // VARIABLES


    /**
     * @var DaoContainer
     */
    private $daoContainer;

    // /VARIABLES


    // CONSTRUCTOR


    public function __construct( Api $api, View $view )
    {
        parent::__construct( $api, $view );

        $this->daoContainer = new DaoContainer( $this->getDbApi() );
    }

    // /CONSTRUCTOR


    // FUNCTIONS


    // ... GET


    /**
     * @return DaoContainer
     */
    public function getDaoContainer()
    {
        return $this->daoContainer;
    }

    /**
     * @see AbstractController::getLastModified()
     */
    public function getLastModified()
    {
        return max( filemtime( __FILE__ ), parent::getLastModified() );
    }

    // ... /GET


    // /FUNCTIONS


}

?>