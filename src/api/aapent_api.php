<?php

class AapentApi extends AbstractApi
{

    // VARIABLES


    /**
     * @var LogHandler
     */
    private $logHandler;

    private static $DB_CONFIG_LOCAL = array (
            //self::MODE_DEV => array ( "localhost", "campusguide_dev", "root", "" ),
            self::MODE_TEST => array ( "localhost", "aapent_test", "root", "" )
            //self::MODE_PROD => array ( "localhost", "campusguide_prod", "root", "" )
             );

    // /VARIABLES


    // CONSTRUCTOR



    // /CONSTRUCTOR


    // FUNCTIONS


//     /**
//      * @see AbstractApi::getLocale()
//      * @return DefaultLocale
//      */
//     public function getLocale()
//     {
//         return parent::getLocale();
//     }

    /**
     * @see AbstractApi::getDatabaseLocalConfig()
     */
    protected function getDatabaseLocalConfig()
    {
        return self::$DB_CONFIG_LOCAL;
    }

    /**
     * @see AbstractApi::getDatabasePublicConfig()
     */
    protected function getDatabasePublicConfig()
    {
        return self::$DB_CONFIG_LOCAL;
    }

    /**
     * @see AbstractApi::getDbbackupHandler()
     */
    protected function getDbbackupHandler()
    {

        // Get database config
        $databaseConfig = $this->getDatabaseConfig();

        list ( $dbHost, , $dbUser, $dbPassword ) = Core::arrayAt( $databaseConfig, self::MODE_TEST );

        // Get databases
        $databases = array_map(
                function ( $var )
                {
                    return Core::arrayAt( $var, 1 );
                }, $databaseConfig );

        // Return Dbbackup Handler
        return new DbbackupHandler( $dbHost, $dbUser, $dbPassword, $databases, realpath( "." ) );

    }

    // /FUNCTIONS



}

?>