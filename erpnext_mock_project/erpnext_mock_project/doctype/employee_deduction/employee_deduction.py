# Copyright (c) 2022, erpnext_mock_project and contributors
# For license information, please see license.txt
import frappe
#from frappe.model.document import Document
import datetime

@frappe.whitelist()
def deduction(name):
    data = frappe.db.sql(""" select DISTINCT employee_name from `tabEmployee` where name=%s """,(name),as_dict=1)
    return data


@frappe.whitelist()
def convertDateFormat(start_date):
    start_date=str(start_date)
    date=datetime.datetime.strptime(start_date, '%Y-%m-%d')
    return date.strftime('%b-%y')
@frappe.whitelist()        
def month_list(b):
    
    l=[]
    l.append(b)
        
    return l
