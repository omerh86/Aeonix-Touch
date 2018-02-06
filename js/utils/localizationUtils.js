var localizationUtils = ( function () {

     var srv = {};

     srv.en_US = {
        languageName: "English",
        localeName: "en-US"
     };

     srv.he_IL = {
        languageName: "עברית",
        localeName: "he-IL"
     };

     srv.zh_CH = {
        languageName: "中国",
        localeName: "zh-CH"
     }

     srv.ru_RU = {
        languageName: "Русский",
        localeName: "ru-RU"
     };

     srv.es_SP = {
        languageName: "Español",
        localeName: "es-SP"
     };

     srv.pt_PT = {
        languageName: "Português",
        localeName: "pt-PT"
     };

    var locales = [
        srv.en_US,
        srv.he_IL,
        srv.zh_CH,
        srv.ru_RU,
        srv.es_SP,
        srv.pt_PT
    ];
        
    srv.getLocales = function() {
        return locales;
    }

    srv.getLocaleByName = function(name) {
        var locale;
        for (var i=0;i<locales.length;i++) {
            if (locales[i].localeName ==name) {
                locale = locales[i];
                break;
            }
        }
        return locale;
    }

    srv.getLocaleByLanguage = function(languageName) {
        var locale;
        for (var i=0;i<locales.length;i++) {
            if (locales[i].languageName==languageName) {
                locale = locales[i];
                break;
            }
        }
        return locale;
    }

    return srv;
}())

