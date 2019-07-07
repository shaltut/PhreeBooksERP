<?php
/*
 * Bizuno dashboard - Embedded Google Calendar
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
 * @copyright  2008-2019, PhreeSoft, Inc.
 * @license    http://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 * @version    3.x Last Update: 2018-09-05
 * @filesource /lib/controller/module/bizuno/dashboards/google_calendar/google_calendar.php
 */

namespace bizuno;

define('DASHBOARD_GOOGLE_CALENDAR_VERSION','1.0');

class google_calendar
{
    public $moduleID = 'bizuno';
    public $methodDir= 'dashboards';
    public $code     = 'google_calendar';
    public $category = 'general';
    public $noSettings= true;
    
    function __construct()
    {
        $this->security= 4;
        $this->lang    = getMethLang($this->moduleID, $this->methodDir, $this->code);
    }

    public function render()
    {
        $gmail = getUserCache('profile', 'gmail');
        $gzone = getUserCache('profile', 'gzone');
        if (!$gmail) { return $this->lang['err_no_email']; }
        return '<iframe src="https://www.google.com/calendar/embed?src='.urlencode($gmail).'&ctz='.urlencode($gzone).'" style="border: 0" width="100%" height="300" frameborder="0" scrolling="no"></iframe>';
    }
}
