module.exports = function(config) {
    config.set({

        basePath: '../../../app',

        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular/angular-route.js',
            'bower_components/angular/angular-mocks.js',
            'js/playground/app.js',
            'js/playground/loggingSrv.js',
            'js/playground/nativeSrv.js',
            'js/playground/sipProxyService.js',
            'js/playground/sipProxyService.spec.js'
        ],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['Chrome'],

        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
        ],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
