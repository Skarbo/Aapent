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

// Initiate
$api = new AapentApi( AapentApi::MODE_PROD );

// Set Debug handler
$api->setDebug( array ( AapentApi::MODE_TEST => DebugHandler::LEVEL_LOW, AapentApi::MODE_PROD => DebugHandler::LEVEL_HIGH ) );

// Mapping
$mapping = array ();
$mapping[ AapentAppMainController::$CONTROLLER_NAME ][ AbstractApi::MAP_CONTROLLER ] = AapentAppMainController::class_();
$mapping[ AapentAppMainController::$CONTROLLER_NAME ][ AbstractApi::MAP_VIEW ] = AapentAppMainView::class_();
$mapping[ "" ] = $mapping[ AapentAppMainController::$CONTROLLER_NAME ];

// Create KillHandler
class ApirestKillHandler extends ClassCore implements KillHandler
{

    private static $FIELD_ERROR = "error";
    private static $FIELD_ERROR_MESSAGE = "message";
    private static $FIELD_ERROR_EXCEPTION = "exception";
    private static $FIELD_ERROR_VALIDATIONS = "validations";

    /**
     * @see KillHandler::handle()
     */
    public function handle( Exception $exception, ErrorHandler $error_handler )
    {

        // Exception type
        switch ( get_class( $exception ) )
        {

            default :
                header( "HTTP/1.1 500 Internal Server Error" );
                break;
        }

        // Print content
        die( "Kill Handler: " . $exception->getMessage() );

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
        //         $doctype = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">\n";
        $doctype = "<!DOCTYPE HTML>\n";
        return $doctype . $output;

    }

}

// Set Kill handler
$api->setKillHandler( new ApirestKillHandler() );

// Set Output handler
$api->setOutputHandler( new MainOutputHandler() );

// Do request
$api->doRequest( $mapping );

$api->destruct();

?>