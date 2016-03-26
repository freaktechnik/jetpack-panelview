const { PanelView } = require("jetpack-panelview");
const { ToggleButton } = require('sdk/ui');
const workaround = require("jetpack-panelview/lib/panelview/workaround");

const pv = PanelView({
    id: 'demo-panelview',
    title: 'Demo',
    content: [
        {
            type: 'button',
            label: 'First Action',
            onClick(event) {
                // action handler for the first action
            }
        },
        {
            type: 'button',
            label: 'Second Action',
            onClick(event) {
                // handler for the second event
            }
        },
        {
            type: 'separator'
        },
        {
            type: 'button',
            label: 'Separated Button',
            onClick(event) {
                // another event handler
            }
        }
    ],
    footer: {
        label: 'Footer Action',
        onClick(event) {
            // footer click handler
        }
    }
});

const button = ToggleButton({
  id: "demo-button",
  label: "Jetpack PanelView",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
    onClick(state){
        if(state.checked) {
            pv.show(button);
        }
    }
});

// Uncheck the button if the panel is hidden by loosing focus
pv.on("hide", () => {
    button.state("window", {checked: false});
});

// Don't close the menu panel or overflow panel when the button is clicked.
workaround.applyButtonFix(button);

