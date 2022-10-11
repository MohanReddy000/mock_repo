# Copyright (c) 2022, erpnext_mock_project and contributors
# For license information, please see license.txt

import frappe
from frappe import _


def execute(filters=None):
	conditions = get_conditions(filters)
	columns = get_columns()
	data = get_data(filters,conditions)
	return columns,data
def get_columns():
	columns = [
		{
			"fieldname": "employee",
			"label": _("Employee Id"),
			"fieldtype": "Link",
			"options": "Employee",
			"width": 160
		},
		{
			"fieldname": "employee_name",
			"label": _("Employee Name"),
			"fieldtype": "Date",
			"width": 120
		},
		{
			"fieldname": "no_of_days_in_month",
			"label": _("No Of Days In Month"),
			"fieldtype": "Data",
			"width": 120

		},
		{
			"fieldname":"total_working_days",
			"label": _("Total Working Days"),
			"fieldtype": "Data",
			"width": "160"

		},
		{
			"fieldname":"status",
			"label": _("Present Days "),
			"fieldtype": "Data",
			"options" :["Company","dividual"],
			"width": "100"
			
		},
		{
			"fieldname":"status",
			"label": _("Absent Days"),
			"fieldtype": "Data",
			"width": "100"
		},
		{
			"fieldname":"shift_type",
			"label": _("Shift Type"),
			"fieldtype": "Data",
			"width": "120"

		},
		{
			"fieldname":"status",
			"label": _("No Of Half Days"),
			"fieldtype": "Data",
			"width": "100"

		}
		
	]
	return columns
def get_data(filters,conditions):
	data = frappe.db.sql(f"""Select employee as employee,
	employee_name as employee_name,
	(SELECT DATEDIFF(day, 'start_date', 'end_date') as no_of_days_in_month)),
	(SELECT count(no_of_days_in_month-holidays) as total_working_days )
	(SELECT count(status) as 'present_days'  FROM `tabAttendance` where status="Present" ),
	(SELECT count(status) as 'absent_days'  FROM `tabAttendance` where status="Absent" ),shift,
	(SELECT count(status) as 'halfdays_days'  FROM `tabAttendance` where status="Half Day")
	from `tabAttendance` 
	where {conditions} """.format(conditions=conditions),as_dict = True)
	
	return data


def get_conditions(filters):
	conditions = ""
	if filters.get('from_date') and filters.get('to_date'):
		conditions += " attendance_date between '{0}' and '{1}'".format(filters.get('from_date'), filters.get('to_date'))
	if filters.get('employee'):
		conditions += " AND  employee = '{}'".format(filters.get('employee'))
	if filters.get('shift'):
		conditions += " AND  shift = '{}'".format(filters.get('shift'))
	
	return conditions

