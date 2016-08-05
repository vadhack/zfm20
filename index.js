/*
(The MIT License)

Copyright (c) 2011-2020 Valentín Arámbulo Díaz,  www.vadhack.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify,
 merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/



var serialPort 	= require('serialport'),
	Result 		= require('async-result'),
	SerialPort 	= serialPort.SerialPort,
	port,


	fingerID, confidence, templateCount,
	thePassword 					= 0,
	theAddress 						= 0xFFFFFFFF,

	FINGERPRINT_DEBUG 				= false,

	FINGERPRINT_OK 					= 0x00,
	FINGERPRINT_PACKETRECIEVEERR 	= 0x01,
	FINGERPRINT_NOFINGER 			= 0x02,
	FINGERPRINT_IMAGEFAIL 			= 0x03,
	FINGERPRINT_IMAGEMESS 			= 0x06,
	FINGERPRINT_FEATUREFAIL 		= 0x07,
	FINGERPRINT_NOMATCH 			= 0x08,
	FINGERPRINT_NOTFOUND 			= 0x09,
	FINGERPRINT_ENROLLMISMATCH 		= 0x0A,
	FINGERPRINT_BADLOCATION 		= 0x0B,
	FINGERPRINT_DBRANGEFAIL 		= 0x0C,
	FINGERPRINT_UPLOADFEATUREFAIL 	= 0x0D,
	FINGERPRINT_PACKETRESPONSEFAIL 	= 0x0E,
	FINGERPRINT_UPLOADFAIL 			= 0x0F,
	FINGERPRINT_DELETEFAIL 			= 0x10,
	FINGERPRINT_DBCLEARFAIL 		= 0x11,
	FINGERPRINT_PASSFAIL 			= 0x13,
	FINGERPRINT_INVALIDIMAGE 		= 0x15,
	FINGERPRINT_FLASHERR 			= 0x18,
	FINGERPRINT_INVALIDREG 			= 0x1A,
	FINGERPRINT_ADDRCODE 			= 0x20,
	FINGERPRINT_PASSVERIFY 			= 0x21,
	FINGERPRINT_STARTCODE 			= 0xEF01,
	FINGERPRINT_COMMANDPACKET 		= 0x1,
	FINGERPRINT_DATAPACKET 			= 0x2,
	FINGERPRINT_ACKPACKET 			= 0x7,
	FINGERPRINT_ENDDATAPACKET 		= 0x8,
	FINGERPRINT_TIMEOUT 			= 0xFF,
	FINGERPRINT_BADPACKET 			= 0xFE,
	FINGERPRINT_GETIMAGE 			= 0x01,
	FINGERPRINT_IMAGE2TZ 			= 0x02,
	FINGERPRINT_REGMODEL 			= 0x05,
	FINGERPRINT_STORE 				= 0x06,
	FINGERPRINT_LOAD 				= 0x07,
	FINGERPRINT_UPLOAD 				= 0x08,
	FINGERPRINT_DELETE 				= 0x0C,
	FINGERPRINT_EMPTY 				= 0x0D,
	FINGERPRINT_VERIFYPASSWORD 		= 0x13,
	FINGERPRINT_HISPEEDSEARCH 		= 0x1B,
	FINGERPRINT_TEMPLATECOUNT 		= 0x1D,

	EVENTS 		= [],
	emitEvent 	= function(name, params, msg){
		EVENTS[name] && EVENTS[name](params, msg);
	},
	onData 		= function(){};


function Sensorfp () {};

Sensorfp.prototype.FINGERPRINT_DEBUG 				= FINGERPRINT_DEBUG,
Sensorfp.prototype.FINGERPRINT_OK 					= FINGERPRINT_OK,
Sensorfp.prototype.FINGERPRINT_PACKETRECIEVEERR 	= FINGERPRINT_PACKETRECIEVEERR,
Sensorfp.prototype.FINGERPRINT_NOFINGER 			= FINGERPRINT_NOFINGER,
Sensorfp.prototype.FINGERPRINT_IMAGEFAIL 			= FINGERPRINT_IMAGEFAIL,
Sensorfp.prototype.FINGERPRINT_IMAGEMESS 			= FINGERPRINT_IMAGEMESS,
Sensorfp.prototype.FINGERPRINT_FEATUREFAIL 			= FINGERPRINT_FEATUREFAIL,
Sensorfp.prototype.FINGERPRINT_NOMATCH 				= FINGERPRINT_NOMATCH,
Sensorfp.prototype.FINGERPRINT_NOTFOUND 			= FINGERPRINT_NOTFOUND,
Sensorfp.prototype.FINGERPRINT_ENROLLMISMATCH 		= FINGERPRINT_ENROLLMISMATCH,
Sensorfp.prototype.FINGERPRINT_BADLOCATION 			= FINGERPRINT_BADLOCATION,
Sensorfp.prototype.FINGERPRINT_DBRANGEFAIL 			= FINGERPRINT_DBRANGEFAIL,
Sensorfp.prototype.FINGERPRINT_UPLOADFEATUREFAIL 	= FINGERPRINT_UPLOADFEATUREFAIL,
Sensorfp.prototype.FINGERPRINT_PACKETRESPONSEFAIL 	= FINGERPRINT_PACKETRESPONSEFAIL,
Sensorfp.prototype.FINGERPRINT_UPLOADFAIL 			= FINGERPRINT_UPLOADFAIL,
Sensorfp.prototype.FINGERPRINT_DELETEFAIL 			= FINGERPRINT_DELETEFAIL,
Sensorfp.prototype.FINGERPRINT_DBCLEARFAIL 			= FINGERPRINT_DBCLEARFAIL,
Sensorfp.prototype.FINGERPRINT_PASSFAIL 			= FINGERPRINT_PASSFAIL,
Sensorfp.prototype.FINGERPRINT_INVALIDIMAGE 		= FINGERPRINT_INVALIDIMAGE,
Sensorfp.prototype.FINGERPRINT_FLASHERR 			= FINGERPRINT_FLASHERR,
Sensorfp.prototype.FINGERPRINT_INVALIDREG 			= FINGERPRINT_INVALIDREG,
Sensorfp.prototype.FINGERPRINT_ADDRCODE 			= FINGERPRINT_ADDRCODE,
Sensorfp.prototype.FINGERPRINT_PASSVERIFY 			= FINGERPRINT_PASSVERIFY,
Sensorfp.prototype.FINGERPRINT_STARTCODE 			= FINGERPRINT_STARTCODE,
Sensorfp.prototype.FINGERPRINT_COMMANDPACKET 		= FINGERPRINT_COMMANDPACKET,
Sensorfp.prototype.FINGERPRINT_DATAPACKET 			= FINGERPRINT_DATAPACKET,
Sensorfp.prototype.FINGERPRINT_ACKPACKET 			= FINGERPRINT_ACKPACKET,
Sensorfp.prototype.FINGERPRINT_ENDDATAPACKET 		= FINGERPRINT_ENDDATAPACKET,
Sensorfp.prototype.FINGERPRINT_TIMEOUT 				= FINGERPRINT_TIMEOUT,
Sensorfp.prototype.FINGERPRINT_BADPACKET 			= FINGERPRINT_BADPACKET,
Sensorfp.prototype.FINGERPRINT_GETIMAGE 			= FINGERPRINT_GETIMAGE,
Sensorfp.prototype.FINGERPRINT_IMAGE2TZ 			= FINGERPRINT_IMAGE2TZ,
Sensorfp.prototype.FINGERPRINT_REGMODEL 			= FINGERPRINT_REGMODEL,
Sensorfp.prototype.FINGERPRINT_STORE 				= FINGERPRINT_STORE,
Sensorfp.prototype.FINGERPRINT_LOAD 				= FINGERPRINT_LOAD,
Sensorfp.prototype.FINGERPRINT_UPLOAD 				= FINGERPRINT_UPLOAD,
Sensorfp.prototype.FINGERPRINT_DELETE 				= FINGERPRINT_DELETE,
Sensorfp.prototype.FINGERPRINT_EMPTY 				= FINGERPRINT_EMPTY,
Sensorfp.prototype.FINGERPRINT_VERIFYPASSWORD 		= FINGERPRINT_VERIFYPASSWORD,
Sensorfp.prototype.FINGERPRINT_HISPEEDSEARCH 		= FINGERPRINT_HISPEEDSEARCH,
Sensorfp.prototype.FINGERPRINT_TEMPLATECOUNT 		= FINGERPRINT_TEMPLATECOUNT,

Sensorfp.prototype.ports = function(onport){
	serialPort.list(function (err, ports) {
		ports.forEach(onport);
	});
};

Sensorfp.prototype.connect = function(opt){
	opt = opt || {};
	var fp = this;
	port = new SerialPort( opt.port || '/dev/ttyUSB0', {
	  	baudrate: opt.baudrate || 57600
	});
	port.on('open', function () {
		fp.verifyPassword()
		.error(function(){
			emitEvent("error", {error : true, msg : "Error connecting with module"});
		})
		.fail(function(){
			emitEvent("error", {error : true, msg : "module not found"});
		})
		.ok(function(){
			emitEvent("ready");
		});
	});
	port.on('error', function () {
		emitEvent("error");
	});
	port.on('disconnect', function () {
		emitEvent("disconnect");
	});
	port.on('close', function () {
		emitEvent("close");
	});
	port.on("data", function(reply){
		onData && onData(reply);
	});
};

Sensorfp.prototype.on = function(ename, cb) {
	EVENTS[ename] = cb;
};

Sensorfp.prototype.enroll = function (ID) {
	var result 	= new Result(),
		fp 		= this,
		wait = function(){
			console.log("waiting for finger");
		};

	result.wait = function(cb){
		wait = cb;
	};

	var takeImage_1 = function() {
		wait();
		fp.getImage()
		.fail(result.fail)
		.ok(function(code){
			evaluateCode(code, takeImage2tz_1, takeImage_1, result.fail);
		});
	};

	var takeImage2tz_1 = function() {
		wait();
		fp.image2Tz(1)
		.fail(result.fail)
		.ok(function(code){
			evaluateCode(code, takeImage_2, takeImage2tz_1, result.fail);
		});
	};

	var takeImage_2 = function() {
		wait();
		fp.getImage()
		.fail(result.fail)
		.ok(function(code){
			evaluateCode(code, takeImage2tz_2, takeImage_2, result.fail);
		});
	};

	var takeImage2tz_2 = function() {
		wait();
		fp.image2Tz(2)
		.fail(result.fail)
		.ok(function(code){
			evaluateCode(code, createModelImage, takeImage2tz_2, result.fail);
		});
	};

	var createModelImage = function () {
		fp.createModel()
		.fail(result.fail)
		.ok(function(code){
			evaluateCode(code, storeModelImage, null, result.fail);
		});
	};

	var storeModelImage = function () {
		fp.storeModel(ID)
		.fail(result.fail)
		.ok(function(code){
			evaluateCode(code, function(){
				result.ok(ID, "Fingerprint stored");
			}, null, result.fail);
		});
	};
	
	takeImage_1();
	return result;
};

Sensorfp.prototype.read = function () {

	var result 	= new Result(),
		fp 		= this,
		wait = function(){
			console.log("waiting for finger");
		};

	result.wait = function(cb){
		wait = cb;
	};


	var takeImage_1 = function() {
		wait();
		fp.getImage()
		.error(result.error)
		.fail(result.fail)
		.ok(function(code){
			evaluateCode(code, takeImage2tz_1, takeImage_1, result.fail);
		});
	};

	var takeImage2tz_1 = function() {
		wait();
		fp.image2Tz(1)
		.error(result.error)
		.fail(result.fail)
		.ok(function(code){
			evaluateCode(code, find, takeImage2tz_1, result.fail);
		});
	};

	var find = function() {
		fp.fingerFastSearch()
		.fail(result.fail)
		.error(result.error)
		.ok(function(code){
			evaluateCode(code, function(){
				result.ok(fingerID,"fingerprint found");
			}, null, result.fail);
		});
	};

	
	takeImage_1();
	return result;
};

Sensorfp.prototype.delete = function (ID) {
	var result = new Result();
	this.deleteModel(ID)
	.fail(result.fail)
	.error(result.error)
	.ok(function(code){
		evaluateCode(code, function(){
			result.ok(ID, "Fingerprint ID "+ID+" deleted.");
		}, null, result.fail);
	});
	return result;
};

Sensorfp.prototype.load = function (ID) {

	var result 	= new Result(),
		fp 		= this;

	fp.loadModel(ID)
		.error(result.error)
		.fail(result.fail)
		.ok(function(code){
			evaluateCode(code, getfp, null, result.fail);
		})
	;

	var getfp = function() {
		fp.getModel()
		.error(result.error)
		.fail(result.fail)
		.ok(function(code, packet){
			evaluateCode(code, function(){
				result.ok(packet, "Fingerprint loaded");

				/*var bitmap = new Buffer(packet);
			    // write buffer to file
			    fs.writeFile("image.bmp", bitmap, function(){
			    	console.log(arguments);
			    });*/


			}, null, result.fail);
		});
	};

	return result;
};	


