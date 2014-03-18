/**
 * @author Lee Stemkoski
 *
 * Note: Only works with recent Chrome build.
 * 
 * Usage: 
 * (1) create a global variable:
 *      var gamepad = new GamepadState();
 * (2) during main loop:
 *       gamepad.update();
 * (3a) check state of buttons:
 *       gamepad.down("A")    -- true for one update cycle after button is pressed
 *       gamepad.pressed("A") -- true as long as button is being pressed
 *       gamepad.up("A")      -- true for one update cycle after button is released
 * (3b) check state of axes:
 *       gamepad.value("leftStickX") -- returns a value between -1.0 and 1.0
 * 
 *  See _buttonNames and _axisNames object data below for valid name strings.
 *  Note: can get values for of leftTrigger and rightTrigger also.
 */
 
////////////////////
// gamepad object //
////////////////////
GamepadState = function()
{	
	//////////////////
	// gamepad data //
	//////////////////
	
	this.status = {};
	
	////////////////////////////
	// gamepad initialization //
	////////////////////////////
	
	for (var i = 0; i < GamepadState._buttonNames.length; i++)
	{
		var name = GamepadState._buttonNames[i];
		this.status[name] = {down: false, pressed: false, up:false, active:false};
	}
	for (var i = 0; i < GamepadState._axisNames.length; i++)
	{
		var name = GamepadState._axisNames[i];
		this.status[name] = {value: 0};
	}
	
	////////////////////
	// gamepad events //
    ////////////////////
	
	// not yet available in Chrome?  :(
	addEventListener("gamepadconnected", function() { console.log("Gamepad connected.") });
	addEventListener("gamepaddisconnected", function() { console.log("Gamepad disconnected.") });
	
	///////////////////////
	// gamepad functions //
	///////////////////////
	
	this.isAvailable = function isAvailable()
	{
		var g = (navigator.getGamepads       && navigator.getGamepads()) ||
				(navigator.webkitGetGamepads && navigator.webkitGetGamepads());
		var anything = g[0] || g[1] || g[2] || g[3];
		if (anything) return true; else return false;
	}

	this.update = function update()
	{
		var g = (navigator.getGamepads       && navigator.getGamepads()) ||
				(navigator.webkitGetGamepads && navigator.webkitGetGamepads());
			
		var gamepad = g[0] || g[1] || g[2] || g[3];
		
		if (!gamepad) return; // exit if no gamepad available
		
		// update buttons
		for (var i = 0; i < 16; i++)
		{
			var name = GamepadState._buttonNames[i];
			var button = this.status[name];
			
			button.pressed = gamepad.buttons[i];
			
			// ensure button is flagged as down for only one update.
			if (button.down)
				button.down = false;
			
			// ensure button is flagged as up for only one update.
			// when "up" becomes false, button is no longer active.
			if (button.up)
			{
				button.up = false;
				button.active = false;
			}
			
			// is this the first update where this button was pressed?
			if (button.pressed && !button.active)
				button.down = true;		
			
			// is this the first update where this button was released?
			if (!button.pressed && button.active)
				button.up = true;
			// if _anything_ is flagged, button is "active"
			button.active = (button.down || button.pressed || button.up);		
		}
		
		// update axes
		for (var i = 0; i < 4; i++)
		{
			var name = GamepadState._axisNames[i];
			this.status[name].value = gamepad.axes[i];
		}
	}

	this.down = function down(buttonName)
	{
		if ( this.status.hasOwnProperty(buttonName) )
			return this.status[buttonName].down;
		else console.warn("Gamepad: no button mapped to", buttonName);
	}

	this.pressed = function pressed(buttonName)
	{
		if (this.status.hasOwnProperty(buttonName))
			return this.status[buttonName].pressed;
		else console.warn("Gamepad: no button mapped to", buttonName);
	}

	this.up = function up(buttonName)
	{
		if (this.status.hasOwnProperty(buttonName))
			return this.status[buttonName].up;
		else console.warn("Gamepad: no button mapped to", buttonName);
	}

	this.value = function value(axisName)
	{
		if (axisName == "leftTrigger" || axisName == "rightTrigger")
			return this.status[axisName].pressed;
		else if (this.status.hasOwnProperty(axisName))
			return this.status[axisName].value;
		else
			console.warn("Gamepad: no axis mapped to", axisName);
	}

	this.report = function report()
	{
		console.log("-------- Report Data ---------");
		for (var i = 0; i < GamepadState._buttonNames.length; i++)
		{
			var name = GamepadState._buttonNames[i];
			var button = this.status[name];
			if (button.down)    console.log(name, ": is down");
			if (button.pressed) console.log(name, ": is pressed");
			if (button.up)      console.log(name, ": is up");
		}
		for (var i = 0; i < GamepadState._axisNames.length; i++)
		{
			var deadZone = 0.10;
			var name = GamepadState._axisNames[i];
			var axis = this.status[name];
			if (Math.abs(axis.value) > deadZone) console.log(name, ": has value ", axis.value);
		}
	}
} // end of constructor

GamepadState._buttonNames = ["A", "B", "X", "Y", "leftShoulder", "rightShoulder", "leftTrigger", "rightTrigger",
	"back", "start", "leftStick", "rightStick", "dpadUp", "dpadDown", "dpadLeft", "dpadRight"];
GamepadState._axisNames = ["leftStickX", "leftStickY", "rightStickX", "rightStickY"];
