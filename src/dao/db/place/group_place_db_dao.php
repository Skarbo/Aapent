<?php

class GroupPlaceDbDao extends StandardDbDao implements GroupPlaceDao
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
        return Resource::db()->groupPlace()->getTable();
    }

    /**
     * @see StandardDbDao::getPrimaryField()
     */
    protected function getPrimaryField()
    {
        return Resource::db()->groupPlace()->getFieldPlaceGroupId();
    }

    /**
     * @see StandardDbDao::getForeignField()
     */
    protected function getForeignField()
    {
        return Resource::db()->groupPlace()->getFieldPlaceGroupId();
    }

    /**
     * @see StandardDbDao::getInsertUpdateFieldsBinds()
     */
    protected function getInsertUpdateFieldsBinds( StandardModel $model, $foreignId = null, $isInsert = false )
    {

        $fields = array ();
        $binds = array ();
        $model = GroupPlaceModel::get_( $model );

        $fields[ Resource::db()->groupPlace()->getFieldPlaceGroupName() ] = ":placeGroupName";
        $binds[ "placeGroupName" ] = $model->getPlaceGroupName();
        $fields[ Resource::db()->groupPlace()->getFieldPlaceGroupInfo() ] = ":placeGroupInfo";
        $binds[ "placeGroupInfo" ] = Core::createJson( $model->getPlaceGroupInfo() );
        $fields[ Resource::db()->groupPlace()->getFieldPlaceGroupType() ] = ":placeGroupType";
        $binds[ "placeGroupType" ] = $model->getPlaceGroupType();
        $fields[ Resource::db()->groupPlace()->getFieldPlaceGroupUrls() ] = ":placeGroupUrls";
        $binds[ "placeGroupUrls" ] =  Core::createJson( $model->getPlaceGroupUrls() );

        if ( !$isInsert )
            $fields[ Resource::db()->groupPlace()->getFieldPlaceGroupUpdated() ] = SB::$CURRENT_TIMESTAMP;

        return array ( $fields, $binds );

    }

    /**
     * @see StandardDbDao::getInitiatedList()
     */
    protected function getInitiatedList()
    {
        return new GroupPlaceListModel();
    }

    // ... /GET


    // ... CREATE


    /**
     * @see StandardDbDao::createModel()
     */
    protected function createModel( array $modelArray )
    {

        $model = GroupPlaceFactoryModel::createGroupPlace(
                Core::arrayAt( $modelArray, Resource::db()->groupPlace()->getFieldPlaceGroupName() ),
                Core::arrayAt( $modelArray, Resource::db()->groupPlace()->getFieldPlaceGroupType() ),
                Core::arrayAt( $modelArray, Resource::db()->groupPlace()->getFieldPlaceGroupInfo() ),
                Core::arrayAt( $modelArray, Resource::db()->groupPlace()->getFieldPlaceGroupUrls() ) );

        $model->setId( intval( Core::arrayAt( $modelArray, $this->getPrimaryField() ) ) );
        $model->setPlaceGroupUpdated( Core::parseTimestamp( Core::arrayAt( $modelArray, Resource::db()->groupPlace()->getFieldPlaceGroupUpdated() ) ) );
        $model->setPlaceGroupRegistered( Core::parseTimestamp( Core::arrayAt( $modelArray, Resource::db()->groupPlace()->getFieldPlaceGroupRegistered() ) ) );

        return $model;

    }

    // ... /CREATE


    // /FUNCTIONS


}

?>