function evaluateCode (code, onok, repeat, onfail) {
	switch(code){
		case FINGERPRINT_OK:
	      	onok();
	      	break;
	    case FINGERPRINT_NOFINGER:
	      	repeat && repeat();
	      	break;
	    case FINGERPRINT_PACKETRECIEVEERR:
	      	onfail && onfail(code, "Communication error");
	      	break;
	    case FINGERPRINT_IMAGEFAIL:
	      	onfail && onfail(code, "Imaging error");
	      	break;
	    case FINGERPRINT_FEATUREFAIL:
	      	onfail && onfail(code, "FEATURE FAIL");
	      	break;
	    case FINGERPRINT_INVALIDIMAGE:
	      	onfail && onfail(code, "INVALID IMAGE");
	      	break;
	    case FINGERPRINT_BADLOCATION:
	    	onfail && onfail(code, "Could not delete in that location");
	      	break;
	    case FINGERPRINT_FLASHERR:
	    	onfail && onfail(code, "Error writing to flash");
	      	break;
	    case FINGERPRINT_NOTFOUND:
	    	onfail && onfail(code, "Not found");
	      	break;
	    default:
	      	onfail && onfail(code, "Unknown error");
	      	break;
	}
};


function onReply (result, packet, onok, timeout) {
	var reply 	= new Buffer([]);
	timeout = timeout || 500;
	setTimeout(function(){
		if(reply.length == 0){
			return result.fail(FINGERPRINT_TIMEOUT, "Timeout receiving packet "+timeout);
		}
		var len = getReply(reply, packet);
		if ((len != 1) && (packet[0] != FINGERPRINT_ACKPACKET)){
			return result.fail(-1);
		};
		onok && onok();
		return result.ok(packet[1], packet);
	}, timeout);

	onData = function(rbuffer){
		if(FINGERPRINT_DEBUG)
			console.log("Receiving part of buffer",rbuffer);
		reply = Buffer.concat([reply, rbuffer]);
	};
};

