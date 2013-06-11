<?php

include_once '../krisskarboapi/src/util/initialize_util.php';
include_once '../krisskarboapi/src/api/api/abstract_api.php';

function __autoload( $class_name )
{
    try
    {
        $class_path = InitializeUtil::getClassPathFile( $class_name, dirname( __FILE__ ) );
        require_once ( $class_path );
    }
    catch ( Exception $e )
    {
        throw $e;
    }
}

// Initiate AapentApi
$api = new AapentApi( $_SERVER[ "SERVER_PORT" ] == AapentApi::LOCALHOST_PORT ? AapentApi::MODE_TEST : AapentApi::MODE_PROD );

// Set Debug handler
$api->setDebug( array ( AapentApi::MODE_DEV => DebugHandler::LEVEL_LOW, AapentApi::MODE_PROD => DebugHandler::LEVEL_HIGH ) );

// Mapping
$mapping = array ();
$mapping[ AapentCmsMainController::$CONTROLLER_NAME ][ AapentApi::MAP_CONTROLLER ] = AapentCmsMainController::class_();
$mapping[ AapentCmsMainController::$CONTROLLER_NAME ][ AapentApi::MAP_VIEW ] = AapentCmsMainView::class_();
$mapping[ "" ] = $mapping[ AapentCmsMainController::$CONTROLLER_NAME ];

// Create KillHandler
class MainKillHandler extends ClassCore implements KillHandler
{

    /**
     * @see KillHandler::handle()
     */
    public function handle( Exception $exception, ErrorHandler $error_handler )
    {
        // Exception type
        switch ( get_class( $exception ) )
        {
            case DbException::class_() :
                header( "HTTP/1.1 500 Internal Server Error" );
                break;

            default :
                header( "HTTP/1.1 500 Internal Server Error" );
                break;
        }

        die( "KillHandler: " . $exception->getMessage() );
    }

    /**
     * @see KillHandler::isAutoErrorLog()
     */
    public function isAutoErrorLog( Exception $exception )
    {
        return true;
    }

}

// Create OutputHandler
class MainOutputHandler extends OutputHandler
{

    /**
     * @see OutputHandler::handle()
     */
    public function handle( AbstractXhtml $output )
    {
        @header( "Content-Type: text/html; charset= UTF-8" );
        $doctype = "<!DOCTYPE HTML>\n";

        return "" . $doctype . $output;
    }

}

// Set Kill handler
$api->setKillHandler( new MainKillHandler() );

// Set Output handler
$api->setOutputHandler( new MainOutputHandler() );

// Do request
$api->doRequest( $mapping );

$api->destruct();

?>