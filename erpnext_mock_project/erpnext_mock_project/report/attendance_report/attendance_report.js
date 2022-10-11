// Copyright (c) 2022, erpnext_mock_project and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Attendance Report"] = {
	"filters": [
		{
			"fieldname":"from_date",
			"label": __("From Date"),
			"fieldtype": "Date",
			"width": "80",
			"reqd": 1,
			"default": frappe.datetime.month_start(frappe.datetime.get_today())
		},
		{
			"fieldname":"to_date",
			"label": __("To Date"),
			"fieldtype": "Date",
			"width": "80",
			"reqd": 1,
			"default": frappe.datetime.month_end(frappe.datetime.get_today())
		},
		{
			"fieldname":"employee",
			"label": __("Employee"),
			"fieldtype": "Link",
			"options" : "Employee",
			"width": "80",
			"reqd": 0
		},
		{
			"fieldname":"shift",
			"label": __("Shift Type"),
			"fieldtype": "Select",
			"options" :["","General","Night"],
			"width": "80",
			"reqd": 0
		},


	]
};
