<?php

class QueueDbDao extends StandardDbDao implements QueueDao
{

    // VARIABLES


    // /VARIABLES


    // CONSTRUCTOR


    // /CONSTRUCTOR


    // FUNCTIONS


    // ... GET


    /**
     * @see StandardDbDao::getTable()
     */
    protected function getTable()
    {
        return Resource::db()->queue()->getTable();
    }

    /**
     * @see StandardDbDao::getPrimaryField()
     */
    protected function getPrimaryField()
    {
        return Resource::db()->queue()->getFieldId();
    }

    /**
     * @see StandardDbDao::getForeignField()
     */
    protected function getForeignField()
    {
        return Resource::db()->queue()->getFieldId();
    }

    /**
     * @see StandardDbDao::getInsertUpdateFieldsBinds()
     */
    protected function getInsertUpdateFieldsBinds( StandardModel $model, $foreignId = null, $isInsert = false )
    {

        $fields = array ();
        $binds = array ();
        $model = QueueModel::get_( $model );

        $fields[ Resource::db()->queue()->getFieldType() ] = ":type";
        $binds[ "type" ] = $model->getType();
        $fields[ Resource::db()->queue()->getFieldPriority() ] = ":priority";
        $binds[ "priority" ] = $model->getPriority();
        $fields[ Resource::db()->queue()->getFieldArguments() ] = ":arguments";
        $binds[ "arguments" ] = Core::createJson( $model->getArguments() );
        $fields[ Resource::db()->queue()->getFieldOccurence() ] = ":occurence";
        $binds[ "occurence" ] = $model->getOccurence();
        $fields[ Resource::db()->queue()->getFieldError() ] = ":error";
        $binds[ "error" ] = $model->getError();

        if ( $isInsert )
        {
            $fields[ Resource::db()->queue()->getFieldUpdated() ] = SB::$CURRENT_TIMESTAMP;
        }

        return array ( $fields, $binds );

    }

    /**
     * @see StandardDbDao::getInitiatedList()
     */
    protected function getInitiatedList()
    {
        return new QueueListModel();
    }

    /**
     * @see StandardDbDao::getSelectQuery()
     */
    public function getSelectQuery()
    {
        $selectQuery = parent::getSelectQuery();

        $selectQuery->getQuery()->setOrderBy(
                array ( array ( Resource::db()->queue()->getFieldError(), SB::$ASC ),
                        array ( Resource::db()->queue()->getFieldPriority(), SB::$DESC ),
                        array ( Resource::db()->queue()->getFieldRegistered(), SB::$ASC ),
                        array ( Resource::db()->queue()->getFieldId(), SB::$ASC ) ) );

        return $selectQuery;
    }

    // ... /GET


    // ... CREATE


    /**
     * @see StandardDbDao::createModel()
     */
    protected function createModel( array $modelArray )
    {

        $model = QueueFactoryModel::createQueue( Core::arrayAt( $modelArray, Resource::db()->queue()->getFieldType() ),
                Core::arrayAt( $modelArray, Resource::db()->queue()->getFieldPriority() ),
                Core::arrayAt( $modelArray, Resource::db()->queue()->getFieldArguments() ),
                Core::arrayAt( $modelArray, Resource::db()->queue()->getFieldOccurence() ),
                Core::arrayAt( $modelArray, Resource::db()->queue()->getFieldError() ) );

        $model->setId( intval( Core::arrayAt( $modelArray, $this->getPrimaryField() ) ) );
        $model->setUpdated(
                Core::parseTimestamp( Core::arrayAt( $modelArray, Resource::db()->queue()->getFieldUpdated() ) ) );
        $model->setRegistered(
                Core::parseTimestamp( Core::arrayAt( $modelArray, Resource::db()->queue()->getFieldRegistered() ) ) );

        return $model;

    }

    // ... /CREATE


    // /FUNCTIONS


}

?>