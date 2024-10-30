(function() {
    tinymce.PluginManager.add( 'inteliChatPlugin', function( editor, url ) {
		if(typeof intelichat_configs == 'undefined' || intelichat_configs.api_key == '') { return; }
		
        editor.addButton('inteliChatPlugin', {
            title: 'Add Intelichat Contentbot',
	    text: ' Intelichat',
			image: intelichat_configs.plugin_dir + 'admin/images/editor_icon.png',
			onclick: function() {
				if(intelichat_configs.api_results == null) {
					intelichat_loadData(editor);
				}
				else {
					intelichat_showData(editor);
				}
			}
		});
    });
})();

function intelichat_loadData(editor)
{
	var btn = editor.windowManager.open({
		title: 'Intelichat Contentbots',
		minWidth: 320,
		body: [
		{
			type   : 'container',
			name   : 'container',
			html   : '<h1>loading options...<h1>'
		}],
		buttons: []
	});
	
	jQuery.ajax({
		url: 'https://' + intelichat_configs.api_url,
		type: 'GET',
		data: {apikey: intelichat_configs.api_key, request: 'get_bots'},
		dataType: 'JSON',
		success: function(data, textStatus, jqXHR)
		{
			if(data.error) { intelichat_configs.api_results = ''; }
			else
			{
				intelichat_configs.api_results = [];
				for(var i=0; i<data.length; i++) {
					var item = data[i];
					intelichat_configs.api_results.push(
						{text: item.botname, value: item.url}
					);
				}
			}
			if(btn.visible())
			{
				btn.close();
				intelichat_showData(editor);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if(btn.visible())
			{
				var reload = false;
				btn.close();
				btn = editor.windowManager.open({
					title: 'loading options...',
					body: [
					{
						type   : 'container',
						name   : 'container',
						html   : '<h1>Server access failed<h1>'
					}],
					buttons: [{
						text: "Try again...",
						subtype: "primary",
						onclick: function() { btn.submit(); }
					}],
				onsubmit: function() { reload = true; intelichat_loadData(editor); },
				onclose: function() { if(!reload) { intelichat_showData(editor); } }
				});
			}
		}
	});
}

function intelichat_showData(editor)
{
	if(Array.isArray(intelichat_configs.api_results))
	{
		var modal_content;
		var emptData = true;
		if(intelichat_configs.api_results.length > 0)
		{
			modal_content = [
			{
				type   : 'listbox',
				name   : 'bot',
				values : intelichat_configs.api_results
			}];
			emptData = false;
		}
		else
		{
			modal_content = [
			{
				type   : 'container',
				name   : 'container',
				html   : '<h1>There is nothing here...<h1>'
			}];
		}
		var btn = editor.windowManager.open({
			title: 'Intelichat Contentbots',
			minWidth: 320,
			body: modal_content,
			buttons: [
			{
				disabled: emptData,
				text: "Ok",
				subtype: "primary",
				onclick: function() { btn.submit(); }
			},
			{
				text: "Reload",
				subtype: "secondary",
				onclick: function() { btn.close(); intelichat_loadData(editor); }
			}],
			onsubmit: function( e ) {
				editor.insertContent( '[intelichat bot=' + e.data.bot + ']');
			}
		});
	}
	else if(intelichat_configs.api_results == '')
	{
		var btn = editor.windowManager.open({
			title: 'Intelichat Contentbots',
			minWidth: 320,
			body: [
			{
				type   : 'container',
				name   : 'container',
				html   : '<h1>Invalid API Key!<br/>Please verify the API Key settings in the plugin configuration panel<h1>'
			}],
			buttons: [{
				text: "Ok",
				subtype: "primary",
				onclick: function() { btn.submit(); }
			}]
		});
	}
}


	
	

/*
function intelichat_showData(editor)
{
	alert('showData');
}

function intelichat_loadData(editor)
{
	var btn = editor.windowManager.open({
		title: 'carregando opções...',
		body: [
		{
			type   : 'container',
			name   : 'container',
			html   : '<h1>carregando opções...<h1>'
		}],
		buttons: []
	});
	
	jQuery.ajax({
		url: intelichat_configs.api_url,
		type: 'GET',
		data: {apikey: intelichat_configs.api_key, request: 'get_bots'},
		dataType: 'JSON',
		success: function(data, textStatus, jqXHR) {
			if(data.error) { intelichat_configs.api_results = false; }
			else
			{
				intelichat_configs.api_results = [];
				for(var i=0; i<data.length; i++) {
					var item = data[i];
					intelichat_configs.api_results.push(
						{text: item.botname, value: item.url}
					);
				}
			}
			if(true)
			{
				btn.close();
				intelichat_showData(editor);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if(true)
			{
				btn.close();
				btn = editor.windowManager.open({
					title: 'carregando opções...',
					body: [
					{
						type   : 'container',
						name   : 'container',
						html   : '<h1>Falha ao acessar o servidor<h1>'
					}],
					buttons: [
						text: "Tentar novamente",
						subtype: "primary",
						onclick: function() { button.submit(); }
					]
				},
				onsubmit: function() { intelichat_loadData(editor); },
				//onclose: function() { alert('ok'); });
			}
		}
	});
}

/*




				button = editor.windowManager.open({
					title: 'carregando opções...',
					body: [
					{
						type   : 'container',
						name   : 'container',
						html   : '<h1>Falha ao carrear opções<h1>';
					}],
					buttons: []
				});
				if(true)
				{
					intelichat_showData(editor);
				}
				y.close();

				y = editor.windowManager.open({
				title: 'Adicionar bot',
				body: [
				{
					type   : 'listbox',
					name   : 'combobox',
					label  : 'combobox',
					values : intelichat_configs.api_results
				}],
				buttons: [
				{
					name: 'btn',
					text: "Ok",
					subtype: "primary",
					onclick: function() { win.submit(); }
				}],
				onsubmit: function( e ) {
					editor.insertContent( '&lt;h3&gt;' + 'e.data.title' + '&lt;/h3&gt;');
				}
			});
				//alert(JSON.stringify(intelichat_configs.api_results));
			}
		}
		
		
		
(function() {
    tinymce.PluginManager.add('custom_link_class', function( editor, url ) {
        editor.addButton( 'custom_link_class', {
            text: 'tinyMCE_object.button_name',
            icon: false,
            onclick: function() {
                editor.windowManager.open( {
                    title: tinyMCE_object.button_title,
                    body: [
                        {
                            type: 'textbox',
                            name: 'img',
                            label: tinyMCE_object.image_title,
                            value: '',
                            classes: 'my_input_image',
                        },
                        {
                            type: 'button',
                            name: 'my_upload_button',
                            label: '',
                            text: tinyMCE_object.image_button_title,
                            classes: 'my_upload_button',
                        },//new stuff!
                        {
                            type   : 'listbox',
                            name   : 'listbox',
                            label  : 'listbox',
                            values : [
                                { text: 'Test1', value: 'test1' },
                                { text: 'Test2', value: 'test2' },
                                { text: 'Test3', value: 'test3' }
                            ],
                            value : 'test2' // Sets the default
                        },
                        {
                            type   : 'combobox',
                            name   : 'combobox',
                            label  : 'combobox',
                            values : [
                                { text: 'Test', value: 'test' },
                                { text: 'Test2', value: 'test2' }
                            ]
                        },
                        {
                            type   : 'textbox',
                            name   : 'textbox',
                            label  : 'textbox',
                            tooltip: 'Some nice tooltip to use',
                            value  : 'default value'
                        },
                        {
                            type   : 'container',
                            name   : 'container',
                            label  : 'container',
                            html   : '<h1>container<h1> is <i>ANY</i> html i guess...<br/><br/><pre>but needs some styling?!?</pre>'
                        },
                        {
                            type   : 'tooltip',
                            name   : 'tooltip',
                            label  : 'tooltip ( you dont use it like this check textbox params )'
                        },
                        {
                            type   : 'button',
                            name   : 'button',
                            label  : 'button ( i dont know the other params )',
                            text   : 'My Button'
                        },
                        {
                            type   : 'buttongroup',
                            name   : 'buttongroup',
                            label  : 'buttongroup ( i dont know the other params )',
                            items  : [
                                { text: 'Button 1', value: 'button1' },
                                { text: 'Button 2', value: 'button2' }
                            ]
                        },
                        {
                            type   : 'checkbox',
                            name   : 'checkbox',
                            label  : 'checkbox ( it doesn`t seem to accept more than 1 )',
                            text   : 'My Checkbox',
                            checked : true
                        },
                        {
                            type   : 'colorbox',
                            name   : 'colorbox',
                            label  : 'colorbox ( i have no idea how it works )',
                            // text   : '#fff',
                            values : [
                                { text: 'White', value: '#fff' },
                                { text: 'Black', value: '#000' }
                            ]
                        },
                        {
                            type   : 'colorpicker',
                            name   : 'colorpicker',
                            label  : 'colorpicker'
                        },
                        {
                            type   : 'radio',
                            name   : 'radio',
                            label  : 'radio ( defaults to checkbox, or i`m missing something )',
                            text   : 'My Radio Button'
                        }
                    ],
                    onsubmit: function( e ) {
                        editor.insertContent( '[shortcode-name img="' + e.data.img + '" list="' + e.data.listbox + '" combo="' + e.data.combobox + '" text="' + e.data.textbox + '" check="' + e.data.checkbox + '" color="' + e.data.colorbox + '" color_2="' + e.data.colorpicker + '" radio="' + e.data.radio + '"]');
                    }
                });
            },
        });
    });
 
})();
















/*



(function() {
    tinymce.PluginManager.add( 'custom_link_class', function( editor, url ) {
		intelichat_configs.visualEditor = editor;
		jQuery('#intelichat_modalForm').on('show.bs.modal', function (e)
		{
			
		});
		jQuery('#intelichat_modalForm').on('hidden.bs.modal', function (e)
		{
			
		});
		
		var dir = url.substring(0, url.lastIndexOf('js'));
		var img_dir = dir + '/images/icon.png';
        // Add Button to Visual Editor Toolbar
        editor.addButton('custom_link_class', {
            title: 'Adicionar InteliChat Bot',
			image: img_dir,
			onclick: function() { jQuery("#intelichat_modalForm").modal("show"); }
        }); 
				// Add Command when Button Clicked
		editor.addCommand('custom_link_class', function() {
			alert('Button clicked!');
		});
    });
})();

function intelichat_getBoots()
{
	jQuery.ajax({
	  url: js_global.xhr_url,
	  type: 'POST',
	  data: dados_envio,
	  dataType: 'JSON',
	  success: function(response) {
		  if (response == '401'  ){
			  console.log('Requisição inválida')
		  }
		  else if (response == 402) {
			  console.log('Todos os posts já foram mostrados')
		  } else {
			  console.log(response)
		  }
	  }
	});
}
function intelichat_showForm()
{
}




//?apikey=&request=get_bots

/*
            //cmd: 'custom_link_class',


				if(intelichat_configs.api_results == '')
				{
				}
				else
				{
				editor.windowManager.open( {
					title: 'Insert h3',
					body: [{
						type: 'textbox',
						name: 'title',
						label: 'Your title'
					}],
					onsubmit: function( e ) {
						editor.insertContent( '&lt;h3&gt;' + e.data.title + '&lt;/h3&gt;');
					}
				});
				}
					jQuery('#intelichat_modalForm').show();
					
					*/