Sensorfp.prototype.verifyPassword = function () {
  	var packet = [
  		FINGERPRINT_VERIFYPASSWORD, 
	    (thePassword >> 24), 
	    (thePassword >> 16),
	    (thePassword >> 8), 
	    thePassword
	],
	result 	= new Result();
  	writePacket(theAddress, FINGERPRINT_COMMANDPACKET, 7, packet);
	new onReply(result, packet);	
  	return result;
};

Sensorfp.prototype.getImage = function () {
  	var packet 	= [FINGERPRINT_GETIMAGE],
  		result 	= new Result();
  	writePacket(theAddress, FINGERPRINT_COMMANDPACKET, 3, packet);
  	new onReply(result, packet);
  	return result;
};

Sensorfp.prototype.image2Tz = function (slot) {
  	var packet = [FINGERPRINT_IMAGE2TZ, slot],
  		result 	= new Result();
  	writePacket(theAddress, FINGERPRINT_COMMANDPACKET, packet.length + 2, packet);
  	new onReply(result, packet);
  	return result;
};

Sensorfp.prototype.createModel = function() {
	var packet = [FINGERPRINT_REGMODEL],
  		result 	= new Result();
  	writePacket(theAddress, FINGERPRINT_COMMANDPACKET, packet.length + 2, packet);
  	new onReply(result, packet);
  	return result;
};

