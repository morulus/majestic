/*
Options:
content - string | function
overlayBackgroundColor
*/

Brahma('brahma.overlay', function() {
	
	Brahma.applet('overlay',
	{
		context : null,
		options: {
			content: '',
			panel: {
				style: {

				}
			},
			overlay: {
				style: {
					
				}
			},
			effect: {
				'type': 'fade',
				'direction': 0
			},
			"class": false,
			freezeWrapper: true,
			autoshow: true // autoshow after creating
		},
		current: {
			backup: {}
		},
		wrappers : {
			content : null
		},
		execute : function() {	
			
			// Initial effects
			this.effects.applet = this;
			
			this.context = this.getContext();
			if (this.config.freezeWrapper) this.freezeWrapper();
			this.newOverlay(this.context);
			this.appendContent();
			if (this.config.autoshow) this.show();
			return this;
		},
		getContext : function() {
			try {
				var tagName = $(this.elements)[0].tagName.strToLower();
			} catch(e) {
				var tagName = false;
			};
			switch(tagName) {
				case 'body':
					return $($(this.elements)[0]);
				break;
				default:
					if ($(this.elements)[0]==document) {
						return $('body');
					} else {
						return $('body');
					};
				break;
			}
		},
		/*
		Freeze wrapper - make it unscrollable and untouchable.
		*/
		freezeWrapper: function(callback) {
			var that = this;
			var callback = callback;
			setTimeout(callback, 100);

			var body = $("body");
			/* remember scrollTop */
			this.current.backup = {
				scrollTop: $(this.context).scrollTop()
			};

			/* this variable contains elements that keeps in context node*/
			var not = [];
			// ...
			not = not.join(',');

			/* put all contents of context in freeze-node (wrappers.freezedContainer) */
			$(this.context).children().not(not).wrapAll($('<div />')).tie(function() {
				that.wrappers.freezedContainer = this.parent();
			});


			var contextTagName = $(this.context)[0].tagName.toUpperCase();

			/* Trick for scrollable container. If container has scrollBar then here comes the padding. After making container position absolute, padding disappearing and we see the bad jumping effect. To fix it we must save scrollBar to prevent hiding of padding. */
			if (contextTagName=='BODY') if ($(body).height() > $(window).height()) {
				$("body").css({
					'overflow-y': 'scroll'
				});
			};

			/* if context is not BODY make it position:relative. Becouse freezedContainer will be absolute. */
			if (contextTagName!='BODY') $(this.context).css('position', 'relative');

			/* set style to freezedContainer to make it real freezed */
			$(this.wrappers.freezedContainer).css({
				'position': $(this.context)[0].tagName.toUpperCase() == 'BODY' ? 'fixed' : 'absolute',
				'top': 0,
				'left': 0,
				'width': contextTagName=='BODY' ? '100%' : $(this.context).width(),
				'height': contextTagName=='BODY' ? '100%' : $(this.context).height(),
				'overflow': 'hidden'
			});
			
			/* wrap freezed to another DIV to make fixed scroll */
			$(this.wrappers.freezedContainer).children().not(not).wrapAll($('<div />'));
			$(this.wrappers.freezedContainer).find('>div').css({
				'width': '100%',
				'margin-top': (this.current.backup.scrollTop*-1)+'px'
			});

		},
		/* Unfreeze freezed wrapper content */
		unfreezeWrapper : function() {
			/* Get wrapper tag name */
			var contextTagName = $(this.context)[0].tagName.toUpperCase();

			var that = this;
			
			/* make overflow-y of BODY auto */
			if (contextTagName=='BODY') $(this.context).css({
				'overflow': 'auto'
			});

			/* move all content of context back to wrapper */
			$(this.wrappers.freezedContainer).find('>div').children().appendTo(jQuery(this.context));
			
			/* repair scroll top of context */
			if (contextTagName=='BODY') $(this.context).scrollTop(this.current.backup.scrollTop);

			/* remove Freezed Container */
			$(this.wrappers.freezedContainer).remove();
		},
		newOverlay : function(context) {
			var plugin = this;
			// > get Zindex
			var zindex = Brahma.document.zindex.get();
			
			// > build Nodes
			this.wrappers.overlay = $(context).put($('<div />', {
				'class': 'mb-plugin-overlay'
			}))
			.css(Brahma.api.extend({
				'width': '100%',
				'height': '100%',
				'position': 'fixed',
				'top': '0px',
				'left': '0px',
				'backgroundColor': 'none',
				'backgroundImage': 'none',
				'display': 'none',
				'z-index': zindex
			}, this.config.overlay.style));

			// > build first TABLE
			this.wrappers.table = $(this.wrappers.overlay).put($('<table />', {
				'cellspacing': 0, 
				'cellpadding': 0
			}))
			.css({
				'height': '100%',
				'margin': '0 auto'
			})
			.ramp($('<tbody />'), $('<tr />'))
			.put($('<td />'))
			.css({
				'height': '1%'
			})
			.and($('<td />'))
			.css({
				'height': '100%'
			})
			.tie(function() {

				plugin.wrappers.contentWrapper = $(this).put($('<div />')).css(plugin.config.panel.style).hide()
				.condition(plugin.config["class"], function(c) {
					$(this).addClass(c);
					return this; 
				}, function() { return this; });
				plugin.wrappers.content = $(plugin.wrappers.contentWrapper).put($('<div />'));
			})
			.and($('<td />'))
			.css({
				'height': '1%'
			});
		},
		show : function() {

			var applet = this;
			/*
			Show overlay
			*/
			$(this.wrappers.overlay).fadeIn();
			switch(this.config.effect.type) {
				case 'slide':

					this.effects.slideIn({
						'duration': this.config.effect.duration, 
						'direction': this.config.effect.direction
					}, function() {
						applet.trigger('show');
					});
				break;
				default:
					$(this.wrappers.contentWrapper).show();
					applet.trigger('show');
				break;
			}
			
		},
		appendContent : function() {

			var plugin = this;
			// > append static content
			switch(typeof this.config.content) {
				case 'string':

					this.wrappers.content.html(this.config.content);
					plugin.trigger('ready', [this.wrappers.content]);
				break;
				case 'function':
					this.config.content.call(this, this.wrappers.content);
				break;
			}
			
			// > append url request data
			if (typeof this.config.url == 'string') $(this.wrappers.content).load(this.config.url, function() {
				plugin.trigger('ready', [plugin.wrappers.content]);
			});
			return this;
		},
		html : function() {
			if (arguments.length<1) {
				return this.wrappers.content;
			} else {
				this.wrappers.content.html(arguments[0]);
			}
		},
		hide: function(callback) {
			this.trigger('beforeHide'); // < trigger
			var callback = callback;
			var applet = this;
			switch(this.config.effect.type) {
				case 'slide':
					

					this.effects.slideOut({
						'duration': this.config.effect.duration, 
						'direction': this.config.effect.direction
					}, function() {
						// hide content totaly
						$(applet.wrappers.contentWrapper).hide();	

						// > hide overlay
						$(applet.wrappers.overlay).fadeOut(function() {
							applet.trigger('hide');
							if (typeof callback == "function") callback.apply(applet);
						});	
					});
				break;
				default:
					$(applet.wrappers.overlay).fadeOut();
					
					applet.trigger('hide');
					if (typeof callback == "function") callback.apply(applet);
				break;
			}
		},
		close: function() {
			
			this.hide(function() {
				this.remove();
			});
			

		},
		remove : function() {
			this.trigger('beforeDestroy'); // < trigger
			$(this.wrappers.content).remove();
			if (this.config.freezeWrapper) this.unfreezeWrapper();
			$(this.wrappers.overlay).remove();
			this.destroy();
		},
		destroy : function() {
			$.each(this, function() {
				
				delete this;
			});
		}
	});

	Brahma.applet('overlay').effects = Brahma.module({
		applet: null, 
		_slide: function(options, callback) {
			/* calc distance from eleemnt to the edge */
			var screenHeight = $(this.applet.context).height();
			if (screenHeight==0) screenHeight = $(window).height();

			var screenWidth = $(this.applet.context).width();
			if (screenWidth==0) screenWidth = $(window).width();

			var position = {
				top: (screenHeight-$(this.applet.wrappers.contentWrapper).height())/2,
				left: (screenWidth-$(this.applet.wrappers.contentWrapper).width())/2
			};
			
			var cover = {
				top: position.top+$(this.applet.wrappers.contentWrapper).height(),
				right: (screenWidth-position.left),
				bottom: position.top+$(this.applet.wrappers.contentWrapper).height(),
				left: position.left+$(this.applet.wrappers.contentWrapper).width()
			};

			switch(options.direction) {
				case 'top': options.direction = 0; break;
				case 'right': options.direction = 90; break;
				case 'bottom': options.direction = 180; break;
				case 'left': options.direction = 270; break;
			};

			if (options.direction>=0 && options.direction<90) {
				var calc = Brahma.trigonometria.delta2c1s((cover.right>cover.top) ? cover.right : cover.top, options.direction, 90); 
			};

			if (options.direction>=90 && options.direction<180) {
				var calc = Brahma.trigonometria.delta2c1s((cover.right>cover.bottom) ? cover.right : cover.bottom, options.direction, 90); 
			};

			if (options.direction>=180 && options.direction<270) {
				var calc = Brahma.trigonometria.delta2c1s((cover.left>cover.bottom) ? cover.left : cover.bottom, options.direction, 90); 
			};

			if (options.direction>=270 && options.direction<=359) {
				var calc = Brahma.trigonometria.delta2c1s((cover.left>cover.top) ? cover.left : cover.top, options.direction, 90); 
			};
			
			/* > fix bug for firefox with e-num */
			calc.b = Math.round(calc.b);

			if (options.reverse) { // < reverse motion

				var startX = 0;
				var startY = 0;

				var endX = calc.c;
				var endY = -1*calc.b;	
			} else {

				var startX = calc.c;
				var startY = -1*calc.b;

				var endX = 0;
				var endY = 0;
			};
			

			/* shith to hide */
			var shift = (($(this.applet.context).width()-$(this.applet.wrappers.contentWrapper).outerWidth())/2)+$(this.applet.wrappers.contentWrapper).outerWidth();
			
			var options = Brahma.api.extend({
				direction: options.direction || 0,
				duration: options.duration || 450
			}, options || {});

			console.log(startX, startY);
			Brahma(this.applet.wrappers.contentWrapper).applet('transit')
			.jump({
				x: startX,
				y: startY
			})
			.withSelector(function() {
				$(this).show();
			})
			.animate({
				x: endX,
				y: endY
			}, options.duration, (typeof callback == 'function' ? callback : false));
		},
		slideIn: function(options, callback) {
			options.reverse = false;

			this._slide(options, callback);
		},
		slideOut: function(options, callback) {
			var callback = callback;
			var applet = this.applet;
			options.reverse = true;
			this._slide(options, function() {
				$(applet.wrappers.contentWrapper).hide();	
				callback();
			});
		}
	});

}, ['brahma.jquerybridge', 'brahma.trigonometria', 'brahma.transit']);
