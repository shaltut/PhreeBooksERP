<?php
/*
 * Bizuno dashboard - My Links
 *
 * NOTICE OF LICENSE
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.TXT.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/OSL-3.0
 *
 * DISCLAIMER
 * Do not edit or add to this file if you wish to upgrade Bizuno to newer
 * versions in the future. If you wish to customize Bizuno for your
 * needs please refer to http://www.phreesoft.com for more information.
 *
 * @name       Bizuno ERP
 * @author     Dave Premo, PhreeSoft <support@phreesoft.com>
 * @copyright  2008-2018, PhreeSoft, Inc.
 * @license    http://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 * @version    3.x Last Update: 2018-06-18
 * @filesource /lib/controller/module/bizuno/dashboards/my_links/my_links.php
 * 
 */

namespace bizuno;

define('DASHBOARD_MY_LINKS_VERSION','1.0');

class my_links
{
    public $moduleID = 'bizuno';
    public $methodDir= 'dashboards';
    public $code     = 'my_links';
    public $category = 'general';
	
	function __construct($settings)
    {
		$this->security = getUserCache('security', 'profile', 0);
        $this->lang    = getMethLang($this->moduleID, $this->methodDir, $this->code);
        $defaults      = ['users'=>'-1','roles'=>'-1'];
        $this->settings= array_replace_recursive($defaults, $settings);
	}

    public function settingsStructure()
    {
        return [
            'users' => ['label'=>lang('users'), 'position'=>'after','values'=>listUsers(),'attr'=>['type'=>'select','value'=>$this->settings['users'],'size'=>10, 'multiple'=>'multiple']],
            'roles' => ['label'=>lang('groups'),'position'=>'after','values'=>listRoles(),'attr'=>['type'=>'select','value'=>$this->settings['roles'],'size'=>10, 'multiple'=>'multiple']]];
	}

    public function render()
    {
        $data = [
            $this->code.'_0' => ['label' => lang('title'),
                'classes'=> ['easyui-validatebox'],
                'attr'   => ['type'=>'text', 'required'=>'true', 'size'=>30]],
            $this->code.'_1' => ['label' => lang('url'),
                'classes'=> ['easyui-validatebox'],
                'attr'   => ['type'=>'text', 'required'=>'true', 'size'=>50]],
            $this->code.'_button' => [
                'attr'   => ['type'   => 'button', 'value' => lang('new')],
                'styles' => ['cursor' => 'pointer'],
                'events' => ['onClick'=> "dashboardAttr('$this->moduleID:$this->code', 0);"],
                ],
            'delete_icon' => ['icon'=>'trash', 'size'=>'small'],
            ];
        $html  = '<div>';
        $html .= '  <div id="'.$this->code.'_attr" style="display:none">';
        $html .= '    <form id="'.$this->code.'Form" action="">';
        $html .= '      <div style="white-space:nowrap">'.html5($this->code.'_0',      $data[$this->code.'_0']).'</div>';
        $html .= '      <div style="white-space:nowrap">'.html5($this->code.'_1',      $data[$this->code.'_1']).'</div>';
        $html .= '      <div style="text-align:right;">' .html5($this->code.'_button', $data[$this->code.'_button']).'</div>';
        $html .= '    </form>';
        $html .= '  </div>';
        // Build content box
        $index = 1;
        if (!isset($this->settings['data'])) { unset($this->settings['users']); unset($this->settings['roles']); $this->settings = ['data' => $this->settings]; } // OLD WAY
        if (!empty($this->settings['data'])) {
            foreach ($this->settings['data'] as $title => $hyperlink) {
                $data['delete_icon']['events'] = ['onClick'=>"if (confirm('".jsLang('msg_confirm_delete')."')) dashboardAttr('$this->moduleID:$this->code', $index);"];
                $html .= '  <div>';
                $html .= '    <div style="float:right;height:16px;">'.html5('delete_icon', $data['delete_icon']).'</div>';
                $html .= '    <div style="min-height:16px;">'.viewFavicon($hyperlink, $title).' <a href="'.$hyperlink.'" target="_blank">'.$title.'</a></div>';
                $html .= '  </div>';
                $index++;
            }
        } else {
            $html .= '  <div>'.lang('no_results').'</div>'."\n";
        }
        $html .= '</div><div style="min-height:4px;">&nbsp;</div>'."\n";
        return $html;
    }

    public function save()
    {
        $menu_id = clean('menuID', 'cmd', 'get');
        $rmID    = clean('rID', 'integer', 'get');
        $my_title= clean($this->code.'_0', 'text', 'post');
        $my_url  = clean($this->code.'_1', 'text', 'post');
        if (!$rmID && ($my_title == '' || $my_url == '')) { return; }
        // fetch the current settings
        $result = dbGetRow(BIZUNO_DB_PREFIX."users_profiles", "user_id=".getUserCache('profile', 'admin_id', false, 0)." AND menu_id='$menu_id' AND dashboard_id='$this->code'");
        $settings = json_decode($result['settings'], true);
        if (!isset($settings['data'])) { unset($settings['users']); unset($settings['roles']); $settings=['data'=>$settings]; } // OLD WAY
        if ($rmID) { array_splice($settings['data'], $rmID - 1, 1); }
        else       { $settings['data'][$my_title] = $my_url; }
        ksort($settings['data'], SORT_LOCALE_STRING | SORT_FLAG_CASE);
        dbWrite(BIZUNO_DB_PREFIX."users_profiles", ['settings'=>json_encode($settings)], 'update', "user_id=".getUserCache('profile', 'admin_id', false, 0)." AND dashboard_id='$this->code' AND menu_id='$menu_id'");
        return $result['id'];
    }
}
