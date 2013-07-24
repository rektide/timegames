var sax= require("sax"),
  isodate= require("isodate"),
  http= require("https"),
  Q= require("q")

//console.log("WTF IZS",sax)

if(process.argv.length != 3){
	console.error("Incorrect arguments")
}

var name= process.argv[2]

function getLastPublished(){
	var saxParser= sax.parser(true),
	  publishedDefer= Q.defer()
	saxParser.onopentag= function(node){
		if(node.name == "published"){
			saxParser.ontext= function(t){
				try{
					var time= isodate(t)
					publishedDefer.resolve(time)
				}catch(ex){
					publishedDefer.reject(ex)
				}
			}
		}
	}
	var req= http.request("https://github.com/"+name+".atom",function(res){
		res.setEncoding("utf8")
		res.on("data",function(chunk){
			saxParser.write(chunk)
		})
	})
	req.on("error",function(err){
		publishedDefer.reject(err)
	})
	req.end()
	return publishedDefer.promise
}

function getTimestamp(){
}

function writeTimestamp(){
}

function commit(){
}
