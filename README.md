


#Node package for drive fingerprint sensor ZFM20 


###Sensor 

https://www.adafruit.com/products/751

###Connection

http://i.ebayimg.com/00/s/ODAwWDgwMA==/z/LboAAOSwU9xUUgoo/$_12.JPG


##Installation

```
npm install zfm20
```


## Usage


```js
var FingerPrint = require("zfm20"),
	sensor;


sensor = new FingerPrint();

sensor.connect({
	port 		: "/dev/ttyUSB0"
	baudrate 	: 57600,
});

sensor.on("ready", function(){

	sensor.read()
	.ok(function(id){
		console.log("Fingerprint found! ID",id);
	})
	.fail(function () {
		console.log("Unknown fingerprint");
	})
	.wait(function(){
		console.log("Put fingerprint");
	});

});
```


##Serial Ports

```js
var FingerPrint = require("zfm20"),
	sensor;


sensor = new FingerPrint();

sensor.ports(function(port){
	console.log(port); //check available port
});

```

## Methods

All methods return a `result` object like: { ok, fail, error }

```js
result.ok(CALLBACK_ONOK) 
		.fail(CALLBACK_ONFAIL)
		.error(CALLBACK_ONERROR)
```

### .enroll (ID)

ID : Fingerprint ID stored in module

```js
result.ok( ON_NEW_FINGERPRINT_IS_STORED ) 
		.fail( ON_REGISTRATION_FINGERPRINT_FAILED )
		.error( ON_ERROR )
```

### .read ()

```js
result.ok( ON_FINGERPRINT_FOUND ) 
		.fail( ON_FINGERPRINT_NOT_FOUND )
		.error( ON_ERROR )
```

### .delete (ID)

ID : Fingerprint ID

```js
result.ok( ON_FINGERPRINT_DELETED ) 
		.fail( ON_FINGERPRINT_NOT_DELETED )
		.error( ON_ERROR )
```

### .load (ID)

ID : Fingerprint ID

```js
result.ok( ON_FINGERPRINT_LOADED ) 
		.fail( ON_FINGERPRINT_NOT_LOADED )
		.error( ON_ERROR )
```


## COMMANDS

All commands return a `result` object like: { ok, fail, error }

see ZFM20 datasheet for more information

same API that https://github.com/adafruit/Adafruit-Fingerprint-Sensor-Library

```js
result.ok(CALLBACK_ONOK) 
		.fail(CALLBACK_ONFAIL)
		.error(CALLBACK_ONERROR)
```

### .verifyPassword()

### .getImage()

### .image2Tz(slot)

### .createModel()

### .storeModel( ID_FINGERPRINT_STORED )

### .loadModel( ID_FINGERPRINT_STORED )

### .getModel()

### .deleteModel( ID_FINGERPRINT_STORED )

### .emptyDatabase()

### .fingerFastSearch()

### .getTemplateCount()