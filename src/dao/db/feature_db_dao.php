<?php

class FeatureDbDao extends StandardDbDao implements FeatureDao
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
        return Resource::db()->feature()->getTable();
    }

    /**
     * @see StandardDbDao::getPrimaryField()
     */
    protected function getPrimaryField()
    {
        return Resource::db()->feature()->getFieldType();
    }

    /**
     * @see StandardDbDao::getForeignField()
     */
    protected function getForeignField()
    {
        return Resource::db()->feature()->getFieldType();
    }

    /**
     * @see StandardDbDao::getInsertUpdateFieldsBinds()
     */
    protected function getInsertUpdateFieldsBinds( StandardModel $model, $foreignId = null, $isInsert = false )
    {

        $fields = array ();
        $binds = array ();
        $model = FeatureModel::get_( $model );

        $fields[ Resource::db()->feature()->getFieldType() ] = ":type";
        $binds[ "type" ] = $model->getType();
        $fields[ Resource::db()->feature()->getFieldValue() ] = ":value";
        $binds[ "value" ] = $model->getValue();

        if ( $isInsert )
            $fields[ Resource::db()->feature()->getFieldUpdated() ] = SB::$CURRENT_TIMESTAMP;

        return array ( $fields, $binds );

    }

    /**
     * @see StandardDbDao::getInitiatedList()
     */
    protected function getInitiatedList()
    {
        return new FeatureListModel();
    }

    // ... /GET


    // ... CREATE


    /**
     * @see StandardDbDao::createModel()
     */
    protected function createModel( array $modelArray )
    {

        $model = FeatureFactoryModel::createFeature(
                Core::arrayAt( $modelArray, Resource::db()->feature()->getFieldType() ),
                Core::arrayAt( $modelArray, Resource::db()->feature()->getFieldValue() ) );

//         $model->setId( intval( Core::arrayAt( $modelArray, $this->getPrimaryField() ) ) );
        $model->setUpdated(
                Core::parseTimestamp( Core::arrayAt( $modelArray, Resource::db()->feature()->getFieldUpdated() ) ) );
        $model->setRegistered(
                Core::parseTimestamp( Core::arrayAt( $modelArray, Resource::db()->feature()->getFieldRegistered() ) ) );

        return $model;

    }

    // ... /CREATE


    // /FUNCTIONS


}

?>