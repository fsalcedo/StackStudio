/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'underscore',
        'backbone',
        'views/featureNotImplementedView',
        'views/resource/resourceAppView',
        'text!templates/aws/cache/awsCacheClusterAppTemplate.html',
        '/js/aws/models/cache/awsCacheCluster.js',
        '/js/aws/collections/cache/awsCacheClusters.js',
        '/js/aws/views/cache/awsClusterCreateView.js',
        '/js/aws/views/cache/awsClusterModifyView.js',
        '/js/aws/collections/cloud_watch/awsMetricStatistics.js',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, FeatureNotImplementedView, ResourceAppView,cacheClusterAppTemplate, CacheCluster, CacheClusters, CacheClusterCreate, CacheClusterModify, MetricStatistics, emptyGraph, ich, Common, Morris, Spinner) {
    'use strict';

    var AwsClustersAppView = ResourceAppView.extend({
        
        template: _.template(cacheClusterAppTemplate),
        
        modelStringIdentifier: "id",
        
        columns: ["id", "status", "node_type", "engine", "zone", "num_nodes"],
        
        idColumnNumber: 0,
        
        model: CacheCluster,
        
        collectionType: CacheClusters,
        
        type: "cache",
        
        subtype: "clusters",
        
        CreateView: CacheClusterCreate,
        
        ModifyView: CacheClusterModify,
        
        bytesReadIntoMemcachedData: new MetricStatistics(),
        BytesUsedForCacheItemsData: new MetricStatistics(),
        BytesWrittenOutFromMemcachedData: new MetricStatistics(),
        CasBadvalData: new MetricStatistics(),
        CasHitsData: new MetricStatistics(),
        CasMissesData: new MetricStatistics(),
        CmdFlushData: new MetricStatistics(),
        CmdGetData: new MetricStatistics(),
        CmdSetData: new MetricStatistics(),
        CPUUtilizationData: new MetricStatistics(),
        CurrConnectionsData: new MetricStatistics(),
        CurrItemsData: new MetricStatistics(),
        DecrHitsData: new MetricStatistics(),
        DecrMissesData: new MetricStatistics(),
        DeleteHitsData: new MetricStatistics(),
        DeleteMissesData: new MetricStatistics(),
        EvictionsData: new MetricStatistics(),
        FreeableMemoryData: new MetricStatistics(),
        GetHitsData: new MetricStatistics(),
        GetMissesData: new MetricStatistics(),
        IncrHitsData: new MetricStatistics(),
        IncrMissesData: new MetricStatistics(),
        NetworkBytesInData: new MetricStatistics(),
        NetworkBytesOutData: new MetricStatistics(),
        NewConnectionsData: new MetricStatistics(),
        NewItemsData: new MetricStatistics(),
        ReclaimedData: new MetricStatistics(),
        SwapUsageData: new MetricStatistics(),
        UnusedMemoryData: new MetricStatistics(),
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': 'clickOne',
            'change #node_select': 'selectNode',
            'click #modnodes': 'modNodes',
            'change #node_select': 'refreshMonitors',
            'click #refresh_monitors_button': 'refreshMonitors'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            var cacheApp = this;
            Common.vent.on("cacheAppRefresh", function() {
                cacheApp.render();
            });
            
            this.bytesReadIntoMemcachedData.on( 'reset', function() {this.addMonitorGraph("#bytes_read", this.bytesReadIntoMemcachedData, ["Average"], ["Bytes Read Into Memcached"], ["#FF8000"]);}, this );
            
        },
        
        performAction: function(event) {
            var cluster = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete":
                cluster.destroy(this.credentialId, this.region);
                break;
            case "Modify Node Count":
                var ModifyView = this.ModifyView;
                if(this.region) {
                    this.newResourceDialog = new ModifyView({cred_id: this.credentialId, region: this.region, modCluster: cluster});
                }else {
                    this.newResourceDialog = new ModifyView({cred_id: this.credentialId});
                }
                this.newResourceDialog.render();
                break;
            }
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        //Monitors
        
        refreshMonitors: function() {
            $(".monitor_graph").empty();
            var rdsApp = this;
            $("#monitor_time_range").selectmenu({
                change: function() {
                    rdsApp.refreshMonitors();
                }
            });
            $("#refresh_monitors_button").button();

            var spinnerOptions = {
                lines: 13, // The number of lines to draw
                length: 7, // The length of each line
                width: 4, // The line thickness
                radius: 10, // The radius of the inner circle
                corners: 1, // Corner roundness (0..1)
                rotate: 0, // The rotation offset
                color: '#000', // #rgb or #rrggbb
                speed: 1, // Rounds per second
                trail: 60, // Afterglow percentage
                shadow: false, // Whether to render a shadow
                hwaccel: false, // Whether to use hardware acceleration
                className: 'spinner', // The CSS class to assign to the spinner
                zIndex: 2e9, // The z-index (defaults to 2000000000)
                top: 50, // Top position relative to parent in px
                left: 211 // Left position relative to parent in px
            };

            new Spinner(spinnerOptions).spin($("#bytes_read").get(0));

            var monitorTimeValue = $("#monitor_time_range").val();
            var monitorTime = JSON.parse(monitorTimeValue);

            var metricStatisticOptions = {
                cred_id: this.credentialId, 
                region: this.region,
                time_range: monitorTime.time_range, 
                namespace: "AWS/ElastiCache",
                period: monitorTime.period,
                statistic: "Average",
                dimension_name: "CacheClusterId",
                dimension_value: this.selectedId
            };
            
            metricStatisticOptions.metric_name = "BytesReadIntoMemcached";
            this.bytesReadIntoMemcachedData.fetch({ data: $.param(metricStatisticOptions), reset: true });
        },

        addMonitorGraph: function(element, collection, yKeys, labels, lineColors) {
            $(element).empty();
            var data = collection.toJSON();
            if(data.length > 0) {
                Morris.Line({
                    element: element.substr(1, element.length-1),
                    data: data,
                    xkey: 'Timestamp',
                    ykeys: yKeys,
                    labels: labels,
                    lineColors: lineColors
                });
            }else {
                $(element).html(this.emptyGraphTemplate);
            }
        },
        
        //End Monitors
        
        selectNode: function(e) {
            var cluster = this.collection.get(this.selectedId);
            
            var detailString = "";
            
            detailString += "<br><b>CacheNodeId:</b> ";
            detailString += $("#cid"+$("#node_select").val()).html();
            detailString += "<br><b>ParameterGroupStatus:</b> ";
            detailString += $("#pgs"+$("#node_select").val()).html();
            detailString += "<br><b>CacheNodeStatus:</b> ";
            detailString += $("#cns"+$("#node_select").val()).html();
            detailString += "<br><b>CacheNodeCreateTime:</b> ";
            detailString += $("#cnct"+$("#node_select").val()).html();
            detailString += "<br><b>Port:</b> ";
            detailString += $("#port"+$("#node_select").val()).html();
            detailString += "<br><b>Address:</b> ";
            detailString += $("#address"+$("#node_select").val()).html();
            
            $("#node_detail").html(detailString);
        },
        
        modNodes: function(e) {
            //alert(this.selectedId);
            var cluster = this.collection.get(this.selectedId);
            
            var ModifyView = this.ModifyView;
            if(this.region) {
                this.newResourceDialog = new ModifyView({cred_id: this.credentialId, region: this.region, modCluster: cluster});
            }else {
                this.newResourceDialog = new ModifyView({cred_id: this.credentialId});
            }
            this.newResourceDialog.render();
        }
    });
    
    return AwsClustersAppView;
});
