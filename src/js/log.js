var Log = function(){

};

Log.log = function(err){
    console.log("Error info:");
    console.log(err.message);
    console.log(console.trace());
};

function testLog(){
    try{
        funnnn();
    }catch(err){
        Log.log(err);
    }
}
