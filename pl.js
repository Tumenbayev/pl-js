(function () {
	var re = /\{([^\|].*?[^\|])\}/gm,
	
	lang = function(ln) {
		if (ln && typeof ln === 'object') return l;
		
		ln = ln || window.pl.defaultLang;
		l = window.pl.langs[ln];
		if (!l) throw 'unknown language ' + ln;
		
		return l;
	};
	
	/**
	 * Выбрать из массива подходящую форму множественного числа.
	 * Если в результирующей строке присутствует последовательность %d, она
	 * заменяется на значение n.
	 * 
	 * @param {Number} n
	 * @param {String|Object} [l]
	 * 
	 * @returns {String}
	 */
	Array.prototype.pl = function(n, l) {
		if (typeof n !== 'number') throw 'first argument for Array.pl() must be number';
		
		l = lang(l);
		
		if (this.length !== l[0]) throw 'expected ' + l[0] + ' plural forms instead of ' + this.length;
		
		var i = l[1](n);
		if (typeof this[i] !== 'string') throw 'pattern element must be string';
		
		return this[i].replace('%d', n);
	};
	
	/**
	 * Выполнить парсинг форм множественного числа в строке.
	 * Конструкции вида {word1|word2|word3} конвертируются в массив и обрабатываются Array.pl().
	 * Для конструкций вида {patternName} берутся массивы из patterns по ключу patternName
	 * и обрабатываются Array.pl() аналогично первому случаю.
	 * 
	 * @param {Number} n1
	 * @param {Number} [n2]
	 * @param {Number} [n3]
	 * ...
	 * @param {Object} [patterns]
	 * @param {String|Object} [l]
	 * 
	 * @returns {String}
	 */
	String.prototype.pl = function() {
		var args = Array.prototype.slice.call(arguments), 
		
		s = this, 
		numbers = [], 
		patterns = null,
		l = null, 
		
		a = null, i = 0;
		
		if (args.length < 1) throw 'String.pl() takes at least 1 argument';
		
		while (typeof (a = args.shift()) !== 'undefined') {
			if (l === null && patterns === null && typeof a === 'number') {
				numbers.push(a);
			}
			else if (patterns === null && typeof a === 'object') {
				patterns = a;
			}
			else if (l === null && typeof a === 'string') {
				l = lang(l);
			}
			else {
				throw 'unexpected argument ' + a;
			}
		}
		
		s = s.replace(re, function (s, p) {
			var n = numbers[i++], words = null;
			
			if (typeof n === 'undefined') throw 'plural count is greater than number count';
			
			if (p.indexOf('|') >= 0) {
				words = p.split('|');
			}
			else if (patterns && typeof patterns === 'object') {
				words = patterns[p];
				if (typeof words === 'undefined') throw 'unknown pattern ' + p;
				if (typeof words !== 'object') throw 'pattern ' + p + ' must be array';
			}
			else {
				throw 'patterns must be object or array';
			}
			
			return words.pl(n, l);
		});
		
		return s;
	};
	
	/**
	 * Выбрать подходящую форму множественного числа из массива или строки.
	 * 
	 * @param {String|Array} s 
	 * @param {String|Object} [l] 
	 * 
	 * @returns {String}
	 */
	Number.prototype.pl = function(s, l) {
		if (typeof s.pl !== 'function') throw 'first argument for Number.pl() must support pl() method';
		return s.pl((this + 0), l);
	};
	
	window.pl				= window.pl || {};
	window.pl.defaultLang	= window.pl.defaultLang || 'ru';
	window.pl.langs			= window.pl.langs || {};
})();

	
	
/**
 * Правила для языков
 */

window.pl.langs['en'] = [2, function(n) {
	n = Math.abs(n);
	
	return (n !== 1) + 0;
}];

window.pl.langs['ru'] = [4, function(n) {
	n = Math.abs(n);
	
	if (n % 1 !== 0) return 3;
	
	n = n % 100;
	if (n > 10 && n < 20) return 2;
	
	n = n % 10;
	return (n !== 1) + (n >= 5 || !n);
}];

/**
 * Новые языки можно добавить следующим образом:
 * 
 * window.pl.langs['lang_name'] = [plural_form_count, function(number) {
 * 		return plural_form_index;
 * }];
 * 
 * Справка по множественным формам для разных языков:
 * http://unicode.org/repos/cldr-tmp/trunk/diff/supplemental/language_plural_rules.html
 */