/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
var URL_ARGS = 'cb=' + Math.random();

require(['./common'], function (common) {
    require([
             'views/projectNavigationSidebarView',
             'views/projectNavigationView',
             'views/resourceNavigationView',
             'views/instanceAppView'
            ], function() {
    });	
});
