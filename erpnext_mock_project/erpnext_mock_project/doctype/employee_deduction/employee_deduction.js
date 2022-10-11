// Copyright (c) 2022, erpnext_mock_project and contributors
// For license information, please see license.txt

frappe.ui.form.on('Employee Deduction', {
	employee:function(frm){
		frappe.call({
			"method": "erpnext_mock_project.erpnext_mock_project.doctype.employee_deduction.employee_deduction.deduction",
			"args": {
				 "name": frm.doc.employee
			},
			"callback": function(response) {
				
				 var employee = response.message;
				 console.log(employee)
				 if (employee) {
					  frm.set_value('employee_name',employee['0']['employee_name']);
				 } 
				 else {
					 frappe.msgprint("Employee not found");
				}
			}
		}); 
	}
	


});
frappe.ui.form.on('Deduction Calculation', {
	actualpaid_amount:function(frm,cdt,cdn){
		var d = locals[cdt][cdn];
		frappe.model.set_value(cdt, cdn, 'total', (d.onetime + d.recurring));
		frappe.model.set_value(cdt, cdn, 'balance', (d.total - d.actualpaid_amount));
		console.log(d.actualpaid_amount)
		if (d.month == 'Oct-22'){
			frappe.model.set_value(cdt, cdn, 'current_month_balance',d.balance);
		}
		frm.refresh_field("balance");

	},

	/*refresh:function(frm,cdt,cdn){
		var d = locals[cdt][cdn];
		frappe.model.set_value(cdt, cdn, 'total', (d.onetime + d.recurring));
		frm.refresh()
	}*/

});
frappe.ui.form.on('Deduction Details', {
	end_date:function(frm,cdt,cdn){
		var d = locals[cdt][cdn];
		if (d.start_date > d.end_date){
			frappe.msgprint("End date should be greater than Start date...")
			frm.refresh_field("end_date");
			}
			//cur_frm.clear_field("end_date")
	
	},
	deduction_type:function(frm,cdt,cdn){
		var d= locals[cdt][cdn];
		if (d.deduction_type == 'Onetime'){
			console.log(d.deduction_type);
			frappe.model.set_value(cdt,cdn,'end_date',frappe.datetime.month_end(d.start_date));
			frappe.model.set_value(cdt,cdn,'start_date',frappe.datetime.month_start(d.start_date));
		  	//frm.set_df_property('end_date',"read_only",1);
			//frappe.model.set_df_property("end_date", "read_only",frm.doc.deduction_type=="Onetime");
		}
	 },
	 amount:function(frm,cdt,cdn){
		var month=[];
		var d= locals[cdt][cdn];
		if (d.amount == 0 ){
			frappe.throw("Amount should be greater than 0(ZERO)");
			frm.refresh_field("deduction_calculation");
		}
		if (d.amount > 0){
		if (d.deduction_type == 'Onetime'){
			
			var child = cur_frm.add_child("deduction_calculation");
			child.onetime=d.amount
			frm.refresh_field("deduction_calculation");
			frappe.call({
				"method": "erpnext_mock_project.erpnext_mock_project.doctype.employee_deduction.employee_deduction.convertDateFormat",
				"args": {
					 "start_date": d.start_date
				},
				"callback": function(response) {
					if(response.message){
						child.month=response.message
					
					}
					frm.refresh_field("deduction_calculation");
				}
					
			});
		}
		else{
			var start_date= new Date(d.start_date)
			var end_date=new Date(d.end_date)
			var numberOfMonths = (end_date.getFullYear() - start_date.getFullYear()) * 12 + (end_date.getMonth() - start_date.getMonth()) + 1;	

			frappe.call({
				"method": "erpnext_mock_project.erpnext_mock_project.doctype.employee_deduction.employee_deduction.convertDateFormat",
				"args": {
					 "start_date": d.start_date
				},
				"callback": function(response) {
					 var convert_date
					 var convert = response.message;
					 if (convert) {
						for(var row=0;row<numberOfMonths;row++){
					convert_date=(frappe.datetime.add_months(d.start_date,(row+1)-1))
					frappe.call({
						"method": "erpnext_mock_project.erpnext_mock_project.doctype.employee_deduction.employee_deduction.convertDateFormat",
						"args": {
							 "start_date": convert_date
						},
						"callback": function(response) {
							 var con= response.message;
							 if (con){
								var child = cur_frm.add_child("deduction_calculation");
								child.month=con
								
								//console.log(con)
								child.recurring= (d.amount)/(numberOfMonths)
							 }
					frm.refresh_field("deduction_calculation");
						}
					 });
					
					}//forloop end

				}
				}
			});

		}
	}
		
	}
});  
