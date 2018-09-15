<?php
/*
 * Sets the list of available icons and how to access them. Typically called from the dynamic css pull
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
 * @version    3.x Last Update: 2018-06-06
 * @filesource lib/view/theme/default/icons-default.php
 */

$icons = [
    'add'        => ['dir'=>'default','path'=>'list-add.png'],
    'apply'      => ['dir'=>'default','path'=>'apply.png'],
    'attachment' => ['dir'=>'default','path'=>'mail-attachment.png'],
    'average'    => ['dir'=>'default','path'=>'media-playback-pause.png'],
    'back'       => ['dir'=>'default','path'=>'go-previous.png'],
    'backup'     => ['dir'=>'default','path'=>'document-save.png'],
    'bank'       => ['dir'=>'default','path'=>'bank.png'],
    'bank-check' => ['dir'=>'default','path'=>'bank-check.png'],
    'barcode'    => ['dir'=>'default','path'=>'stock_id.png'],
    'bkmrkDel'   => ['dir'=>'default','path'=>'bookmark-new.png'],
    'bookmark'   => ['dir'=>'default','path'=>'bookmark-new.png'],
    'budget'     => ['dir'=>'default','path'=>'wallet.png'],
    'cancel'     => ['dir'=>'default','path'=>'edit-undo.png'],
    'chat'       => ['dir'=>'default','path'=>'internet-group-chat.png'],
    'collapse'   => ['dir'=>'default','path'=>'list-remove.png'],
    'checkin'    => ['dir'=>'default','path'=>'emblem-symbolic-link.png'],
    'checkout'   => ['dir'=>'default','path'=>'emblem-symbolic-link.png'],
    'clear'      => ['dir'=>'default','path'=>'view-refresh.png'],
    'close'      => ['dir'=>'default','path'=>'emblem-unreadable.png'],
    'continue'   => ['dir'=>'default','path'=>'go-next.png'],
    'copy'       => ['dir'=>'default','path'=>'edit-copy.png'],
    'credit'     => ['dir'=>'default','path'=>'emblem-symbolic-link.png'],
    'date'       => ['dir'=>'default','path'=>'office-calendar.png'],
    'debug'      => ['dir'=>'default','path'=>'utilities-system-monitor.png'],
    'delete'     => ['dir'=>'default','path'=>'edit-delete.png'],
    'design'     => ['dir'=>'default','path'=>'applications-accessories.png'],
    'dashboard'  => ['dir'=>'default','path'=>'preferences-system-windows.png'],
    'dirNew'     => ['dir'=>'default','path'=>'folder-new.png'],
    'docNew'     => ['dir'=>'default','path'=>'document-new.png'],
    'download'   => ['dir'=>'default','path'=>'go-down.png'],
    'edit'       => ['dir'=>'default','path'=>'edit-find-replace.png'],
    'email'      => ['dir'=>'default','path'=>'internet-mail.png'],
    'employee'   => ['dir'=>'default','path'=>'employee.png'],
    'encrypt-off'=> ['dir'=>'default','path'=>'network-wireless-encrypted.png'],
    'expand'     => ['dir'=>'default','path'=>'list-add.png'],
    'lock'       => ['dir'=>'default','path'=>'emblem-readonly.png'],
    'exit'       => ['dir'=>'default','path'=>'system-log-out.png'],
    'export'     => ['dir'=>'default','path'=>'format-indent-more.png'],
    'fileMgr'    => ['dir'=>'default','path'=>'system-file-manager.png'],
    'fillup'     => ['dir'=>'default','path'=>'media-eject.png'],
    'help'       => ['dir'=>'default','path'=>'help-browser.png'],
    'home'       => ['dir'=>'default','path'=>'go-home.png'],
    'import'     => ['dir'=>'default','path'=>'format-indent-less.png'],
    'inv-adj'    => ['dir'=>'default','path'=>'inv-adjustment.png'],
    'inventory'  => ['dir'=>'default','path'=>'preferences-desktop-theme.png'],
    'invoice'    => ['dir'=>'default','path'=>'applix.png'],
    'journal'    => ['dir'=>'default','path'=>'journal.png'],
    'loading'    => ['dir'=>'default','path'=>'loading.gif'],
    'locked'     => ['dir'=>'default','path'=>'system-lock-screen.png'],
    'logout'     => ['dir'=>'default','path'=>'system-log-out.png'],
    'merge'      => ['dir'=>'default','path'=>'mail-reply-all.png'],
    'mimeDir'    => ['dir'=>'default','path'=>'folder.png'],
    'mimeDoc'    => ['dir'=>'default','path'=>'x-office-document.png'],
    'mimeDrw'    => ['dir'=>'default','path'=>'x-office-drawing.png'],
    'mimeHtml'   => ['dir'=>'default','path'=>'text-html.png'],
    'mimeImg'    => ['dir'=>'default','path'=>'image-x-generic.png'],
    'mimeLst'    => ['dir'=>'default','path'=>'text-x-generic-template.png'],
    'mimePdf'    => ['dir'=>'default','path'=>'pdficon.gif'],
    'mimePpt'    => ['dir'=>'default','path'=>'x-office-presentation.png'],
    'mimeTxt'    => ['dir'=>'default','path'=>'text-x-generic.png'],
    'mimeXls'    => ['dir'=>'default','path'=>'x-office-spreadsheet.png'],
    'mimeZip'    => ['dir'=>'default','path'=>'package-x-generic.png'],
    'mimeXML'    => ['dir'=>'default','path'=>'text-x-script.png'],
    'message'    => ['dir'=>'default','path'=>'reddot.png'],
    'more'       => ['dir'=>'default','path'=>'navigate-more.png'],
    'move'       => ['dir'=>'default','path'=>'view-fullscreen.png'],
    'new'        => ['dir'=>'default','path'=>'document-new.png'],
    'newFolder'  => ['dir'=>'default','path'=>'folder-new.png'],
    'next'       => ['dir'=>'default','path'=>'go-next.png'],
    'recur'      => ['dir'=>'default','path'=>'go-jump.png'],
    'register'   => ['dir'=>'default','path'=>'register.jpeg'],
    'rename'     => ['dir'=>'default','path'=>'accessories-text-editor.png'],
    'no_image'   => ['dir'=>'default','path'=>'emblem-important.png'],
    'open'       => ['dir'=>'default','path'=>'document-open.png'],
    'order'      => ['dir'=>'default','path'=>'signature.png'],
    'payment'    => ['dir'=>'default','path'=>'cash-register.png'],
    'phpmyadmin' => ['dir'=>'default','path'=>'phpmyadmin.jpg'],
    'pos'        => ['dir'=>'default','path'=>'computer.png'],
    'previous'   => ['dir'=>'default','path'=>'go-previous.png'],
    'preview'    => ['dir'=>'default','path'=>'document-print-preview.png'],
    'price'      => ['dir'=>'default','path'=>'price.png'],
    'print'      => ['dir'=>'default','path'=>'printer.png'],
    'profile'    => ['dir'=>'default','path'=>'preferences-desktop-locale.png'],
    'purchase'   => ['dir'=>'default','path'=>'package-x-generic.png'],
    'quote'      => ['dir'=>'default','path'=>'internet-group-chat.png'],
    'refresh'    => ['dir'=>'default','path'=>'view-refresh.png'],
    'report'     => ['dir'=>'default','path'=>'x-office-document.png'],
    'reset'      => ['dir'=>'default','path'=>'view-refresh.png'],
    'restore'    => ['dir'=>'default','path'=>'system-installer.png'],
    'roles'      => ['dir'=>'default','path'=>'applications-development.png'],
    'sales'      => ['dir'=>'default','path'=>'sales.png'],
    'save'       => ['dir'=>'default','path'=>'media-floppy.png'],
    'saveprint'  => ['dir'=>'default','path'=>'printsave.png'],
    'save_as'    => ['dir'=>'default','path'=>'document-save-as.png'],
    'search'     => ['dir'=>'default','path'=>'system-search.png'],
    'select_all' => ['dir'=>'default','path'=>'package-x-generic.png'],
    'settings'   => ['dir'=>'default','path'=>'applications-system.png'],
    'shipping'   => ['dir'=>'default','path'=>'package-x-generic.png'],
    'support'    => ['dir'=>'default','path'=>'edit-paste.png'],
    'tip'        => ['dir'=>'default','path'=>'dialog-information.png'],
    'toggle'     => ['dir'=>'default','path'=>'system-shutdown.png'],
    'tools'      => ['dir'=>'default','path'=>'preferences-system.png'],
    'transfer'   => ['dir'=>'default','path'=>'usb.png'],
    'trash'      => ['dir'=>'default','path'=>'user-trash.png'],
    'truck'      => ['dir'=>'default','path'=>'truck.png'],
    'unlock'     => ['dir'=>'default','path'=>'emblem-readonly.png'],
    'upload'     => ['dir'=>'default','path'=>'upload.jpg'],
    'up'         => ['dir'=>'default','path'=>'go-up.png'],
    'update'     => ['dir'=>'default','path'=>'system-software-update.png'],
    'users'      => ['dir'=>'default','path'=>'system-users.png'],
    'web'        => ['dir'=>'default','path'=>'internet-web-browser.png'],
    'work'       => ['dir'=>'default','path'=>'applications-development.png'],
];