Sensorfp.prototype.storeModel = function(id) {
	var packet = [FINGERPRINT_STORE, 0x01, id >> 8, id & 0xFF],
  		result 	= new Result();
  	writePacket(theAddress, FINGERPRINT_COMMANDPACKET, packet.length + 2, packet);
  	new onReply(result, packet);
  	return result;
}

Sensorfp.prototype.loadModel = function(id) {
	var packet = [FINGERPRINT_LOAD, 0x01, id >> 8, id & 0xFF],
  		result 	= new Result();
    writePacket(theAddress, FINGERPRINT_COMMANDPACKET, packet.length + 2, packet);
    new onReply(result, packet);
  	return result;
};

Sensorfp.prototype.getModel = function () {
	var packet = [FINGERPRINT_UPLOAD, 0x01],
  		result 	= new Result();
    writePacket(theAddress, FINGERPRINT_COMMANDPACKET, packet.length + 2, packet);
    new onReply(result, packet);
  	return result;
};

Sensorfp.prototype.deleteModel = function(id) {
	var packet = [FINGERPRINT_DELETE, id >> 8, id & 0xFF, 0x00, 0x01],
  		result 	= new Result();
     writePacket(theAddress, FINGERPRINT_COMMANDPACKET, packet.length + 2, packet);
    new onReply(result, packet);
  	return result;
};

