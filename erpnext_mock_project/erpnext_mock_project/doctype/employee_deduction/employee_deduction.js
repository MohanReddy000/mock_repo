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
	},
	validate:function(frm){
		if (frappe.db.exists('Employee Deduction',frm.doc.employee_name)){
			frappe.throw("Employee Aldredy Exists..")
		}
	}
});
frappe.ui.form.on('Deduction Calculation', {
	actualpaid_amount:function(frm,cdt,cdn){
		var d = locals[cdt][cdn];
		frappe.model.set_value(cdt, cdn, 'total', (d.onetime + d.recurring));
		frappe.model.set_value(cdt, cdn, 'balance', (d.total - d.actualpaid_amount));
		frm.refresh_field("balance");
		var Date=frappe.datetime.get_today()
		frappe.call({
			"method": "erpnext_mock_project.erpnext_mock_project.doctype.employee_deduction.employee_deduction.convertDateFormat",
			"args": {
				 "start_date": Date
			},
			"callback": function(response) {
				 var msg= response.message;
				 for (var i=0;i<frm.doc.deduction_calculation.length;i++){
				 if (frm.doc.deduction_calculation[i]['month']===msg) {
					  frm.set_value('current_month_balance',frm.doc.deduction_calculation[i]['balance']);
				 } 
			}
			frm.refresh_field("balance");
			}
		}); 
		frappe.call({
			"method": "erpnext_mock_project.erpnext_mock_project.doctype.employee_deduction.employee_deduction.convertDateFormat",
			"args": {
				 "start_date": Date
			},
			"callback": function(response) {
				 var msg= response.message;
				 for (var i=0;i<frm.doc.deduction_calculation.length;i++){
				 if (frm.doc.deduction_calculation[i]['month']===msg) {
					  frm.set_value('current_month_balance',frm.doc.deduction_calculation[i]['balance']);
				 } 
			}
			frm.refresh_field("balance");
			}
		}); 
		var sum=0;
		$.each(frm.doc.deduction_calculation,function(idx, row){			
			var Date1=frm.doc.deduction_calculation[idx]['month']
		frappe.call({
			"method": "erpnext_mock_project.erpnext_mock_project.doctype.employee_deduction.employee_deduction.till_month",
			"args": {
				 "month":Date1
			},
			"callback": function(response) {
				 var mseg= response.message;
				 if (mseg=="True") {
					sum=sum+frm.doc.deduction_calculation[idx]['balance']
					frm.set_value('total_balance',sum);
				 }
			frm.refresh_field("balance");
			}
		}); 
	})
}
});
frappe.ui.form.on('Deduction Details', {
	end_date:function(frm,cdt,cdn){
		var d = locals[cdt][cdn];
		if (d.start_date > d.end_date){
			frappe.msgprint("End date should be greater than Start date...")
			frm.refresh_field("end_date");
			}
	},
	deduction_type:function(frm,cdt,cdn){
		var d= locals[cdt][cdn];
		if (d.deduction_type == 'Onetime'){
			console.log(d.deduction_type);
			frappe.model.set_value(cdt,cdn,'end_date',frappe.datetime.month_end(d.start_date));
			frappe.model.set_value(cdt,cdn,'start_date',frappe.datetime.month_start(d.start_date));
		}
	 },
	 amount:function(frm,cdt,cdn){
		var month_list=[];
		console.log(frm.doc.amount)
		var d= locals[cdt][cdn];
		if (d.amount == 0 ){
			frappe.throw("Amount should be greater than 0(ZERO)");
			frm.refresh_field("deduction_calculation");
		}
		if (d.amount > 0){
		if (d.deduction_type == 'Onetime'){
			frm.refresh_field("deduction_calculation");
			frappe.call({
				"method": "erpnext_mock_project.erpnext_mock_project.doctype.employee_deduction.employee_deduction.convertDateFormat",
				"args": {
					 "start_date": d.start_date
				},
				"callback": function(response) {
				
					if (!(month_list.includes(response.message))){
						$.each(frm.doc.deduction_calculation,function(idx, row){
							month_list.push(frm.doc.deduction_calculation[idx]['month'])
						});
						if (!(month_list.includes(response.message))){
							var child = cur_frm.add_child("deduction_calculation");
							child.month=response.message
							child.onetime=d.amount
							child.total=d.amount
							child.balance=d.amount
						}
						else{
							$.each(frm.doc.deduction_calculation,function(idx, row){
								if (month_list.includes(response.message) && response.message==frm.doc.deduction_calculation[idx]['month']){
									frm.doc.deduction_calculation[idx]['onetime']=frm.doc.deduction_calculation[idx]['onetime']+d.amount;
									frm.doc.deduction_calculation[idx]['total']=frm.doc.deduction_calculation[idx]['total']+d.amount;
									frm.doc.deduction_calculation[idx]['balance']=frm.doc.deduction_calculation[idx]['total'];


								}
								
							});
					}
				}
				frm.refresh_field("deduction_calculation");
				}
			});
		}
		else{
			var start_date= new Date(d.start_date);
			var end_date=new Date(d.end_date);
			var numberOfMonths = (end_date.getFullYear() - start_date.getFullYear()) * 12 + (end_date.getMonth() - start_date.getMonth()) + 1;
			var convert_date;
			for(var row1=0;row1<numberOfMonths;row1++){
				convert_date=(frappe.datetime.add_months(d.start_date,row1))
				console.log(frappe.datetime.add_months(d.start_date,(row1)))
				frappe.call({
						"method": "erpnext_mock_project.erpnext_mock_project.doctype.employee_deduction.employee_deduction.convertDateFormat",
						"args": {
							 "start_date": convert_date
						},
						async:false,
						"callback": function(response) {
							 var con= response.message;
							 if (!(month_list.includes(con))){
								$.each(frm.doc.deduction_calculation,function(idx, row){
									month_list.push(frm.doc.deduction_calculation[idx]['month'])
								});
								if (!(month_list.includes(con))){
										var child = cur_frm.add_child("deduction_calculation");
										child.month=con
										child.recurring= (d.amount)/(numberOfMonths)
										child.total=(d.amount)/(numberOfMonths)
										child.balance=(d.amount)/(numberOfMonths)
								}
								else{
									$.each(frm.doc.deduction_calculation,function(idx, row){
										
										if (response.message==frm.doc.deduction_calculation[idx]['month']){
											frm.doc.deduction_calculation[idx]['recurring']=frm.doc.deduction_calculation[idx]['recurring']+(d.amount)/(numberOfMonths);
											frm.doc.deduction_calculation[idx]['total']=frm.doc.deduction_calculation[idx]['total']+(d.amount)/(numberOfMonths);
											frm.doc.deduction_calculation[idx]['balance']=frm.doc.deduction_calculation[idx]['total'];

										}
								});
							}
						}		 
					frm.refresh_field("deduction_calculation");
						}
					 });
					
					}//forloop end
				
		}
	}	
	}
});  
