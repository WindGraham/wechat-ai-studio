/*
Copyright 2017 Ziadin Givan

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "原样" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

https://github.com/givanz/Vvvebjs
*/

bgcolorClasses = ["bg-primary", "bg-secondary", "bg-success", "bg-danger", "bg-warning", "bg-info", "bg-body-secondary", "bg-dark", "bg-white"]

bgcolorSelectOptions = [{
	value: "默认",
	text: ""
},{
	value: "bg-primary",
	text: "Primary"
},{
	value: "bg-secondary",
	text: "Secondary"
},{
	value: "bg-success",
	text: "Success"
},{
	value: "bg-danger",
	text: "Danger"
},{
	value: "bg-warning",
	text: "Warning"
},{
	value: "bg-info",
	text: "Info"
},{
	value: "bg-body-secondary",
	text: "Light"
},{
	value: "bg-dark",
	text: "Dark"
},{
	value: "bg-white",
	text: "White"
}];

function changeNodeName(node, newNodeName) {
	let newNode;
	newNode = document.createElement(newNodeName);
	attributes = node.attributes;
	
	for (i = 0, len = attributes.length; i < len; i++) {
		newNode.setAttribute(attributes[i].nodeName, attributes[i].nodeValue);
	}

	while (node.hasChildNodes()) {
		newNode.appendChild(node.removeChild(node.firstChild))
	}

	node.replaceWith(newNode);
	
	return newNode;
}

let base_sort = 1000;//start sorting for base component from 100 to allow extended properties to be first
let style_section = 'style';
let advanced_section = 'advanced';

Vvveb.Components.add("_base", {
    name: "Element",
	properties: [{
        key: "element_header",
        inputtype: SectionInput,
        name:false,
        sort:base_sort++,
        data: {header:"General"},
    },{
        name: "Id",
        key: "id",
        htmlAttr: "id",
        sort: base_sort++,
        inline:false,
        col:6,
        inputtype: TextInput
    },{
        name: "标题",
        key: "title",
        htmlAttr: "title",
        sort: base_sort++,
        inline:false,
        col:6,
        inputtype: TextInput
    },{
        name: "Class",
        key: "class",
        htmlAttr: "class",
        sort: base_sort++,
        inline:false,
        col:12,
		inputtype: TagsInput,
		data: {
			allowFreeText:true,
			//get all classes used on the page
			data:[...[...document.querySelectorAll("[class]")].reduce((s, e) =>
				(e.classList.forEach(c => s.add(c)), s), new Set())].sort(),
		},
    }
   ]
});    