Sensorfp.prototype.emptyDatabase = function() {
	var packet = [FINGERPRINT_EMPTY],
  		result 	= new Result();
     writePacket(theAddress, FINGERPRINT_COMMANDPACKET, packet.length + 2, packet);
    new onReply(result, packet);
  	return result;
};

Sensorfp.prototype.fingerFastSearch = function() {
  	fingerID 	= 0xFFFF;
  	confidence 	= 0xFFFF;
  	// high speed search of slot #1 starting at page 0x0000 and page #0x00A3 
  	var packet = [FINGERPRINT_HISPEEDSEARCH, 0x01, 0x00, 0x00, 0x00, 0xA3],
  		result 	= new Result();
  	writePacket(theAddress, FINGERPRINT_COMMANDPACKET, packet.length+2, packet);
  	onReply(result, packet, function(){
  		fingerID = packet[2];
	  	fingerID <<= 8;
	  	fingerID |= packet[3];
	  	confidence = packet[4];
	  	confidence <<= 8;
	  	confidence |= packet[5];
  	});
  	return result;
};

Sensorfp.prototype.getTemplateCount = function() {
  	templateCount = 0xFFFF;
  	var packet 	= [FINGERPRINT_TEMPLATECOUNT],
  		result 	= new Result();
  	writePacket(theAddress, FINGERPRINT_COMMANDPACKET, packet.length+2, packet);
  	onReply(result, packet, function(){
  		templateCount = packet[2];
  		templateCount <<= 8;
  		templateCount |= packet[3];
  	});
  	return result;
};


function getReply(reply, packet) {
	FINGERPRINT_DEBUG && console.log("REPLY",reply);
	if( (reply[0] !== FINGERPRINT_STARTCODE >> 8) && (reply[1] !== (FINGERPRINT_STARTCODE & 0xFF) ) ) return FINGERPRINT_BADPACKET
  	var len 		= reply[7],
  		end 		= reply.length - 2,
  		packettype 	= reply[6];
    len <<= 8;
	len |= reply[8];
	len -= 2;
	
	packet[0] = packettype;
	for (var i= 0; i< end; i++) {
	   	packet[1+i] = reply[9+i];
	};

    /*packet[0] = packettype;
	for (var i=0; i<len; i++) {
	   	packet[1+i] = reply[9+i];
	}*/
	return len;
}



function writePacket (addr, packettype, len, packet, callback) {
	var buffer = [];

 	buffer.push(FINGERPRINT_STARTCODE >> 8);
  	buffer.push(FINGERPRINT_STARTCODE);
  	buffer.push(addr >> 24);
  	buffer.push(addr >> 16);
  	buffer.push(addr >> 8);
  	buffer.push(addr);
  	buffer.push(packettype);
  	buffer.push(len >> 8);
  	buffer.push(len);
  
   	var sum = (len>>8) + (len&0xFF) + packettype;
  	for (var i=0; i< len-2; i++) {
    	buffer.push(packet[i]);
    	sum += packet[i];
  	}

  	buffer.push(sum>>8);
  	buffer.push(sum);
  	buffer = new Buffer(buffer);
  	if(FINGERPRINT_DEBUG) console.log('\nSending: ',buffer);
  	port.write(buffer, function(num){
  		port.drain(callback);
  	});
};



module.exports = Sensorfp;

