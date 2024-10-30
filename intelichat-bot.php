<?php
/*
Plugin Name:  Intelichat Contentbot
Plugin URI:   https://inteli.chat/en
Description:  Posts and pages personalized by a chat experience. Engage readers with a new experience, orchestrated by content robots. Readers finally have a choice about the content they read.
Version:      1.0.0
Author:       Intelichat
Author URI:   http://www.qualitor.com.br/en
Author MAIL:  help@inteli.chat
License:      GPL2
License URI:  https://www.gnu.org/licenses/gpl-2.0.html
Text Domain:  intelichat-contentbot
Domain Path:  /languages

We all live in the economy of attention.
The more information is available the less people will pay attention to it. Besides that, readers are not all the same. Why should content be? 
There comes the problem: It is a great challenge to get the people’s attention and engagement with Digital Content. To help with that, Intelichat enables the creation of Digital Content, Personalized with a Chat experience driven by content robots.
With Intelichat you can easily create interactive content, with which readers Interact to build a personalized content. Create posts and pages as blocks of text, connect the blocks and pronto! Tests, surveys and fields are supported, and it is possible to gather reader`s choices and preferences as attributes. With a few configurations, your interactive content is ready for Wordpress

Intelichat Contentbot is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
any later version.
 
Intelichat Contentbot is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
 
You should have received a copy of the GNU General Public License
along with InteliChat Bot. If not, see https://www.gnu.org/licenses/gpl-2.0.html.
*/

if (!function_exists('add_action')) {
	echo 'Hi there!  I\'m just a plugin, not much I can do when called directly.';
	exit;
}

define( 'INTELICHAT_PLUGIN_VERSION', '1.0.0' );
define( 'INTELICHAT_PLUGIN_DIR', plugin_dir_url(__FILE__));

register_activation_hook( __FILE__, array( 'InteliChatPlugin', 'plugin_activation'));
register_deactivation_hook( __FILE__, array('InteliChatPlugin', 'plugin_deactivation'));
register_uninstall_hook(__FILE__, array('InteliChatPlugin', 'plugin_uninstall'));
add_action('init', array('InteliChatPlugin', 'init'));
add_action('template_redirect', array('InteliChatPlugin', 'init_config_scripts'));

class InteliChatPlugin {
	const API_HOST = 'inteli.chat/app/api/api.php';
	
	private static $initiated = false;
	private static $validateKeyResult = null;
	
	public static function plugin_activation() {
	}
	public static function plugin_deactivation() {
	}
	public static function plugin_uninstall() {
		delete_option('acceptTerms');
		delete_option('apiKey');
	}
	
	private static function get_accept() {
		return get_option('acceptTerms');
	}
	
	private static function validateKey()
	{
		if(self::$validateKeyResult != null) { return self::$validateKeyResult; }
		if(!self::get_accept()) { return false; }
		
		$response = wp_remote_get('https://' . self::API_HOST . '?request=verify&apikey=' . self::get_apiKey(),
			array('timeout'=> 120, 'httpversion' => '1.1')
		);
		
		if( !is_wp_error( $response ) ) {
			$body = wp_remote_retrieve_body( $response );
			$data = json_decode($body);
			self::$validateKeyResult = $data->sucess == 'true';
		}
		
		return self::$validateKeyResult;
	}
	
	public static function init()
	{
		if (self::$initiated) { return; }
		
		self::$initiated = true;
		
		add_shortcode('intelichat', array('InteliChatPlugin', 'process_shortcode'));
		
		if(!is_admin()) { return; }
		
		register_setting('settings', 'apiKey', array('type'=>'string', 'default'=>''));
		register_setting('terms', 'acceptTerms', array('type'=>'boolean', 'default'=>false));
		
		wp_register_script('bootstrap-js', INTELICHAT_PLUGIN_DIR . 'public/js/bootstrap.min.js', array('jquery'), '4.1.3');
		wp_register_script('intelichat-ajax-config', esc_url(add_query_arg(array('intelichat_configs' => 1), site_url())), array('bootstrap-js'));
		wp_enqueue_script('intelichat-ajax-config');
		
		wp_register_style('bootstrap', INTELICHAT_PLUGIN_DIR . 'public/css/bootstrap.min.css', array(), '4.1.3');
		wp_register_style('intelichat-style', INTELICHAT_PLUGIN_DIR . 'public/css/style.css?v=2', array('bootstrap'), '1.0.0');
		wp_enqueue_style('intelichat-style');
		
		add_action('admin_menu', array('InteliChatPlugin', 'create_options_page'));
		add_action('template_redirect', array('InteliChatPlugin', 'init_config_scripts'));
		
		if (self::can_use_editor())
		{
			add_filter('mce_external_plugins', array('InteliChatPlugin', 'add_tinymce_plugin'));
			add_filter('mce_buttons', array('InteliChatPlugin', 'add_tinymce_toolbar_button'));
		}
	}
	
	public static function can_edit_pages_or_posts() {
		return current_user_can('edit_posts') || current_user_can('edit_pages');
	}
	
	public static function can_use_editor() {
		return self::can_edit_pages_or_posts() && get_user_option('rich_editing') === 'true';
	}
	
	public static function create_options_html() {
		if(self::get_accept()) {
			self::print_html_menu();
		}
		else {
			self::print_html_terms();
		}
	}
	
    public static function process_shortcode($atts = [], $content = null)
    {
		if(!self::get_accept()) { return $content; }
		$atts = array_change_key_case((array)$atts, CASE_LOWER);
		$src = '';
		if(isset($atts['bot'])) { $src = $atts['bot']; }
		$result = "<script type='text/javascript' src='https://inteli.chat/app/js/resizer/iframeResizer.min.js'></script>" .
		"<iframe src='" . $src . "' scrolling='no' width='100%' style='border-width:0px' onload='iFrameResize(MyBotIC)' id='MyBotIC'></iframe>";
        return $result;
    }
	
