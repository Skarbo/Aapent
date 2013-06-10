<?php

include_once '../../krisskarboapi/javascript/javascript.js.php';

// Javascript files
$restrict = array ( "ignore" => array ( "files" => array ( '\.php$', '\.DS_Store$' ), "folders" => array( 'api' ) ) );
$JAVASCRIPT_FILES = array_merge( $JAVASCRIPT_FILES, Core::getDirectory( ".", $restrict ) );

// Javascript generate
FileUtil::generateFiles( $JAVASCRIPT_FILES, __FILE__, FileUtil::TYPE_JAVASCRIPT, Core::arrayAt( $_GET, "mode" ) == 1 );

?>