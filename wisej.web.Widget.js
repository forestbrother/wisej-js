﻿///////////////////////////////////////////////////////////////////////////////
//
// (C) 2015 ICE TEA GROUP LLC - ALL RIGHTS RESERVED
//
// 
//
// ALL INFORMATION CONTAINED HEREIN IS, AND REMAINS
// THE PROPERTY OF ICE TEA GROUP LLC AND ITS SUPPLIERS, IF ANY.
// THE INTELLECTUAL PROPERTY AND TECHNICAL CONCEPTS CONTAINED
// HEREIN ARE PROPRIETARY TO ICE TEA GROUP LLC AND ITS SUPPLIERS
// AND MAY BE COVERED BY U.S. AND FOREIGN PATENTS, PATENT IN PROCESS, AND
// ARE PROTECTED BY TRADE SECRET OR COPYRIGHT LAW.
//
// DISSEMINATION OF THIS INFORMATION OR REPRODUCTION OF THIS MATERIAL
// IS STRICTLY FORBIDDEN UNLESS PRIOR WRITTEN PERMISSION IS OBTAINED
// FROM ICE TEA GROUP LLC.
//
///////////////////////////////////////////////////////////////////////////////

/**
 * wisej.web.Widget
 * 
 * Generic widget wrapper good for most javascript widgets.
 */
qx.Class.define("wisej.web.Widget", {

	extend: qx.ui.core.Widget,

	// All Wisej components must include this mixin
	// to provide services to the Wisej core.
	include: [
		wisej.mixin.MWisejControl,
		wisej.mixin.MBorderStyle
	],

	properties: {

		/**
		 * Packages property.
		 */
		packages: { init: [], check: "Array" },

		/**
		 * InitScript property.
		 */
		initScript: { init: "", check: "String", apply: "_applyInitScript" },

		/**
		 * Options property.
		 */
		options: { init: null, check: "Map", apply: "_applyOptions" },

		/**
		 * PostbackUrl property.
		 */
		postbackUrl: { init: "", check: "String" },

	},

	construct: function () {

		this.base(arguments);

		this.addListenerOnce("appear", this.__onAppear);
	},

	members: {

		// reference to the container dom element that
		// can be used by custom widgets to render themselves in.
		container: null,

		// the inner element used as the container for the widgets.
		__containerEl: null,

		/**
		 * Fires a "widgetEvent" with the specified data.
		 *
		 * @param type {String} the event type.
		 * @param data {Map} The event data map.
		 */
		fireWidgetEvent: function (type, data) {

			this.fireDataEvent("widgetEvent", { type: type, data: data });

		},

		/**
		 * Loads the packages asynchronously.
		 */
		__loadPackages: function (callback) {

			var me = this,
				list = [],
				packages = this.getPackages();

			for (var index = 0; index < packages.length; index++) {

				var pkg = packages[index];
				if (pkg.name && pkg.source) {
					list.push({ id: pkg.name, url: pkg.source });
				}
			}

			if (list.length > 0) {
				wisej.utils.Loader.load(list, function (result) {
					if (callback)
						callback.call(me, result);
				});
			}
			else {
				if (callback)
					callback.call(me, "complete");
			}
		},

		/**
		 * Applies the initScript property.
		 */
		_applyInitScript: function (value, old) {

			// apply the initialization script to the widget.
			var script = value;
			if (script) {
				var func = new Function(script);
				func.call(this);
			}

			// rerun the script only if the widget has already been rendered.
			if (this.container) {
				this.__renderWidget();
			}
		},

		/**
		 * Applies the options property.
		 *
		 * Calls the user defined update(options) function if present.
		 */
		_applyOptions: function (value, old) {

			if (this.container) {
				if (this.update)
					this.update(this.getOptions() || {});
			}
		},

		/**
		 * Renders the third party widget into this element
		 * after the dom has been created.
		 */
		__onAppear: function () {

			if (wisej.web.DesignMode)
				return;

			this.__loadPackages(function () {
				this.__renderWidget();
			});

		},

		// overridden
		renderLayout: function (left, top, width, height) {

			 //force the size of the container element
			 //immediately to let the third party widget
			 //adjust itself - otherwise it would be a step behind
			 //due to the element flushing queues.
			this.__containerEl.setStyles({
				width: width + "px",
				height: height + "px"
			}, true);

			return this.base(arguments, left, top, width, height);
		},

		/**
		 * Renders the third party widget into this element.
		 *
		 * @return {Boolean | undefined} When in design mode, if this function returns true it will suppress the "render" event.
		 *								 This means that the widget startup script is responsible for firing "render", otherwise the designer will time out.
		 */
		__renderWidget: function () {

			try {
				// save the reference to the DOM element
				// to the "this.container" field to be used
				// in the init script.
				this.container = this.__containerEl.getDomElement();
				this.container.setAttribute("id", this.getId() + "_container");

				// invoke the custom initialization.
				if (this.init) {
					this.init(this.getOptions() || {});
				}
			}
			catch (e) {

				if (this.container)
					this.container.innerText = e.message;
			}

			this._onInitialized();
		},

		// fires the "render" event when in design mode to notify
		// the html renderer that the widget has been initialized.
		//
		// widgets may replace this function to fire the "render" event
		// according to the widget's implementation.
		//
		_onInitialized: function () {

			if (wisej.web.DesignMode)
				this.fireEvent("render");
		},

		// overridden to prevent the "render" event.
		// it will be fired in the onLoaded handler.
		_onDesignRender: function () {

			this.__loadPackages(function (result) {
				this.__renderWidget();
			});
		},

		/**
		 * Creates the content element. The style properties
		 * position and zIndex are modified from the Widget
		 * core.
		 *
		 * This function may be overridden to customize a class
		 * content.
		 *
		 * @return {qx.html.Element} The widget's content element
		 */
		_createContentElement: function () {

			var el = new qx.html.Element("div", {
				overflowX: "hidden",
				overflowY: "hidden"
			});

			// this an inner div element that can be used by the
			// third party widget directly without interfering with
			// the element managed by our library.
			this.__containerEl = new qx.html.Element("div", {
				width: "100%",
				height: "100%"
			});

			el.add(this.__containerEl);

			return el;
		},

	},

	// let implementations handle the destruction of the widget
	// to clean up resources.
	destruct: function () {

		if (this._onDestroyed)
			this._onDestroyed();
	}

});