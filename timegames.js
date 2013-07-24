var sax= require("sax"),
  isodate= require("isodate"),
  http= require("http"),
  https= require("https"),
  Q= require("q")

//console.log("WTF IZS",sax)

if(process.argv.length != 3){
	console.error("Incorrect arguments")
}

var name= process.argv[2]

var _firstPublished= hackMemoize(getFirstMatchedTagValue,[,"published"])
function getLastPublished(){
	return getSax("https://github.com/"+name+".atom").then(_firstPublished).then(isodate)
}

var _firstSha256= hackMemoize(getFirstMatchedTagValue,[,"sha256"])
function getTimestamp(){
	return getSax("http://publictimestamp.org/rest/v1.0/publictimestamp-rest-v1.0.pl?pt=getlatestptb").then(_firstSha256)
}

function writeTimestamp(){
}

function commit(){
}

function getHttpOrHttps(url){
	if(url.substring(0,5) == "https")
		return https
	else
		return http
}

function getSax(url){
	var saxParser= sax.parser(true),
	  defer= Q.defer()
	var req= getHttpOrHttps(url).request(url,function(res){
		res.setEncoding("utf8")
		defer.resolve(saxParser)
		res.on("data",function(chunk){
			process.nextTick(function(){
				saxParser.write(chunk)
			})
		})
	})
	req.on("error",function(err){
		defer.reject(err)
	})
	req.end()
	return defer.promise
}

function getFirstMatchedTagValue(saxParser,tag){
	var defer= Q.defer()
	saxParser.onopentag= function(node){
		if(node.name == tag){
			saxParser.ontext= function(val){
				defer.resolve(val)
			}
		}
	}
	saxParser.onend= function(){
		defer.reject("end of doc")
	}
	return defer.promise
}

function hackMemoize(fn,args){
	if(!(args instanceof Array))
		throw "expected array"
	return function(val){
		var unfound= -1
		for(var i= 0; i< args.length; ++i){
			var arg= args[i]
			if(arg === undefined){
				if(unfound != -1)
					throw "bad args"
				unfound= i
				args[i]= val
			}
		}
		try{
			var rv= fn.apply(null,args)
		}catch(ex){
			args[unfound]= undefined
			throw ex
		}
		args[unfound]= undefined
		return rv
	}
}