//display
Vvveb.Components.extend("_base", "_base", {
	 properties: [{
        key: "display_header",
        inputtype: SectionInput,
        name:false,
        sort: base_sort++,
		section: style_section,
        data: {header:"Display"},
     },{
		//linked styles notice message
		name:"",
		key: "linked_styles_check",
        sort: base_sort++,
        section: style_section,
        inline:false,
        col:12,
        inputtype: NoticeInput,
        data: {
			type:'warning',
			title:'Linked styles',
			text:'This element shares styles with other <a class="linked-elements-hover" href="javascript:void()"><b class="elements-count">4</b> elements</a>, to apply styles <b>only for this element</b> enter a <b>unique id</b> eg: <i>marketing-heading</i> in in <br/><a class="id-input" href="#content-tab" role="tab" aria-controls="components" aria-selected="false" href="#content-tab">Content > General > Id</a>.<br/><span class="text-muted small"></span>',
		},
		afterInit:function(node, inputElement) {
			let selector = Vvveb.StyleManager.getSelectorForElement(node);
			let elements = window.FrameDocument.querySelectorAll(selector);

			if (elements.length <= 1) {
				if (inputElement.style) {
					inputElement.style.display = "none";
				}
			} else {
				inputElement.style.display = "";
				inputElement.querySelector(".elements-count").innerHTML = elements.length;
				inputElement.querySelector(".text-muted").innerHTML = selector;
				
				inputElement.querySelector(".id-input", inputElement).addEventListener("click", (event) => {
					document.querySelectorAll(".content-tab a").forEach(e => e.click());
					
					setTimeout(function () { 
						let idInput = document.querySelectorAll("[name=id]");
						idInput.forEach(el => {if (el.offsetParent) el.focus()});/*
						idInput.forEach(el => el .dispatchEvent(new FocusEvent("focusin", {
							bubbles: true,
							cancelable: false
						})));*/
					}, 700);
					
					event.preventDefault();
					return false;
				});
				
				inputElement.querySelector(".linked-elements-hover").addEventListener("mouseenter", function (){
					elements.forEach( e => e.style.outline = "2px dotted blue");
				});
				
				inputElement.querySelector(".linked-elements-hover").addEventListener("mouseleave", function (){
					elements.forEach( e => e.style.outline = "");
				});
			}
		},	 
    },{
        name: "显示",
        key: "display",
        htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: SelectInput,
        validValues: ["block", "inline", "inline-block", "none"],
        data: {
            options: [{
                value: "block",
                text: "Block"
            },{
                value: "inline",
                text: "Inline"
            },{
                value: "inline-block",
                text: "Inline Block"
            },{
                value: "inline-block",
                text: "Inline Block"
            },{
                value: "flex",
                text: "Flex"
            },{
                value: "inline-flex",
                text: "Inline Flex"
            },{
                value: "grid",
                text: "Grid"
            },{
                value: "inline-grid",
                text: "Inline grid"
            },{
                value: "table",
                text: "Table"
            },{
                value: "table-row",
                text: "Table Row"
            },{
                value: "list-item",
                text: "List Item"
            },{
                value: "inherit",
                text: "Inherit"
            },{
                value: "initial",
                text: "Initial"
            },{
                value: "none",
                text: "none"
            }]
        }
    },{
        name: "定位",
        key: "position",
        htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: SelectInput,
        validValues: ["static", "fixed", "relative", "absolute"],
        data: {
            options: [{
                value: "static",
                text: "Static"
            },{
                value: "fixed",
                text: "Fixed"
            },{
                value: "relative",
                text: "Relative"
            },{
                value: "absolute",
                text: "Absolute"
            }]
        }
    },{
        name: "上",
        key: "top",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        parent:"",
        inputtype: CssUnitInput
	},{
        name: "左",
        key: "left",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        parent:"",
        inputtype: CssUnitInput
    },{
        name: "下",
        key: "bottom",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        parent:"",
        inputtype: CssUnitInput
	},{
        name: "右",
        key: "right",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        parent:"",
        inputtype: CssUnitInput
    },{
        name: "浮动",
        key: "float",
        htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:12,
        inline:false,
        inputtype: RadioButtonInput,
        data: {
			extraclass:"btn-group-sm btn-group-fullwidth",
            options: [{
                value: "none",
                icon:"la la-times",
                //text: "None",
                title: "None",
                checked:true,
            },{
                value: "left",
                //text: "Left",
                title: "Left",
                icon:"la la-align-left",
                checked:false,
            },{
                value: "right",
                //text: "Right",
                title: "Right",
                icon:"la la-align-right",
                checked:false,
            }],
         }
	},{
        name: "透明度",
        key: "opacity",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:12,
		inline:false,
        parent:"",
        inputtype: RangeInput,
        data:{
			max: 1, //max zoom level
			min:0,
			step:0.1
       },
	},{
        name: "背景",
        key: "background-color",
        sort: base_sort++,
		section: style_section,
        col:12,
		inline:true,
		htmlAttr: "style",
        inputtype: ColorInput,
	},{
        name: "Text Color",
        key: "color",
        sort: base_sort++,
		section: style_section,
        col:12,
		inline:true,
		htmlAttr: "style",
        inputtype: ColorInput,
  	}]
});    

