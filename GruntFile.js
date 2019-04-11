/*********************************
/* typedfsm.js Grunt Build File
/*********************************/
var path = require('path');

/*global module:false*/
module.exports = function (grunt) {

   //
   // Project configuration
   //
   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      jasmineCmd: path.join('node_modules', '.bin', 'jasmine'),
      jasmineConfig: path.join('spec', 'support', 'jasmine.json'),
      jasmineJs: path.join('node_modules', 'jasmine', 'bin', 'jasmine.js'),

      //
      // Configure jasmine-node to run Jasmine specs
      //
      jasmine_node: {
         specNameMatcher: "Spec", // load only specs containing specNameMatcher
         projectRoot: "./spec",
         requirejs: false,
         forceExit: true,
         jUnit: {
            report: false,
            savePath: "./dist/reports/jasmine/",
            useDotNotation: true,
            consolidate: true
         }
      },

      //
      // Concatenate build files
      // Add banner to files
      //
      concat: {
         node: {
            src: ['src/typestate.ts', 'src/typestate-node-suffix.ts'],
            dest: 'src/typestate-node.ts'
         },
         main: {
            src: ['dist/<%= pkg.name %>-<%= pkg.version %>.js'],
            dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
         },
         minified: {
            src: ['dist/<%= pkg.name %>-<%= pkg.version %>.min.js'],
            dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
         },
         options: {
            separator: '\n;\n',
            banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
                    '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' +
                    ' Licensed <%= pkg.license%>*/\n'
         }
      },

      //
      // Minify files
      //
      minified: {
         files: {
            src: 'dist/<%= pkg.name %>.js',
            dest: 'dist/<%= pkg.name %>'
         },
         options: {
            sourcemap: false,
            allinone: true,
            dest_filename: '.min.js'
         }
      },

      //
      // Watch files
      //
      watch: {
         scripts: {
            files: ['src/*.ts', 'spec/TypeStateSpec.ts'],
            tasks: ['shell:specs', 'jasmine_node'],
            options: {
               interrupt: true
            }
         }
      },

      //
      // Shell Commands
      //
      shell: {

         //
         // Execute TypeScript compiler against typestate core
         //
         tsc: {
            command: 'tsc --sourcemap --lib DOM,ES5,ScriptHost,ES2015.Promise --declaration "./src/typestate.ts"',               
            options: {
               stdout: true,
               failOnError: true
            }
         },

         tscnode: {
            command: 'tsc --sourcemap --lib DOM,ES5,ScriptHost,ES2015.Promise --module commonjs --declaration "./src/typestate-node.ts" --outDir "./dist/"',               
            options: {
               stdout: true,
               failOnError: true
            }
         },

         //
         // Execute TypeScript compiler against Excalibur core
         //
         example: {
            command: 'tsc --sourcemap --lib DOM,ES5,ScriptHost,ES2015.Promise --module system --declaration "./example/example.ts"',               
            options: {
               stdout: true,
               failOnError: true
            }
         },

         //
         // Package up Nuget (Windows only)
         //
         nuget: {
            command: 'tools\\nuget pack TypeState.nuspec -version <%= pkg.version %> -OutputDirectory ./dist',
            options: {
               stdout: true,
               failOnError: false
            }
         },         

         //
         // TypeScript Compile Jasmine specs
         // TODO: Simplify this so we don't have to always update it every time we add a spec
         //
         specs: {
            command: 'tsc --lib DOM,ES5,ScriptHost,ES2015.Promise "./spec/TypeStateSpec.ts"',
            options: {
               stdout: true,
               failOnError: true
            }
         },

         //
         // Jasmine NPM command
         //
         tests: {
             command: '<%= jasmineCmd %> JASMINE_CONFIG_PATH=<%= jasmineConfig %>',
             options: {
                 stdout: true,
                 failOnError: true
             }
         }
      },

      //
      // Copy Files for dist
      //
      copy: {
         main: {
            files: [
               {src: './src/<%= pkg.name %>.js', dest: './dist/<%= pkg.name %>.js'},
               {src: './src/<%= pkg.name %>.d.ts', dest: './dist/<%= pkg.name %>.d.ts'},
               {src: './dist/<%= pkg.name %>.js', dest: './dist/<%= pkg.name %>-<%= pkg.version %>.js'},
               {src: './dist/<%= pkg.name %>.min.js', dest: './dist/<%= pkg.name %>-<%= pkg.version %>.min.js'},
               {src: './dist/<%= pkg.name %>.d.ts', dest: './dist/<%= pkg.name %>-<%= pkg.version %>.d.ts'},
               {src: './dist/<%= pkg.name %>-node.js', dest: './dist/<%= pkg.name %>-node-<%= pkg.version %>.js'},
               {src: './dist/<%= pkg.name %>-node.min.js', dest: './dist/<%= pkg.name %>-node-<%= pkg.version %>.min.js'},
               {src: './dist/<%= pkg.name %>-node.d.ts', dest: './dist/<%= pkg.name %>-node-<%= pkg.version %>.d.ts'}
            ]
         }
      },

      //
      // UglifyJS configuration
      //
      uglify: {}
   });

   //
   // Load NPM Grunt tasks as dependencies
   //
   grunt.loadNpmTasks('grunt-shell');
   grunt.loadNpmTasks('grunt-minified');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-contrib-watch');

   //
   // Register available Grunt tasks
   //

   // Run tests
   grunt.registerTask('tests', ['shell:specs', 'shell:tests']);

   // Default task - compile, test, build dists
   grunt.registerTask('default', ['shell:tsc', 'concat:node', 'shell:tscnode', 'concat', 'copy', 'shell:nuget', 'example', 'tests']);

   // Build example

   grunt.registerTask('example', ['shell:example'])

   // Travis task - for Travis CI
   grunt.registerTask('travis', 'default');

};