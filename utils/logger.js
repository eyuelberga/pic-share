 module.exports.log = function Log(message, data){
    console.log((new Date()).toISOString(),message, data);
}