//Typography
let ComponentBaseTypography = {
	 properties: [{
		key: "typography_header",
		inputtype: SectionInput,
		name:false,
		sort: base_sort++,
		section: style_section,
		data: {header:"Typography"},
 
	},{
        name: "字号",
        key: "font-size",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
	},{
        name: "字重",
        key: "font-weight",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: SelectInput,
        data: {
			options: [{
				value: "",
				text: "默认"
			},{	
				value: "100",
				text: "Thin"
			},{
				value: "200",
				text: "Extra-Light"
			},{
				value: "300",
				text: "Light"
			},{
				value: "400",
				text: "Normal"
			},{
				value: "500",
				text: "Medium"
			},{
				value: "600",
				text: "Semi-Bold"
			},{
				value: "700",
				text: "Bold"
			},{
				value: "800",
				text: "Extra-Bold"
			},{
				value: "900",
				text: "Ultra-Bold"
			}],
		}
    },{
        name: "字体",
        key: "font-family",
	htmlAttr: "style",
        sort: base_sort++,
	section: style_section,
        col:12,
	inline:false,
        inputtype: SelectInput,
        data: {
			options: fontList
		}
	},{
        name: "文字对齐",
        key: "text-align",
        htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:12,
        inline:false,
        inputtype: RadioButtonInput,
        data: {
			extraclass:"btn-group-sm btn-group-fullwidth",
            options: [{
                value: "",
                icon:"la la-times",
                //text: "None",
                title: "None",
                checked:true,
            },{
                value: "left",
                //text: "Left",
                title: "Left",
                icon:"la la-align-left",
                checked:false,
            },{
                value: "center",
                //text: "Center",
                title: "Center",
                icon:"la la-align-center",
                checked:false,
            },{
                value: "right",
                //text: "Right",
                title: "Right",
                icon:"la la-align-right",
                checked:false,
            },{
                value: "justify",
                //text: "justify",
                title: "Justify",
                icon:"la la-align-justify",
                checked:false,
            }],
        },
	},{
        name: "行高",
        key: "line-height",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
	},{
        name: "字间距",
        key: "letter-spacing",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
	},{
        name: "Text decoration",
        key: "text-decoration-line",
        htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:12,
        inline:false,
        inputtype: RadioButtonInput,
        data: {
			extraclass:"btn-group-sm btn-group-fullwidth",
            options: [{
                value: "none",
                icon:"la la-times",
                //text: "None",
                title: "None",
                checked:true,
            },{
                value: "underline",
                //text: "Left",
                title: "underline",
                icon:"la la-long-arrow-alt-down",
                checked:false,
            },{
                value: "overline",
                //text: "Right",
                title: "overline",
                icon:"la la-long-arrow-alt-up",
                checked:false,
            },{
                value: "line-through",
                //text: "Right",
                title: "Line Through",
                icon:"la la-strikethrough",
                checked:false,
            },{
                value: "underline overline",
                //text: "justify",
                title: "Underline Overline",
                icon:"la la-arrows-alt-v",
                checked:false,
            }],
        },
	},{
        name: "Decoration Color",
        key: "text-decoration-color",
        sort: base_sort++,
		section: style_section,
        col:12,
		inline:true,
		htmlAttr: "style",
        inputtype: ColorInput,
	},{
        name: "Decoration style",
        key: "text-decoration-style",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:12,
		inline:true,
        inputtype: SelectInput,
        data: {
			options: [{
				value: "",
				text: "默认"
			},{	
				value: "solid",
				text: "Solid"
			},{
				value: "wavy",
				text: "Wavy"
			},{
				value: "dotted",
				text: "Dotted"
			},{
				value: "dashed",
				text: "Dashed"
			},{
				value: "double",
				text: "Double"
			}],
		}
  }]
}

Vvveb.Components.extend("_base", "_base", ComponentBaseTypography);
    
//Size
let ComponentBaseSize = {
	 properties: [{
		key: "size_header",
		inputtype: SectionInput,
		name:false,
		sort: base_sort++,
		section: style_section,
		data: {header:"Size", expanded:false},
	},{
        name: "宽度",
        key: "width",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
	},{
        name: "高度",
        key: "height",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
	},{
        name: "Min Width",
        key: "min-width",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
	},{
        name: "Min Height",
        key: "min-height",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
	},{
        name: "Max Width",
        key: "max-width",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
	},{
        name: "Max Height",
        key: "max-height",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
    }]
}

Vvveb.Components.extend("_base", "_base", ComponentBaseSize);

//Margin
let ComponentBaseMargin = {
	 properties: [{
		key: "margins_header",
		inputtype: SectionInput,
		name:false,
		sort: base_sort++,
		section: style_section,
		data: {header:"Margin", expanded:false},
	},{
        name: "上",
        key: "margin-top",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
	},{
        name: "右",
        key: "margin-right",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
    },{
        name: "下",
        key: "margin-bottom",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
    },{
        name: "左",
        key: "margin-left",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
    }]
}

Vvveb.Components.extend("_base", "_base", ComponentBaseMargin);

