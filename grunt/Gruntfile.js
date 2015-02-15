/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/**\n'+
    		'  * <%= pkg.title %> - <%= pkg.description %>\n' +
    		'  * ver. <%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n' +
            '  * git: <%= pkg.gitUrl %>\n' +
            '  *\n' +
	        '  * (c) 2014-<%= grunt.template.today("yyyy") %> <%= pkg.author.company %>\n' +
      		'  * Licensed <%= pkg.license %> <%= grunt.template.today("yyyy") %> <%= pkg.author.company %> (<%= pkg.author.url %>)\n' +
      		'  **/\n',
    // Task configuration.
    clean :{
    	dist : { 
    		options : {
    			force : true
    		},
    		src : [ "<%= pkg.distDir %>" ],
    	}
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        mangle: false,
        compress: true,
        sourceMap : true,
        sourceMapIncludeSources : true
      },
      dist: {
          src: ['<%= pkg.srcDir %>/region.js',
              '<%= pkg.srcDir %>/window-resize-listener.js',
              '<%= pkg.srcDir %>/cell-size-calculator.js',
              '<%= pkg.srcDir %>/layout-manager.js',
              '<%= pkg.srcDir %>/fill-jquery-plugin.js',
              '<%= pkg.srcDir %>/fill.js'],
          dest: '<%= pkg.distDir %><%= pkg.name %>.min.js'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Tasks.
  grunt.registerTask('default', ['clean', 'uglify']);
};
