<?php

class QueueFactoryModel extends ClassCore
{

    // VARIABLES


    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    /**
     * @return QueueModel
     */
    public static function createQueue( $type, $priority, $arguments = array(), $occurence = 1, $error = 0 )
    {

        // Initiate model
        $queue = new QueueModel();

        $queue->setType( $type );
        $queue->setPriority( intval( $priority ) );
        $queue->setArguments( Core::createJsonArray( $arguments ) );
        $queue->setOccurence( intval( $occurence ) );
        $queue->setError( intval( $error ) );

        // Return model
        return $queue;

    }

    // /FUNCTIONS


}

?>