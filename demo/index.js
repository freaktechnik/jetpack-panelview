var { PanelView } = require("jetpack-panelview");
var buttons = require('sdk/ui/button/action');

var pv = PanelView({
        id: 'demo-panelview',
        title: 'Demo',
        content: [
            {
                type: 'button',
                label: 'First Action',
                onClick: function(event) {
                    // action handler for the first action
                }
            },
            {
                type: 'button',
                label: 'Second Action',
                onClick: function(event) {
                    // handler for the second event
                }
            },
            {
                type: 'separator'
            },
            {
                type: 'button',
                label: 'Separated Button',
                onClick: function(event) {
                    // another event handler
                }
            }
        ],
        footer: {
            label: 'Footer Action',
            onClick: function(event) {
                // footer click handler
            }
        }
    });

    var button = buttons.ActionButton({
      id: "demo-button",
      label: "Jetpack PanelView",
      icon: {
        "16": "./icon-16.png",
        "32": "./icon-32.png",
        "64": "./icon-64.png"
      },
        onClick: function(state){
            pv.show(button);
        }
    });
