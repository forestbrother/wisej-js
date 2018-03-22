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
 * wisej.web.RadioButton
 * 
 * Disables the automatic checking/unchecking to let
 * the server side handle the flipping of the control.
 */
qx.Class.define("wisej.web.RadioButton", {

	extend: qx.ui.form.RadioButton,

	// All Wisej components must include this mixin
	// to provide services to the Wisej core.
	include: [wisej.mixin.MWisejControl, wisej.mixin.MShortcutTarget],

	construct: function (text) {

		this.base(arguments, text);

		// we use the grid layout to align 
		// the content according to wisej extended rules.
		this._getLayout().dispose();
		var layout = new qx.ui.layout.Grid(0);
		layout.setRowFlex(2, 1);
		layout.setRowFlex(3, 1);
		layout.setColumnFlex(2, 1);
		this._setLayout(layout);

		this._forwardStates.rightAligned = true;

		this.initCheckAlign();
		this.initTextAlign();

	},

	properties: {

		// Rich override
		rich: { init: true, refine: true },

		/**
		 * Checked state.
		 */
		checked: { init: false, check: "Boolean", apply: "_applyChecked" },

		/**
		 * Label text.
		 */
		text: { init: null, check: "String", apply: "_applyText" },

		/**
		 * AutoEllipsis property.
		 *
		 * Sets the auto-ellipsis style.
		 */
		autoEllipsis: { init: false, check: "Boolean", apply: "_applyAutoEllipsis" },

		/**
		 * CheckAlign property.
		 *
		 * Gets or sets the horizontal and vertical alignment of the check mark.
		 */
		checkAlign: {
			themeable: true,
			init: "middleLeft",
			apply: "_applyCheckAlign",
			check: ["topRight", "middleRight", "bottomRight", "topLeft", "topCenter", "middleLeft", "middleCenter", "bottomLeft", "bottomCenter"]
		},

		/**
		 * TextAlign property.
		 *
		 * Gets or sets the alignment of the text.
		 */
		textAlign: {
			themeable: true,
			init: "middleLeft",
			apply: "_applyTextAlign",
			check: ["topRight", "middleRight", "bottomRight", "topLeft", "topCenter", "middleLeft", "middleCenter", "bottomLeft", "bottomCenter"]
		},

		/**
		 * CheckedTextColor property.
		 *
		 * Gets or sets the text color to use when the radiobutton is checked.
		 */
		checkedTextColor: { init: null, check: "Color", nullable: true, themeable: true }
	},

	members: {

		/**
		 * Focuses and check/unchecks the radiobutton when the mnemonic is pressed.
		 *
		 * @param list {Array} List of widgets that qualified for the same mnemonic.
		 * @param index {Integer} Index of this widget in the mnemonic list.
		 */
		executeMnemonic: function (list, index) {

			if (!this.isEnabled() || !this.isVisible())
				return false;

			// ignore if this radiobutton is already focused
			// and there are other radiobuttons
			// with the same mnemonic.
			var handler = qx.ui.core.FocusHandler.getInstance();
			if (handler && handler.isFocused(this) && list.length > 1)
				return false;

			// execute.
			this.focus();
			this.execute();
			return true;
		},

		// Override the execute method to disable the automatic check/uncheck behavior.
		// It is handled on the server side.
		_onExecute: function (e) {

		},

		/**
		 * Event listener for the "keyPress" event.
		 *
		 * Selects the previous RadioButton when pressing "Left" or "Up" and
		 * Selects the next RadioButton when pressing "Right" and "Down"
		 *
		 * @param e {qx.event.type.KeySequence} KeyPress event
		 */
		_onKeyPress: function (e) {

			switch (e.getKeyIdentifier()) {
				case "Left":
				case "Up":
					this.selectPrevious();
					break;

				case "Right":
				case "Down":
					this.selectNext();
					break;
			}
		},

		/**
		 * Checks the next radio button in the container.
		 */
		selectNext: function () {

			var parent = this.getLayoutParent();
			if (!parent || !parent.getChildren)
				return;

			var items = parent.getChildren();
			var index = items.indexOf(this);
			if (index == -1)
				return;

			var i = 0;
			var length = items.length;

			// find next enabled item.
			index = (index + 1) % length;

			while (i < length && (!items[index].isEnabled() || !items[index].isVisible())) {
				index = (index + 1) % length;
				i++;
			}

			var next = items[index];
			if (next && next != this && next.isFocusable() && next instanceof qx.ui.form.RadioButton) {
				next.focus();
				next.execute();
			}
		},

		/**
		 * Checks the previous radio button in the container.
		 */
		selectPrevious: function () {

			var parent = this.getLayoutParent();
			if (!parent || !parent.getChildren)
				return;

			var items = parent.getChildren();
			var index = items.indexOf(this);
			if (index == -1)
				return;

			var i = 0;
			var length = items.length;

			// find previous enabled item.
			index = (index - 1 + length) % length;

			while (i < length && (!items[index].isEnabled() || !items[index].isVisible())) {
				index = (index - 1 + length) % length;
				i++;
			}

			var prev = items[index];
			if (prev && prev != this && prev.isFocusable() && prev instanceof qx.ui.form.RadioButton) {
				prev.focus();
				prev.execute();
			}
		},

		/**
		 * Applies the checked property.
		 *
		 */
		_applyChecked: function (value, old) {

			this.setValue(value);

		},

		// overridden to apply the checkedTextColor when set.
		_applyValue: function (value, old) {

			this.base(arguments, value, old);

			var color = this.getCheckedTextColor();
			if (color) {
				if (value)
					this.getChildControl("label").setTextColor(color);
				else
					this.getChildControl("label").resetTextColor();
			}
		},

		/**
		 * Applies the text property.
		 *
		 * Wired to the boxLabel property.
		 */
		_applyText: function (value, old) {

			this.setLabel(value);
			this.setShow(value > "" ? "both" : "icon");
		},

		/**
		 * Applies the autoEllipsis property.
		 */
		_applyAutoEllipsis: function (value, old) {

			var label = this.getChildControl("label");
			var el = label.getContentElement();

			label.setWrap(!value);
			el.setStyle("textOverflow", value ? "ellipsis" : null);
		},

		// overridden and disabled.
		_applyCenter: function (value, old) {
		},

		/**
		 * Applies the checkAlign property.
		 */
		_applyCheckAlign: function (value, old) {

			var icon = this.getChildControl("icon");

			// default to middle left.
			var alignX = "left";
			var alignY = "middle";
			var rowCol = { row: 2, column: 0 };

			if (old)
				this.removeState("rightAligned");

			if (value) {

				switch (value) {

					case "topLeft":
						rowCol = { row: 0, column: 0 };
						break;
					case "topCenter":
						alignX = "center";
						rowCol = { row: 0, column: 2 };
						break;
					case "topRight":
						alignX = "right";
						rowCol = { row: 0, column: 4 };
						break;

					case "middleLeft":
						rowCol = { row: 2, column: 0 };
						break;
					case "middleCenter":
						alignX = "center";
						rowCol = { row: 2, column: 2 };
						break;
					case "middleRight":
						alignX = "right";
						rowCol = { row: 2, column: 4 };
						break;

					case "bottomLeft":
						rowCol = { row: 5, column: 0 };
						break;
					case "bottomCenter":
						alignX = "center";
						rowCol = { row: 5, column: 2 };
						break;
					case "bottomRight":
						alignX = "right";
						rowCol = { row: 5, column: 4 };
						break;
				}

				if (alignX == "right")
					this.addState("rightAligned");

				icon.setAlignX(alignX);
				icon.setAlignY(alignY);
				icon.setLayoutProperties(rowCol);
			}
		},

		/**
		 * Applies the TextAlign property.
		 */
		_applyTextAlign: function (value, old) {

			var icon = this.getChildControl("icon");
			var label = this.getChildControl("label");

			// default to middle center.
			var alignX = "left";
			var alignY = "middle";
			var rowCol = { row: 0, column: 1 };

			if (value) {

				switch (value) {

					case "topLeft":
						rowCol = { row: 0, column: 1 };
						break;

					case "topCenter":
						alignX = "center";
						rowCol = { row: 0, column: 2 };

						// adjust the position if the icon and the label
						// are in the same cell.
						if (this.getCheckAlign() == value) {
							rowCol.row++;
							alignY = "top";
						}
						break;
					case "topRight":
						alignX = "right";
						rowCol = { row: 0, column: 3 };
						break;

					case "middleLeft":
						rowCol = { row: 2, column: 1 };
						break;
					case "middleCenter":
						alignX = "center";
						rowCol = { row: 2, column: 2 };

						// adjust the position if the icon and the label
						// are in the same cell.
						if (this.getCheckAlign() == value) {
							rowCol.row++;
							alignY = "top";
							icon.setAlignY("bottom");
						}
						break;
					case "middleRight":
						alignX = "right";
						rowCol = { row: 2, column: 3 };
						break;

					case "bottomLeft":
						rowCol = { row: 5, column: 1 };
						break;
					case "bottomCenter":
						alignX = "center";
						rowCol = { row: 5, column: 2 };

						// adjust the position if the icon and the label
						// are in the same cell.
						if (this.getCheckAlign() == value) {
							rowCol.row--;
							alignY = "bottom";
						}
						break;
					case "bottomRight":
						alignX = "right";
						rowCol = { row: 5, column: 3 };
						break;
				}

				label.setAlignX(alignX);
				label.setAlignY(alignY);
				label.setLayoutProperties(rowCol);
			}
		},

		// overridden
		_createChildControlImpl: function (id, hash) {
			var control;

			switch (id) {

				case "label":
					control = this.base(arguments, id, hash).set({
						alignX: "left",
						alignY: "middle"
					});
					control.setLayoutProperties({ row: 3, column: 1 });
					break;

				case "icon":
					control = this.base(arguments, id, hash).set({
						alignX: "left",
						alignY: "middle"
					});
					control.setLayoutProperties({ row: 2, column: 0 });
					break;
			}

			return control || this.base(arguments, id);
		},
	}

});