	public static function init_config_scripts() {
		if (!isset($_GET['intelichat_configs'])) return;
		
		$nonce = wp_create_nonce('settings_nonce');

		$vars = array(
		'settings_nonce' => $nonce,
		'xhr_url' => admin_url('admin-ajax.php'),
		'api_url' => self::API_HOST,
		'api_key' => self::get_apiKey(),
		'plugin_dir' => INTELICHAT_PLUGIN_DIR,
		'api_results' => self::validateKey() === false ? '' : null
		);

		header("Content-type: application/x-javascript");
		printf('var %s = %s;', 'intelichat_configs', json_encode($vars));
		exit;
	}
		
	public static function create_options_page()
	{
		$icon_source = self::validateKey() === true ? 'icon.png' : 'icon_error.png';
		
		add_menu_page(
			'Settings', // $page_title
			'Intelichat Contentbot', // $menu_title
			'manage_options', // $capability
			'intelichat_settings', // $menu_slug
			array('InteliChatPlugin', 'create_options_html'), // $function
			INTELICHAT_PLUGIN_DIR . 'public/images/' . $icon_source, // $icon_url
			20 // $position
		);
	}
	
	/**
	* Adds a TinyMCE plugin compatible JS file to the TinyMCE / Visual Editor instance
	*
	* @param array $plugin_array Array of registered TinyMCE Plugins
	* @return array Modified array of registered TinyMCE Plugins
	*/
	public static function add_tinymce_plugin($plugin_array)
	{
		$plugin_array['inteliChatPlugin'] = INTELICHAT_PLUGIN_DIR . 'admin/js/visual_editor.js';
		return $plugin_array;
	}
	
	/**
	* Adds a button to the TinyMCE / Visual Editor which the user can click
	* to insert a link with a custom CSS class.
	*
	* @param array $buttons Array of registered TinyMCE Buttons
	* @return array Modified array of registered TinyMCE Buttons
	*/
	public static function add_tinymce_toolbar_button($buttons)
	{
		array_push($buttons, '|', 'inteliChatPlugin');
		return $buttons;
	}
	
	private static function get_apiKey() {
		return get_option('apiKey');
	}
	
	private static function print_html_terms() { ?>
		<div class="wrap intelichat_settings">
			<?=self::print_menuHeader()?>
			<form id="intelichat_settings_form" action="options.php" method="post">
				<?= settings_fields('terms'); ?>
				<fieldset>
					<legend>Terms and conditions of use of this plugin</legend>
<br><b>Please read this carefully before proceeding:</b>
<br><br>
Despite this plugin is free, an <b><i>Intelichat subscription to a plan that supports interactive publishing </b></i>is required for its proper operation. 
You must create interactive contents in Intelichat before publishing to Wordpress.
<br><br>
This plugin is compatible with the <b>classical text editor</b> of Wordpress. In order to be supported in the Gutenberg text editor, a classic text block must be used to make the “insert content bot” button available.
<br><br>
This plugin was developed and tested for standard Wordpress on-premise installations and for the official cloud based Wordpress. 
Modified versions of Wordpress and modified or non-compliant themes may cause unexpected malfunctions.
<br><br>
Please refer to Intelichat terms and conditions for additional information. <a href="https://inteli.chat/en/temrs-and-conditions/" target="_new">Click here</a>
<br><br>
					<input required id="acceptTerms" name="acceptTerms" type="checkbox" <?= get_option('acceptTerms') == true ? "checked" : "" ?>/>
					<label for="acceptTerms">I agree to the terms</label>
				</fieldset>
				<?= submit_button('Proceed'); ?>
			</form>
		</div>
    <?php
        }

        private static function print_html_menu() { ?>
                <div class="wrap intelichat_settings">
                        <?=self::print_menuHeader()?>
                        <form id="intelichat_settings_form" action="options.php" method="post">
                                <?= settings_fields('settings'); ?>
                                <fieldset>
<legend>
<?= __( 'Intelichat :: API Key', 'intelichat-bot' ); ?>
</legend>

                                        <input required name="apiKey" type="text" value="<?= get_option('apiKey'); ?>" style="width: 360px !important;"/>
<br>
<i>Note: The Intelichat API Key is found in the ‘My profile’ menu of the administration section of Intelichat (upper right menu, with the avatar).</i>
<br>
                                        <?php if(self::get_apiKey() != '') {    ?>
                                                <br/>
                                        <?php   if(self::validateKey() === true) { ?>
                                                <span class="success">API Key accepted. Plugin successfully configured.<br>You are ready to embed interactive content into pages and posts. <br><b></b>An Intelichat button is available in the classic text editor to do it.</b>
                                        <?php   } 
                                                   else if(self::validateKey() === false) { ?>
                                                   <span class="error">This API Key is invalid.</span>
                                        <?php   }
                                                   else { ?>
                                                   <span class="error">Sorry, I could not validate the API Key at the moment...</span>
                                        <?php } } ?>
                                </fieldset>
                                <?= submit_button('Save settings'); ?>
                        </form>
                </div>
    <?php
	}
	
	private static function print_menuHeader() { ?>
		<img height="60px" style="float:right;" src="<?=INTELICHAT_PLUGIN_DIR . 'public/images/logo.jpg'?>"/>
		<h1><?= esc_html(get_admin_page_title()); ?></h1>
	<?php
	}
}
