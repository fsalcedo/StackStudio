/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'backbone',
        '/js/google/models/compute/googleImage.js',
        'common'
], function( $, Backbone, Image, Common ) {
    'use strict';

    var ImageList = Backbone.Collection.extend({

        model: Image,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/google/compute/images'
        
    });
    
    return ImageList;

});
