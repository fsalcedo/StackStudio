/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'underscore'
], function( _ ) {
    'use strict';

    // Core functionality for Cloud Interpreter
    // ----------------------------------------

    /**
     * Creates a base interpreter which serves as a base for any cloud compute dialect.
     *
     * @name BaseInterpreter
     * @constructor
     * @category Interpreter
     * @param {Object} initialization options.
     * @returns {Object} Returns a BaseInterpreter instance.
     */
    var BaseInterpreter = function(options) {
        this.options = options || {};
        this.tag = "base";
        this.welcome = "Base Interpreter";
    };

    /**
     * Low level method invoke a command on the cloud.
     *
     * @static
     * @memberOf BaseInterpreter
     * @category Internal
     * @param {String} the command line string to invoke.
     * @param {Object} (optional) the initiating terminal that provided the command.
     * @returns {Object} An object with a message and type.
     * @example
     *
     * interpreter.execute("cloud-run-instances param param", term);
     * // => {'message': "Created instance", 'type': "success"};
     */
    BaseInterpreter.prototype.exec = function(command_line, term) {
        var self = this;
        var result;
        var command = command_line;
        if (command.indexOf(' ') > 0) {
            command = command.slice(0, command.indexOf(' '));
        }
        // hyphens are not legal in JS, but may be in command, so check both
        [command, command.replace(/-/g, '_')].map(function(cmd) {
            if (typeof self[cmd] === "function") {
                result = self[cmd](command_line);
            }
        });
        if (result === undefined) {
            result = {
                    message: "Unsupported operation.",
                    type: "error"
            };
        }
        return result;
        //return {type: 'success', message: 'Ok.'};
    };

    BaseInterpreter.prototype.run_instances = function() {
        var result = {type: 'success'};
        // TODO: call backend
        result.message = "Started 1 instance.";
        return result;
    };

    BaseInterpreter.prototype.describe_instances = function() {
        var result = {type: 'success'};
        // TODO: call backend
        result.message = "Displaying cloud instances.";
        return result;
    };

    return BaseInterpreter;
});
