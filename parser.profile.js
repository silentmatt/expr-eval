var profile = (function(){
	var testResourceRe = /^dojo\/tests\//,

		copyOnly = function(filename, mid){
			var list = {
				"parser/parser.profile":1,
				"parser/package.json":1,
				"parser/test":1
			};
			return (mid in list) ||
				/(png|jpg|jpeg|gif|tiff)$/.test(filename) ||
				/built\-i18n\-test\/152\-build/.test(mid);
		};
	return {
		resourceTags:{
			test: function(filename, mid){
				return testResourceRe.test(mid);
			},

			copyOnly: function(filename, mid){
				return copyOnly(filename, mid);
			},

			amd: function(filename, mid) {
				return /\.js$/.test(filename) && !copyOnly(filename, mid);
			}
		}
	};
})();
