# Copyright (c) 2022, erpnext_mock_project and contributors
# For license information, please see license.txt
import frappe
#from frappe.model.document import Document
from frappe.model.document import Document
import datetime
from datetime import date
from dateutil import parser
from dateutil import relativedelta


class EmployeeDeduction(Document):
    pass

@frappe.whitelist()
def deduction(name):
    data = frappe.db.sql(""" select DISTINCT employee_name from `tabEmployee` where name=%s """,(name),as_dict=1)
    #query=frappe.db.sql(""" select employee_name from `tabEmployee Deduction` """,as_dict=1)
    return data


@frappe.whitelist()
def convertDateFormat(start_date):
    month=[]
    start_date=str(start_date)
    date=datetime.datetime.strptime(start_date, '%Y-%m-%d')
    month+=[(date.strftime('%b-%y'))]
    return date.strftime('%b-%Y')   

@frappe.whitelist()
def till_month(month):
    today =datetime.date.today()
    nextMonthDate = today + relativedelta.relativedelta(months=1,day=1)
    today_str=str(nextMonthDate)
    date_time = (parser.parse(month)).date()
    date_str=str(date_time)
    today1=datetime.datetime.strptime(today_str,'%Y-%m-%d')
    month_date=datetime.datetime.strptime(date_str,'%Y-%m-%d')
    temp=""
    if month_date <= today1:
        temp="True"
    return temp

