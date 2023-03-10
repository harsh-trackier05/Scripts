const axios = require("axios");
const querystring = require('querystring');
require("dotenv").config({path:__dirname+'/../.env'});

var token = "token";

const readUrl = process.env.READ_URL;
const writeUrl = process.env.WRITE_URL;
const tokenRenewUrl = process.env.TOKEN_RENEW_URL;

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), ms);
    })
}


let createRowObject = (values) => {
    let row = {};
    row.bill = values?.bill_number;
    row.vandorName = values?.vendor_name;
    row.reference = values?.reference_number;
    row.balanceDue = values?.balance;
    row.status = values?.status;
    row.amount = values?.total;
    row.date = values?.date;
    row.billId = values?.bill_id;
    return row;
}

let fetchingVendorsData = async () => {
    const session_url = readUrl;
    let res;
    var config = {
        method: 'get',
        url: session_url,
    };
    try {
        res =  await axios(config);
    }catch(error){
        res = error;
    }
    return res?.data?.data;
}

let wirtingVendorData = async (values) => {
    let session_url = writeUrl+'?';
    const queryString = querystring.stringify(values);
    session_url += queryString;
    let res;
    var config = {
        method: 'get',
        url: session_url,
    };
    try {
        res =  await axios(config);
    }catch(error){
        res = error;
    }
    return res?.data;
};

let renewToken = async () => {
    const session_url = tokenRenewUrl;
    var config = {
        method: 'post',
        url: session_url,
    };
    try {
        res =  await axios(config);
        token = res?.data?.access_token;
    }catch(error){
        console.log(error?.response?.data);
    }
}


let getVendorBillingData = async (vendorId,page) => {
    const session_url = 'https://www.zohoapis.in/books/v3/bills?vendor_id='+vendorId+'&page='+page;
    let res;
    var config = {
        method: 'get',
        url: session_url,
        headers: { 'Authorization': 'Zoho-oauthtoken ' + token }
    };
    try {
        res =  await axios(config);
    }catch(error){
        res = error?.response;
    }
    return res?.data;
}

let finalRun = async () => {
    let vendorIdData = await fetchingVendorsData();
    for(vendor of vendorIdData) {
        let id = vendor?.Vendor_ID;
        let check = true;
        let page = 1;
        console.log("* Vendor Id : "+id);
        while(check){
            let vendorBillData = await getVendorBillingData(id,page);
            if(vendorBillData?.code == 57) {
                console.log("  -> renewToken token got called");
                await renewToken();
                vendorBillData = await getVendorBillingData(id,page);
            }
            if(vendorBillData == null) {
                console.log("   * No vendor found with given id : "+id+" vendor name : "+vendor?.Vendor_Name);
                break;
            }
            console.log("   from page number: "+page);
            for(vendorBill of vendorBillData?.bills || []) {
                console.log("        adding data in row");
                let result = await wirtingVendorData(createRowObject(vendorBill));
                console.log("           "+result?.data?.message);
            }
            page++;
            check = vendorBillData?.page_context?.has_more_page;
        }
    }
}

(async function main() {
    while (true) {
        await finalRun();
        console.log("Script run successfully sleeping for 1 hour");
        await sleep(3600 * 1000);
    }
}()).then(d => true).catch(e => console.log("Script failed"))