//Padding
let ComponentBasePadding = {

	 properties: [{
		key: "paddings_header",
		inputtype: SectionInput,
		name:false,
		sort: base_sort++,
		section: style_section,
		data: {header:"Padding", expanded:false},
	},{
        name: "上",
        key: "padding-top",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
	},{
        name: "右",
        key: "padding-right",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
    },{
        name: "下",
        key: "padding-bottom",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
    },{
        name: "左",
        key: "padding-left",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
    }]
}

Vvveb.Components.extend("_base", "_base", ComponentBasePadding);


//Border
Vvveb.Components.extend("_base", "_base", {
	 properties: [{
		key: "border_header",
		inputtype: SectionInput,
		name:false,
		sort: base_sort++,
		section: style_section,
		data: {header:"Border", expanded:false},
	 },{        
        name: "样式",
        key: "border-style",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:12,
		inline:false,
        inputtype: SelectInput,
        data: {
			options: [{
				value: "",
				text: "默认"
			},{	
				value: "solid",
				text: "Solid"
			},{
				value: "dotted",
				text: "Dotted"
			},{
				value: "dashed",
				text: "Dashed"
			}],
		}
	},{
        name: "宽度",
        key: "border-width",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
   	},{
        name: "颜色",
        key: "border-color",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
		htmlAttr: "style",
        inputtype: ColorInput,
	}]
});    



//Border radius
Vvveb.Components.extend("_base", "_base", {
	 properties: [{
		key: "border_radius_header",
		inputtype: SectionInput,
		name:false,
		sort: base_sort++,
		section: style_section,
		data: {header:"Border radius", expanded:false},
	},{
        name: "Top Left",
        key: "border-top-left-radius",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
	},{
        name: "Top Right",
        key: "border-top-right-radius",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
    },{
        name: "Bottom Left",
        key: "border-bottom-left-radius",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
    },{
        name: "Bottom Right",
        key: "border-bottom-right-radius",
		htmlAttr: "style",
        sort: base_sort++,
		section: style_section,
        col:6,
		inline:false,
        inputtype: CssUnitInput
    }]
});    

