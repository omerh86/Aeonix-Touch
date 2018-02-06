/**
 * Created by Eyal on 05/03/2015.
 */
var providersModule = angular.module('aeonixApp.providers');


providersModule.provider('usersProvider',[
    function usersProvider() {

        this.$get = function usersFactory() {
            return [{
                name: 'Action1',
                company: 'Service Name',
                status_color: 'green',
                img: "img/temp_users/_user-big.png",
                sipUri:'sip:action1@iptel.org',
                telephone: '050-123456'
            }, {
                name: 'Action2',
                company: 'Shell Corporation',
                status_color: "red",
                img: "img/temp_users/_user-big2.png",
                sipUri:'sip:action2@iptel.org',
                telephone: '051-334455'
            }, {
                name: 'Bob Garza',
                company: 'Gazprom',
                status_color: "blue",
                img: "img/temp_users/user-placeholder.png",
                sipUri:'sip:action1@iptel.org',
                telephone: '052-112233'
            }, {
                name: 'Olivia Foster',
                company: 'Rosneft corp.',
                status_color: "red",
                img: "img/temp_users/_user-big.png",
                sipUri:'sip:action1@iptel.org',
                telephone: '051-334455'
            }, {
                name: 'Linda Richardson',
                company: 'Lukoil',
                status_color: "red",
                img: "img/temp_users/_user-big2.png",
                sipUri:'sip:action1@iptel.org',
                telephone: '051-334455'
            }
            ];

        };
    }]);