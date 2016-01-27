'use strict';

// Configuring the Records module
angular.module('records').run(['Menus',
  function (Menus) {
    // Add the records dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Results',
      state: 'records.list'
    });




  }
]);
