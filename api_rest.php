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
$api = new AapentApi( AapentApi::MODE_TEST );

// Set Debug handler
$api->setDebug(
        array ( AapentApi::MODE_TEST => DebugHandler::LEVEL_LOW, AapentApi::MODE_PROD => DebugHandler::LEVEL_HIGH ) );

// Mapping
$mapping = array ();
$mapping[ AapentRestController::$CONTROLLER_NAME ][ AapentApi::MAP_CONTROLLER ] = AapentRestController::class_();
$mapping[ AapentRestController::$CONTROLLER_NAME ][ AapentApi::MAP_VIEW ] = AapentRestView::class_();

$mapping[ "" ] = $mapping[ AapentRestController::$CONTROLLER_NAME ];

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

        // Initiate data array
        $data = array ();

        // Set exception
        $data[ self::$FIELD_ERROR ][ self::$FIELD_ERROR_MESSAGE ] = $exception->getMessage();
        $data[ self::$FIELD_ERROR ][ self::$FIELD_ERROR_EXCEPTION ] = get_class( $exception );

        // Exception type
        switch ( get_class( $exception ) )
        {
            case DbException::class_() :
                @header( "HTTP/1.1 500 Internal Server Error" );
                $data[ self::$FIELD_ERROR ][ self::$FIELD_ERROR_MESSAGE ] = "Database error";
                break;

            case BadrequestException::class_() :
                @header( "HTTP/1.1 400 Bad Request" );
                break;

            case ValidatorException::class_() :
                @header( "HTTP/1.1 406 Not Acceptable" );
                $data[ self::$FIELD_ERROR ][ self::$FIELD_ERROR_VALIDATIONS ] = ValidatorException::get_( $exception )->getValidations();
                break;

            default :
                @header( "HTTP/1.1 500 Internal Server Error" );
                break;
        }

        // Set Javascript as Content type
        @header( sprintf( "Content-type: %s;charset=%s", "application/json", "utf-8" ) );

        // Get JSON from data
        $json = AbstractRestView::getJSON( $data );

        die( $json );

    }

    /**
     * @see KillHandler::isAutoErrorLog()
     */
    public function isAutoErrorLog(Exception $exception)
    {
        return true;
    }

}

// Create OutputHandler
class ApirestOutputHandler extends OutputHandler
{

    /**
     * @see OutputHandler::handle()
     */
    public function handle( AbstractXhtml $output )
    {

        if ( $output == null )
        {
            return "";
        }

        return $output->get_content();

    }

}

// Set Kill handler
$api->setKillHandler( new ApirestKillHandler() );

// Set Output handler
$api->setOutputHandler( new ApirestOutputHandler() );

// Do request
$api->doRequest(  $mapping );

// Destruct
$api->destruct();

?>