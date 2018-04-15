<?php
/*
 * Payment Method - PayPal API
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
 * @copyright  2008-2018, PhreeSoft
 * @license    http://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 * @version    2.0 Last Update: 2017-08-27
 * @filesource /lib/controller/module/payment/methods/paypal_api.php
 */

namespace bizuno;

class paypal_api
{
    public $moduleID = 'payment';
    public $methodDir= 'methods';
	public $code     = 'paypal_api';
	
	public function __construct()
	{
        $this->lang    = getMethLang   ($this->moduleID, $this->methodDir, $this->code);
		$pmtDef        = getModuleCache($this->moduleID, 'settings', 'general', false, []);
        $this->settings= ['cash_gl_acct'=>$pmtDef['gl_payment_c'],'disc_gl_acct'=>$pmtDef['gl_discount_c'],'prefix'=>'PP','order'=>30];
        $usrSettings   = getModuleCache($this->moduleID, $this->methodDir, $this->code, 'settings', []);
        settingsReplace($this->settings, $usrSettings, $this->settingsStructure());
	}

    public function settingsStructure()
    {
        return [
            'cash_gl_acct'=> ['label'=>$this->lang['set_gl_payment_c'], 'position'=>'after', 'jsBody'=>htmlComboGL("{$this->code}_cash_gl_acct"),
               'attr' => ['size'=>'10', 'value'=>$this->settings['cash_gl_acct']]],
            'disc_gl_acct'=> ['label'=>$this->lang['set_gl_discount_c'], 'position'=>'after', 'jsBody'=>htmlComboGL("{$this->code}_disc_gl_acct"),
               'attr' => ['size'=>'10', 'value'=>$this->settings['disc_gl_acct']]],
            'prefix'=> ['label'=>$this->lang['set_prefix'], 'position'=>'after', 'attr'=>['size'=>'5', 'value'=>$this->settings['prefix']]],
            'order' => ['label'=>lang('order'), 'position'=>'after', 'attr'=>['type'=>'integer', 'size'=>'3', 'value'=>$this->settings['order']]]];
	}

	public function render(&$output, $data, $values=[], $dispFirst=false)
	{
		$this->viewData = ['ref_1'=> ['label'=>lang('journal_main_invoice_num_2'),'break'=>true, 'attr'=>  ['size'=>'19']]];
		if (is_array($values) && isset($values[1]) && $values[1] == $this->code) {
			$this->viewData['ref_1']['attr']['value'] = isset($values[2]) ? $values[2] : '';
			$invoice_num = $data['journal_main']['invoice_num']['attr']['value'];
			$gl_account  = $data['journal_main']['gl_acct_id']['attr']['value'];
			$discount_gl = $this->getDiscGL($data['journal_main']['id']['attr']['value']);
		} else {
			$invoice_num = $this->settings['prefix'].date('Ymd');
			$gl_account  = $this->settings['cash_gl_acct'];
			$discount_gl = $this->settings['disc_gl_acct'];
		}
		$output['jsBody'][] = "
arrPmtMethod['$this->code'] = {cashGL:'$gl_account',discGL:'$discount_gl',ref:'$invoice_num'};
function payment_{$this->code}() {
    if (!jq('#id').val()) {
        jq('#invoice_num').val(arrPmtMethod['$this->code'].ref);
        jq('#gl_acct_id').combogrid('setValue', arrPmtMethod['$this->code'].cashGL);
        jq('#totals_discount_gl').combogrid('setValue', arrPmtMethod['$this->code'].discGL);
    }
}";
        if ($this->code == $dispFirst) { $output['jsReady'][] = "jq('#invoice_num').val('$invoice_num');"; }
		$output['body'] .= html5($this->code.'_ref_1',$this->viewData['ref_1']);
	}
	
	public function sale($fields)
	{
		return ['txID'=>$fields['ref_1'], 'txTime'=>date('c')];
	}
	
	/**
	 * @method paymentDelete - This method will delete/void a payment made BEFORE the processor commits the payment, typically must be run the same day as the sale
	 * @param string $request - data from which to pull transaction and perform delete
	 * @return boolean - true on success, false (with messageStack message) on unsuccessful deletion
	 */
	public function paymentDelete($request=false)
	{
		msgAdd('Deletions through the PayPal API must be handled directly through the PayPal website.', 'caution');
		return true;
	}

	/**
	 * @param string $request - data from which to pull transaction and perform refund/credit
	 * @return boolean - true on success, false (with messageStack message) on unsuccessful deletion
	 */
	public function paymentRefund($request=false)
	{
		msgAdd('Refunds through the PayPal API must be handled directly through the PayPal website.', 'caution');
		return true;
	}

	private function getDiscGL($data)
	{
		if (isset($data['journal_item'])) foreach ($data['journal_item'] as $row) {
            if ($row['gl_type'] == 'dsc') { return $row['gl_account']; }
		}
		return $this->settings['disc_gl_acct']; // not found, return default
	}
}