# Copyright (c) 2022, erpnext_mock_project and contributors
# For license information, please see license.txt
from __future__ import unicode_literals
from this import d
import frappe
from frappe import _
from frappe.utils import date_diff

def execute(filters=None):
	
	conditions = get_conditions(filters)
	month_days=date_difference(filters)
	working_days=total_working_days(filters)
	columns = get_columns()
	status_cond=status_condition(filters)
	data = get_data(filters,conditions,month_days,working_days,status_cond)
	chart = get_chart_data(data)
	report_summary = get_report_summary(data)

	return columns, data, None, chart, report_summary
def get_columns():
	columns = [
		{
			"fieldname": "employee",
			"label": _("Employee Id"),
			"fieldtype": "Data",
			"options": "Employee",
			"width": 160
		},
		{
			"fieldname": "employeename",
			"label": _("Employee Name"),
			"fieldtype": "Data",
			"width": 120
		},
		{
			"fieldname": "no_of_days_in_month",
			"label": _("No Of Days In Month"),
			"fieldtype": "Data",
			"width": 160

		},
		{
			"fieldname":"total_working_days",
			"label": _("Total Working Days"),
			"fieldtype": "Data",
			"width": "160"

		},
		{
			"fieldname":"present_days",
			"label": _("Present Days "),
			"fieldtype": "Data",
			"options" :["Company","dividual"],
			"width": "140"
			
		},
		{
			"fieldname":"absent_days",
			"label": _("Absent Days"),
			"fieldtype": "Data",
			"width": "140"
		},
		{
			"fieldname":"shift_type",
			"label": _("Shift Type"),
			"fieldtype": "Data",
			"width": "120"

		},
		{
			"fieldname":"halfdays_days",
			"label": _("No Of Half Days"),
			"fieldtype": "Data",
			"width": "160"

		}
		
	]
	return columns
def get_data(filters,conditions,month_days,working_days,status_cond):
	data = frappe.db.sql(f"""Select  DISTINCT employee as employee,
	employee_name as employeename,
	{month_days} as no_of_days_in_month,
	{working_days} as total_working_days,
	shift as shift_type,
	(SELECT count(status) FROM `tabAttendance` where status="Present" and employee_name=employeename and shift=shift_type {status_cond}) as 'present_days',
	(SELECT count(status) FROM `tabAttendance` where status="Absent" and employee_name=employeename and shift=shift_type {status_cond}) as 'absent_days',
	(SELECT count(status) FROM `tabAttendance` where status="Half Day" and employee_name=employeename and shift=shift_type {status_cond}) as 'halfdays_days'
	from `tabAttendance` 
	where {conditions} """.format(month_days=month_days,working_days=working_days,status_cond=status_cond,conditions=conditions),as_dict = True)
	
	return data
def status_condition(filters):
	conditions1=""
	if filters.get('from_date') and filters.get('to_date'):
		conditions1 += "and attendance_date between '{0}' and '{1}'".format(filters.get('from_date'), filters.get('to_date'))
	return conditions1

def get_conditions(filters):
	conditions = ""
	if filters.get('from_date') and filters.get('to_date'):
		conditions += " attendance_date between '{0}' and '{1}'".format(filters.get('from_date'), filters.get('to_date'))
	if filters.get('employee'):
		conditions += " AND  employee = '{}'".format(filters.get('employee'))
	if filters.get('shift'):
		conditions += " AND  shift = '{}'".format(filters.get('shift'))
	
	return conditions
def date_difference(filters):
	diff=date_diff(filters.get('to_date'),filters.get('from_date'))
	return diff+1

def holidays(filters):
	cond=holiday_condition(filters)
	data1=frappe.db.sql(f"""select count(holiday_date) from `tabHoliday` where {cond} """.format(cond=cond),as_list=True)
	return data1
def holiday_condition(filters):
	condition = ""
	if filters.get('from_date') and filters.get('to_date'):
		condition += "holiday_date between '{0}' and '{1}'".format(filters.get('from_date'), filters.get('to_date'))
	return condition
def total_working_days(filters):
	month_days=date_difference(filters)
	no_of_holidays=holidays(filters)
	convert_string=str(no_of_holidays[0][0])
	holiday_value=int(convert_string)
	working_days=month_days-holiday_value
	return working_days

def get_chart_data(data):
	labels = []
	present_days = []
	for project in data:
		labels.append(project.employeename)
		present_days.append(project.present_days)
	return {
		"data": {
			'labels': labels[:50],
			'datasets': [
				{
					"name": "PresentDays",
					"values": present_days[:30]
				},
				
			]
		},
		"type": "bar",
		"colors": ["#053559"],
		"barOptions": {
			"stacked": False
		}
	}

def get_report_summary(data):
	if not data:
		return None
	present_days = sum([project.present_days for project in data])
	absent_days=sum([project.absent_days for project in data])
	halfdays_days=sum([project.halfdays_days for project in data])
	total=present_days+absent_days+halfdays_days
	return [
		{
			"value": total,
			"indicator": "Blue",
			"label": "Total Days",
			"datatype": "Int",
		},
		{
			"value": present_days,
			"indicator": "Green",
			"label": "Present Days",
			"datatype": "Int",
		},
		{
			"value": absent_days,
			"indicator": "Red",
			"label": "Absent Days",
			"datatype": "Int",
		},
		{
			"value": halfdays_days,
			"indicator": "#db6927",
			"label": "Halfdays Days",
			"datatype": "Int",
		},
		
	]
