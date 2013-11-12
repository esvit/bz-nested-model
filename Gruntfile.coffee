path = require 'path'

# Build configurations.
module.exports = (grunt) ->
    grunt.initConfig
        uglify:
            # concat js files before minification
            js:
                src: ['src/scripts/bz-nested-model.js']
                dest: 'bz-nested-model.js'
                options:
                  sourceMap: (fileName) ->
                    fileName.replace /\.js$/, '.map'

    grunt.loadNpmTasks 'grunt-contrib-uglify'

    grunt.registerTask 'default', [
        'uglify'
    ]