//Background image
Vvveb.Components.extend("_base", "_base", {
	 properties: [{
		key: "background_image_header",
		inputtype: SectionInput,
		name:false,
		sort: base_sort++,
		section: style_section,
		data: {header:"Background Image", expanded:false},
	 },{
        name: "图片",
        key: "Image",
        sort: base_sort++,
		section: style_section,
		//htmlAttr: "style",
        inputtype: ImageInput,
        
        init: function(node) {
			let image = node.style.backgroundImage.replace(/url\(['"]?([^"\)$]+?)['"]?\).*/, '$1');
			return image;
        },

		onChange: function(node, value) {
			
			Vvveb.StyleManager.setStyle(node, "background-image", 'url(' + value + ')');
			
			return node;
		}        

   	},{
        name: "Repeat",
        key: "background-repeat",
        sort: base_sort++,
		section: style_section,
		htmlAttr: "style",
        inputtype: SelectInput,
        data: {
			options: [{
				value: "",
				text: "默认"
			},{	
				value: "repeat-x",
				text: "repeat-x"
			},{
				value: "repeat-y",
				text: "repeat-y"
			},{
				value: "no-repeat",
				text: "no-repeat"
			}],
		}
   	},{
        name: "尺寸",
        key: "background-size",
        sort: base_sort++,
		section: style_section,
		htmlAttr: "style",
        inputtype: SelectInput,
        data: {
			options: [{
				value: "",
				text: "默认"
			},{	
				value: "contain",
				text: "contain"
			},{
				value: "cover",
				text: "cover"
			}],
		}
   	},{
        name: "Position x",
        key: "background-position-x",
        sort: base_sort++,
		section: style_section,
		htmlAttr: "style",
        col:6,
		inline:false,
		inputtype: SelectInput,
        data: {
			options: [{
				value: "",
				text: "默认"
			},{	
				value: "center",
				text: "center"
			},{	
				value: "right",
				text: "right"
			},{
				value: "left",
				text: "left"
			}],
		}
   	},{
        name: "Position y",
        key: "background-position-y",
        sort: base_sort++,
		section: style_section,
		htmlAttr: "style",
        col:6,
		inline:false,
		inputtype: SelectInput,
        data: {
			options: [{
				value: "",
				text: "默认"
			},{	
				value: "center",
				text: "center"
			},{	
				value: "top",
				text: "top"
			},{
				value: "bottom",
				text: "bottom"
			}],
		}
    }]
});    


//Device visibility
let ComponentDeviceVisibility = {
	 properties: [{
		key: "visibility_header",
		inputtype: SectionInput,
		name:false,
		sort: base_sort++,
		section: advanced_section,
		data: {header:"Hide based on device screen width"},
	},{
        name: "Extra small devices",
        key: "hidexs",
        col:6,
		inline:true,
		sort: base_sort++,
		section: advanced_section,
        htmlAttr: "class",
        validValues: ["d-xs-none"],
        inputtype: ToggleInput,
        data: {
            on: "d-xs-none",
            off: ""
        }
	},{
        name: "Small devices",
        key: "hidesm",
        col:6,
		inline:true,
		sort: base_sort++,
		section: advanced_section,
        htmlAttr: "class",
        validValues: ["d-sm-none"],
        inputtype: ToggleInput,
        data: {
            on: "d-sm-none",
            off: ""
        }
	},{
        name: "Medium devices",
        key: "hidemd",
        col:6,
		inline:true,
		sort: base_sort++,
		section: advanced_section,
        htmlAttr: "class",
        validValues: ["d-md-none"],
        inputtype: ToggleInput,
        data: {
            on: "d-md-none",
            off: ""
        }
	},{
        name: "Large devices",
        key: "hidelg",
        col:6,
		inline:true,
		sort: base_sort++,
		section: advanced_section,
        htmlAttr: "class",
        validValues: ["d-lg-none"],
        inputtype: ToggleInput,
        data: {
            on: "d-lg-none",
            off: ""
        }
	},{
        name: "Xl devices",
        key: "hidexl",
        col:6,
		inline:true,
		sort: base_sort++,
		section: advanced_section,
        htmlAttr: "class",
        validValues: ["d-xl-none"],
        inputtype: ToggleInput,
        data: {
            on: "d-xl-none",
            off: ""
        }
	},{
        name: "Xxl devices",
        key: "hidexxl",
        col:6,
		inline:true,
		sort: base_sort++,
		section: advanced_section,
        htmlAttr: "class",
        validValues: ["d-xxl-none"],
        inputtype: ToggleInput,
        data: {
            on: "d-xxl-none",
            off: ""
        }
    }]
};

Vvveb.Components.extend("_base", "_base", ComponentDeviceVisibility);


Vvveb.Components.add("config/bootstrap", {
    name: "Bootstrap变量",
	beforeInit: function (node) {
		properties = [];
		let i = 0;
		let j = 0;

		let cssVars = Vvveb.ColorPaletteManager.getAllCSSVariableNames(window.FrameDocument.styleSheets/*, ":root"*/);
		
		for (type in cssVars) {
			properties.push({
				key: "cssVars" + type,
				inputtype: SectionInput,
				name:type,
				sort: base_sort++,
				data: {header:type[0].toUpperCase() + type.slice(1)},
			});
			
			for (selector in cssVars[type]) {
				
				let friendlyName = selector.replaceAll(/--bs-/g,"").replaceAll("-", " ").trim();  
				friendlyName = friendlyName[0].toUpperCase() + friendlyName.slice(1);

				let value = cssVars[type][selector];
				let input;
				
				data = {selector, type:value.type, step:"any"};
				
				if (value.type == "color") {
					input = ColorInput;
				} else if (value.type == "font") {
					input = SelectInput;
					data.options = fontList;
				} else if (value.type == "dimensions") {
					input = CssUnitInput;
				}

				i++;
				properties.push({
					name: friendlyName,
					key: "cssvar" + i,
					defaultValue: value.value,
					//index: i - 1,
					columnNode: this,
					col:(value.type == "font" || value.type == "dimensions") ? 12 : 6,
					inline:(value.type == "font" || value.type == "dimensions") ? false : false,
					section: advanced_section,
					inputtype: input,
					data: data,
					onChange: function(node, value, input) {
						
						if (this.data.type == "font") {
							let option = input.options[input.selectedIndex];
							Vvveb.FontsManager.addFont(option.dataset.provider, value, node[0]);
						}

						Vvveb.StyleManager.setStyle(":root", this.data.selector, value);
						
						return node;
					},	
				});
			}
		}
		
		this.properties = properties;
		return node;
	},
	properties: [],
});
