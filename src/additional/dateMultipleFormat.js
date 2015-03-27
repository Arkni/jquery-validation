(function() {

	/**
	 * This method will validate the year, the month and the day
	 *     - The year should be between 1000 & 9999
	 *     - The month between 1 & 12
	 *     - the day between 1 & 31 (28 or 29 for February)
	 *
	 * @param year
	 * @param month
	 * @param day
	 * @returns {boolean}
	 */
	function dateHelper( year, month, day ) {
		// Check for the length of year, month and day
		if ( year.length !== 4 || day.length > 2 || month.length > 2 || !year || !month || !day ) {
			return false;
		}

		if ( isNaN( year ) || isNaN( month ) || isNaN( day ) ) {
			return false;
		}

		day   = parseInt( day, 10 );
		month = parseInt( month, 10 );
		year  = parseInt( year, 10 );

		// Validate only years between 1000 & 9999
		// Check that month is between 1 & 12
		if ( year < 1000 || year > 9999 || month < 1 || month > 12 ) {
			return false;
		}

		// Days number for each month
		var monthsDays = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

		// If the year is leap, then update the number of days in February to 29 days
		if ( year % 400 === 0 || ( year % 100 !== 0 && year % 4 === 0 ) ) {
			monthsDays[ 1 ] = 29;
		}

		// Then check that the day is between 1 & the number of days of the month
		if ( day < 1 || day > monthsDays[ month - 1 ] ) {
			return false;
		}

		return true;
	}

	/**
	 * Parse the given date and return a Date object
	 *
	 * @param value      the date value
	 * @param dateFormat the date format
	 * @param separator  the used separator
	 * @returns {Date}
	 */
	function parse( value, dateFormat, separator ) {
		value      = value.split( separator );
		dateFormat = dateFormat.split( separator );

		var now = new Date(),
			year  = value[ dateFormat.indexOf( "YYYY" ) ] ||
			( ( Math.ceil( now.getFullYear() / 100 ) - 1 ) + value[ dateFormat.indexOf( "YY" ) ] ),
			month = value[ dateFormat.indexOf( "MM" ) ] || value[ dateFormat.indexOf( "M" ) ],
			day   = value[ dateFormat.indexOf( "DD" ) ] || value[ dateFormat.indexOf( "D" ) ];

		return new Date( year, month - 1, day, 12, 0, 0 );
	}

	/**
	 * This function is based on the dateFormat function from the Date Format 1.2.3
	 * Credit to (c) 2007-2009 Steven Levithan <stevenlevithan.com>
	 * MIT license
	 * see http://blog.stevenlevithan.com/archives/date-time-format for the complete lib
	 *
	 * Return the date string formatted following the format provided as param
	 *
	 * @param {Date|String} date  The date object to format
	 * @param {String} format     The date format
	 * The format can be:
	 *   - date: Consist of DD, MM, YYYY parts which are separated by the separator option
	 * with
	 *      d	   Day of the month as digits; no leading zero for single-digit days.
	 *      dd	   Day of the month as digits; leading zero for single-digit days.
	 *      m	   Month as digits; no leading zero for single-digit months.
	 *      mm	   Month as digits; leading zero for single-digit months.
	 *      yy	   Year as last two digits; leading zero for years less than 10.
	 *      yyyy   Year represented by four digits.
	 *
	 * @returns {String}
	 */
	function dateFormater(date, format) {
		format = format.toLowerCase();

		var	token = /d{1,2}|m{1,2}|yy(?:yy)?/g,
			pad = function( val, len ) {
				val = String( val );
				len = len || 2;
				while ( val.length < len ) {
					val = "0" + val;
				}

				return val;
			}, d, m, y, flags;

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date( date ) : new Date();

		if ( isNaN( date ) ) {
			throw new SyntaxError( "invalid date" );
		}

		format = String(format);

		d = date.getDate();
		m = date.getMonth();
		y = date.getFullYear();
		flags = {
			d:    d,
			dd:   pad(d),
			m:    m + 1,
			mm:   pad(m + 1),
			yy:   String( y ).slice( 2 ),
			yyyy: y
		};

		return format.replace( token, function( $0 ) {
			return $0 in flags ? flags[ $0 ] : $0.slice( 1, $0.length - 1 );
		});
	}

	/*
	 * dateMultipleFormat validator:
	 *     check if the given date is valid following the given format
	 *     the date format can be:
	 *         - YYYY/MM/DD
	 *         - YYYY-MM-DD
	 *         - YYYY.MM.DD
	 *         - DD/MM/YYYY
	 *         - DD-MM-YYYY
	 *         - DD.MM.YYYY
	 *         - ...
	 * the 'options' param is a JSON like object and has the following structure:
	 * {
	 *    format:    "The date format",
	 *    separator: "The used separator",
	 *    minDate:   "The min date",
	 *    maxDate:   "The max date"
	 * }
	 *
	 * Usage example
	 *
	 *    - Using default format & separator:
	 *    // Using 'true' instead of the 'options' param
	 *    dateInput: {
	 *        dateMultipleFormat: true
	 *    }
	 *
	 *    // Or Use the 'minDate' and/or the 'maxDate' like the following
	 *    dateInput: {
	 *        dateMultipleFormat: {
	 *            minDate: "31/01/2014",  // Or new Date( 2014, 0, 31 )
	 *            maxDate: "31/01/2016"   // Or new Date( 2016, 0, 31 )
	 *        }
	 *    }
	 *
	 *    - Using other date formats with specific separator
	 *    dateInput: {
	 *        dateMultipleFormat: {
	 *            format: "DD-MM-YYYY",   // Required if format <> "DD/MM/YYYY"
	 *            separator: "-",         // Required if separator <> "/"
	 *            minDate: "01-01-2014",  // Or new Date( 2014, 0, 1 )
	 *            maxDate: "01-01-2016"   // Or new Date( 2016, 0, 1 )
	 *        }
	 *    }
	 *
	 */
	$.validator.addMethod("dateMultipleFormat", function(value, element, options) {
		// If the field is optional
		// exit with success
		if ( this.optional( element ) ) {
			return true;
		}

		// If options = true or options = {}
		// The user doesn't specify the format, the separator, nether the minDate & maxDate
		// Then use the default ones
		//    - format: DD/MM/YYYY
		//    - separator: /
		if ( options === true || $.isEmptyObject( options ) ) {
			options = {
				format: "DD/MM/YYYY",
				separator: "/",
				outputFormat: "DD/MM/YYYY"
			};
		}

		var $this = this, now = new Date(),
			format, separator, dateFormats, dateValues, year, month, day,
			date, minDate, maxDate, valid;

		// If the format is an array of formats, then split each format (element) of the array
		if ( $.isArray( options.format ) ) {
			$.each( options.format, function( index, format ) {
				valid = $.validator.methods.dateMultipleFormat.call($this, value, element, {
					format: format,
					separator: options.separator,
					minDate: options.minDate,
					maxDate: options.maxDate
				} );

				if ( valid ) {
					options.outputFormat ? $( element ).val( dateFormater( parse( value, format, options.separator ), options.outputFormat ) ) : $.noop();
					// To exit the $.each
					return false;
				}
			});
		} else {
			format      = options.format ? options.format.toUpperCase() : "DD/MM/YYYY";
			separator   = options.separator || "/";
			dateFormats = format.split( separator ); // Split the format to 3 values YYYY, MM & DD
			dateValues  = value.split( separator );  // Split the date to 3 values year, month & day
			year        = dateValues[ dateFormats.indexOf( "YYYY" ) ] ||
				( ( Math.ceil( now.getFullYear() / 100 ) - 1 ) + dateValues[ dateFormats.indexOf( "YY" ) ] );
			month       = dateValues[ dateFormats.indexOf( "MM" ) ] || dateValues[ dateFormats.indexOf( "M" ) ];
			day         = dateValues[ dateFormats.indexOf( "DD" ) ] || dateValues[ dateFormats.indexOf( "D" ) ];

			// Check if dateValues & dateFormats have the same length
			// If no, exit with error
			if ( dateValues.length !== dateFormats.length ) {
				return false;
			}

			valid = dateHelper( year, month, day );

			// Check if options.minDate was set
			if ( options.minDate ) {
				minDate = options.minDate instanceof Date ? options.minDate : parse( options.minDate, format, separator );
			}

			// Check if maxDate was set
			if ( options.maxDate ) {
				maxDate = options.maxDate instanceof Date ? options.maxDate : parse( options.maxDate, format, separator );
			}

			if ( valid ) {
				date = new Date( year, month - 1, day, 12, 0, 0 );
			}

			// Test for minDate and maxDate
			switch ( true ) {
			case ( options.minDate && !options.maxDate && valid ):
				valid = date.getTime() >= minDate.getTime();
				break;
			case ( options.maxDate && !options.minDate && valid ):
				valid = date.getTime() <= maxDate.getTime();
				break;
			case ( options.minDate && options.maxDate && valid ):
				valid = date.getTime() >= minDate.getTime() && date.getTime() <= maxDate.getTime();
				break;
			default:
				break;
			}
		}

		// Format the value to match the options.outputFormat param
		if ( valid && options.outputFormat ) {
			$( element ).val( dateFormater( parse( value, format, separator ), options.outputFormat ) );
		}

		return valid;
	}, $.validator.messages.date);
}());
