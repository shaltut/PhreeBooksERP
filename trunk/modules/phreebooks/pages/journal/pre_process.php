<?php
// +-----------------------------------------------------------------+
// |                   PhreeBooks Open Source ERP                    |
// +-----------------------------------------------------------------+
// | Copyright(c) 2008-2015 PhreeSoft      (www.PhreeSoft.com)       |
// +-----------------------------------------------------------------+
// | This program is free software: you can redistribute it and/or   |
// | modify it under the terms of the GNU General Public License as  |
// | published by the Free Software Foundation, either version 3 of  |
// | the License, or any later version.                              |
// |                                                                 |
// | This program is distributed in the hope that it will be useful, |
// | but WITHOUT ANY WARRANTY; without even the implied warranty of  |
// | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the   |
// | GNU General Public License for more details.                    |
// +-----------------------------------------------------------------+
//  Path: /modules/phreebooks/pages/journal/pre_process.php
//
$security_level = \core\classes\user::validate(SECURITY_ID_JOURNAL_ENTRY);
/**************  include page specific files    *********************/
require_once(DIR_FS_WORKING . 'defaults.php');
require_once(DIR_FS_WORKING . 'functions/phreebooks.php');
/**************   page specific initialization  *************************/
$post_date = ($_POST['post_date']) ? \core\classes\DateTime::db_date_format($_POST['post_date']) : date('Y-m-d', time());
$period    = \core\classes\DateTime::period_of_date($post_date);
$glEntry   = new \core\classes\journal\journal_02();
$glEntry->id = ($_POST['id'] <> '') ? $_POST['id'] : ''; // will be null unless opening an existing gl entry
// All general journal entries are in the default currency.
$glEntry->currencies_code  = DEFAULT_CURRENCY;
$glEntry->currencies_value = 1;
/***************   hook for custom actions  ***************************/
$custom_path = DIR_FS_WORKING . 'custom/pages/journal/extra_actions.php';
if (file_exists($custom_path)) { include($custom_path); }
/***************   Act on the action request   *************************/
switch ($_REQUEST['action']) {
  case 'save':
  case 'copy':
  	try{
		\core\classes\user::validate_security($security_level, 2);
	    // for copy operation, erase the id to force post a new journal entry with same values
		if ($_REQUEST['action'] == 'copy') $glEntry->id = '';
		$glEntry->post_date           = $post_date;
		$glEntry->period              = $period;
		$glEntry->admin_id            = $_SESSION['user']->admin_id;
		$glEntry->purchase_invoice_id = db_prepare_input($_POST['purchase_invoice_id']);
		$glEntry->recur_id            = db_prepare_input($_POST['recur_id']);
		$glEntry->recur_frequency     = db_prepare_input($_POST['recur_frequency']);
		$glEntry->store_id            = db_prepare_input($_POST['store_id']);
		$glEntry->rm_attach           = isset($_POST['rm_attach']) ? true : false;
		if ($glEntry->store_id == '') $glEntry->store_id = 0;

		// process the request, build main record
		$x = 1;
		$total_amount = 0;
		$journal_entry_desc = TEXT_GENERAL_JOURNAL_ENTRY;
		while (isset($_POST['acct_' . $x])) { // while there are gl rows to read in
			if (!$_POST['debit_' . $x] && !$_POST['credit_' . $x]) { // skip blank rows
				$x++;
				continue;
			}
			$debit_amount  = ($_POST['debit_' . $x]) ? $admin->currencies->clean_value($_POST['debit_' . $x]) : 0;
			$credit_amount = ($_POST['credit_'. $x]) ? $admin->currencies->clean_value($_POST['credit_'. $x]) : 0;
			$glEntry->journal_rows[] = array(
				'id'            => ($_REQUEST['action'] == 'copy') ? '' : db_prepare_input($_POST['id_' . $x]),
				'qty'           => '1',
				'gl_account'    => db_prepare_input($_POST['acct_' . $x]),
				'description'   => db_prepare_input($_POST['desc_' . $x]),
				'debit_amount'  => $debit_amount,
				'credit_amount' => $credit_amount,
				'post_date'     => $glEntry->post_date);
			$total_amount += $debit_amount;
			if ($x == 1) $journal_entry_desc = db_prepare_input($_POST['desc_' . $x]);
			$x++;
		}

		$glEntry->journal_main_array = array(
			'id'                  => $glEntry->id,
			'period'              => $glEntry->period,
			'journal_id'          => $glEntry->journal_id,
			'post_date'           => $glEntry->post_date,
			'total_amount'        => $total_amount,
			'description'         => TEXT_GENERAL_JOURNAL_ENTRY,
			'purchase_invoice_id' => $glEntry->purchase_invoice_id,
			'currencies_code'     => DEFAULT_CURRENCY,
			'currencies_value'    => 1,
			'admin_id'            => $glEntry->admin_id,
			'bill_primary_name'   => $journal_entry_desc,
			'recur_id'            => $glEntry->recur_id,
			'store_id'            => $glEntry->store_id,
		);

		// check for errors and prepare extra values
		if (!$glEntry->period) throw new \core\classes\userException("bad post date was submitted");// bad post_date was submitted
		// 	no rows entered
		if (!$glEntry->journal_rows) throw new \core\classes\userException(GL_ERROR_NO_ITEMS);
		// finished checking errors
		// *************** START TRANSACTION *************************
		$admin->DataBase->beginTransaction();
		if ($glEntry->recur_id > 0) { // if new record, will contain count, if edit will contain recur_id
			$first_id                  = $glEntry->id;
			$first_post_date           = $glEntry->post_date;
			$first_purchase_invoice_id = $glEntry->purchase_invoice_id;
			if ($glEntry->id) { // it's an edit, fetch list of affected records to update if roll is enabled
				$affected_ids = $glEntry->get_recur_ids($glEntry->recur_id, $glEntry->id);
				for ($i = 0; $i < count($affected_ids); $i++) {
					$glEntry->id                       = $affected_ids[$i]['id'];
					$glEntry->journal_main_array['id'] = $affected_ids[$i]['id'];
					if ($i > 0) { // Remove row id's for future posts, keep if re-posting single entry
						for ($j = 0; $j < count($glEntry->journal_rows); $j++) {
					    	$glEntry->journal_rows[$j]['id'] = '';
					  	}
					  	$glEntry->post_date = $affected_ids[$i]['post_date'];
					}
					$glEntry->period                          = \core\classes\DateTime::period_of_date($glEntry->post_date, true);
					$glEntry->journal_main_array['post_date'] = $glEntry->post_date;
					$glEntry->journal_main_array['period']    = $glEntry->period;
					$glEntry->purchase_invoice_id             = $affected_ids[$i]['purchase_invoice_id'];
					$glEntry->validate_purchase_invoice_id();
					$glEntry->Post('edit');
					// test for single post versus rolling into future posts, terminate loop if single post
					if (!$glEntry->recur_frequency) break;
				}
			} else { // it's an insert
				$post_date = new \core\classes\DateTime($post_date);
				// fetch the next recur id
				$glEntry->journal_main_array['recur_id'] = time();
				for ($i = 0; $i < $glEntry->recur_id; $i++) {
					$glEntry->validate_purchase_invoice_id();
					$glEntry->Post('insert');
					$glEntry->id = '';
					$glEntry->journal_main_array['id'] = $glEntry->id;
					for ($j = 0; $j < count($glEntry->journal_rows); $j++) $glEntry->journal_rows[$j]['id'] = '';
					switch ($glEntry->recur_frequency) {
						default:
						case '1': $post_date->modify("+7 day"); 	break; // Weekly
						case '2': $post_date->modify("+14 day");	break; // Bi-weekly
						case '3': $post_date->modify("+1 month"); 	break; // Monthly
						case '4': $post_date->modify("+3 month");	break; // Quarterly
						case '5': $post_date->modify("+1 year");	break; // Yearly
					}
					$glEntry->post_date = $post_date->format("Y-m-d");
					$glEntry->period = \core\classes\DateTime::period_of_date($glEntry->post_date, true);
					if (!$glEntry->period && $i < ($glEntry->recur_id - 1)) { // recur falls outside of available periods, ignore last calculation
					  throw new \core\classes\userException(ORD_PAST_LAST_PERIOD);
					}
					$glEntry->journal_main_array['post_date'] = $glEntry->post_date;
					$glEntry->journal_main_array['period'] = $glEntry->period;
					$glEntry->purchase_invoice_id = string_increment($glEntry->journal_main_array['purchase_invoice_id']);
				}
			}
			// restore the first values to continue with post process
			$glEntry->id                                        = $first_id;
			$glEntry->journal_main_array['id']                  = $first_id;
			$glEntry->post_date                                 = $first_post_date;
			$glEntry->journal_main_array['post_date']           = $first_post_date;
			$glEntry->purchase_invoice_id                       = $first_purchase_invoice_id;
			$glEntry->journal_main_array['purchase_invoice_id'] = $first_purchase_invoice_id;
		} else {
			$glEntry->validate_purchase_invoice_id();
			$glEntry->Post($glEntry->id ? 'edit' : 'insert');
		}
		$admin->DataBase->commit();
		if ($glEntry->rm_attach) @unlink(PHREEBOOKS_DIR_MY_ORDERS . 'order_'.$glEntry->id.'.zip');
		if (is_uploaded_file($_FILES['file_name']['tmp_name'])) {
			\core\classes\messageStack::debug_log('Saving file to: '.PHREEBOOKS_DIR_MY_ORDERS.'order_'.$glEntry->id.'.zip');
		  	saveUploadZip('file_name', PHREEBOOKS_DIR_MY_ORDERS, 'order_'.$glEntry->id.'.zip');
		}
		gen_add_audit_log(TEXT_GENERAL_JOURNAL_ENTRY. " - " . (($glEntry->id) ? TEXT_EDIT : TEXT_ADD), $glEntry->purchase_invoice_id);
		gen_redirect(html_href_link(FILENAME_DEFAULT, gen_get_all_get_params(array('action')), 'SSL'));
		// *************** END TRANSACTION *************************
  	}catch(Exception $e){
		$admin->DataBase->rollBack();
		\core\classes\messageStack::add($e->getMessage());
		$cInfo = new \core\classes\objectInfo($_POST); // if we are here, there was an error, reload page
		$cInfo->post_date = \core\classes\DateTime::db_date_format($_POST['post_date']);
  	}
  	$messageStack->write_debug();
	break;
  case 'delete':
  	try{
		\core\classes\user::validate_security($security_level, 4);
		// check for errors and prepare extra values
		if (!$glEntry->id) throw new \core\classes\userException(sprintf(TEXT_FIELD_IS_REQUIRED_BUT_HAS_BEEN_LEFT_BLANK_ARGS, "id"));
		$delGL = new \core\classes\journal();
		$delGL->journal($glEntry->id); // load the posted record based on the id submitted
		$recur_id        = db_prepare_input($_POST['recur_id']);
		$recur_frequency = db_prepare_input($_POST['recur_frequency']);
		// *************** START TRANSACTION *************************
		$admin->DataBase->beginTransaction();
		if ($recur_id > 0) { // will contain recur_id
			$affected_ids = $delGL->get_recur_ids($recur_id, $delGL->id);
			for ($i = 0; $i < count($affected_ids); $i++) {
				$delGL->id = $affected_ids[$i]['id'];
				$delGL->journal($delGL->id); // load the posted record based on the id submitted
				$delGL->unPost('delete');
				// test for single post versus rolling into future posts, terminate loop if single post
				if (!$recur_frequency) break;
			}
		} else {
			$delGL->unPost('delete');
		}
		$admin->DataBase->commit(); // if not successful rollback will already have been performed
		gen_add_audit_log(TEXT_GENERAL_JOURNAL_ENTRY. " - " . TEXT_DELETE, $delGL->purchase_invoice_id);
		gen_redirect(html_href_link(FILENAME_DEFAULT, gen_get_all_get_params(array('action')), 'SSL'));
  	}catch(Exception $e){
		$admin->DataBase->rollBack();
		\core\classes\messageStack::add($e->getMessage());
		$cInfo = new \core\classes\objectInfo($_POST); // if we are here, there was an error, reload page
		$cInfo->post_date = \core\classes\DateTime::db_date_format($_POST['post_date']);
  	}
	$messageStack->write_debug();
	break;

  case 'edit':
    $oID = (int)$_GET['oID'];
	\core\classes\user::validate_security($security_level, 2);
   	$cInfo = new \core\classes\objectInfo(array());
	break;

  case 'dn_attach':
	$oID = db_prepare_input($_POST['id']);
	if (file_exists(PHREEBOOKS_DIR_MY_ORDERS . 'order_' . $oID . '.zip')) {
		$backup = new \phreedom\classes\backup();
		$backup->download(PHREEBOOKS_DIR_MY_ORDERS, 'order_' . $oID . '.zip', true);
	}
	die;
  default:
}

/*****************   prepare to display templates  *************************/
// retrieve the list of gl accounts and fill js arrays
$gl_array_list = gen_coa_pull_down();
$i = 0;
$js_gl_array = 'var js_gl_array = new Array();' . chr(10);
foreach ($gl_array_list as $account) {
  $is_asset = $coa_types_list[$account['type']]['asset'] ? '1' : '0';
  $js_gl_array .= 'js_gl_array['.$i.'] = new glProperties("'.$account['id'].'", "'.$account['text'].'", "'.$is_asset.'");' . chr(10);
  $i++;
}

$cal_gl = array(
  'name'      => 'datePost',
  'form'      => 'journal',
  'fieldname' => 'post_date',
  'imagename' => 'btn_date_1',
  'default'   => \core\classes\DateTime::createFromFormat(DATE_FORMAT, $post_date),
);

$include_header   = true;
$include_footer   = true;
$include_template = 'template_main.php';
define('PAGE_TITLE', TEXT_GENERAL_JOURNAL_ENTRY);

?>